from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt
import hmac
import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

app = FastAPI(title="NIRDHOOM OR-Tools Dispatch", version="1.0.0")


def km(a: dict[str, Any], b: dict[str, Any]) -> float:
    r = 6371.0
    la1, la2 = radians(float(a["lat"])), radians(float(b["lat"]))
    dlat = radians(float(b["lat"]) - float(a["lat"]))
    dlng = radians(float(b["lng"]) - float(a["lng"]))
    h = sin(dlat / 2) ** 2 + cos(la1) * cos(la2) * sin(dlng / 2) ** 2
    return 2 * r * asin(sqrt(h))


def deadline_minutes(value: str | None) -> int:
    if not value:
        return 7 * 24 * 60
    try:
        raw = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(60, int((dt - datetime.now(timezone.utc)).total_seconds() / 60))
    except ValueError:
        return 7 * 24 * 60


@app.get("/health")
def health():
    return {"ok": True, "solver": "Google OR-Tools VRPTW"}


@app.post("/solve")
def solve(payload: dict[str, Any], authorization: str | None = Header(default=None)):
    expected = os.environ.get("DISPATCH_SERVICE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not expected or not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
    fields = payload.get("fields") or []
    machines = [m for m in payload.get("machines") or [] if m.get("status") != "OFFLINE"]
    if not fields or not machines:
        return {"engine": "ortools", "routes": [], "unassigned": [f.get("id") for f in fields]}

    nodes = [{"id": "DEPOT", "lat": float(machines[0]["lat"]), "lng": float(machines[0]["lng"]), "acres": 0}]
    nodes.extend({"id": str(f["id"]), "lat": float(f["lat"]), "lng": float(f["lng"]), "acres": float(f.get("acres", 0)), "deadline": f.get("deadline")} for f in fields)
    n = len(nodes)
    matrix = [[max(1, int(round(km(nodes[i], nodes[j]) / 35 * 60))) for j in range(n)] for i in range(n)]
    windows = [(0, 7 * 24 * 60)] + [(0, deadline_minutes(f.get("deadline"))) for f in fields]

    manager = pywrapcp.RoutingIndexManager(n, len(machines), 0)
    routing = pywrapcp.RoutingModel(manager)

    def transit(from_index: int, to_index: int) -> int:
        return matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit_idx = routing.RegisterTransitCallback(transit)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_idx)

    routing.AddDimension(transit_idx, 24 * 60, 7 * 24 * 60, False, "Time")
    time_dim = routing.GetDimensionOrDie("Time")
    for i, window in enumerate(windows):
        idx = manager.NodeToIndex(i)
        time_dim.CumulVar(idx).SetRange(window[0], window[1])

    def demand(index: int) -> int:
        return int(round(nodes[manager.IndexToNode(index)]["acres"] * 100))

    demand_idx = routing.RegisterUnaryTransitCallback(demand)
    routing.AddDimensionWithVehicleCapacity(
        demand_idx,
        0,
        [max(1, int(round(float(m.get("capacity_acres_day", 0)) * 100))) for m in machines],
        True,
        "Capacity",
    )

    # High drop penalty keeps service inside the optimization objective when hard windows make a full plan infeasible.
    for node in range(1, n):
        routing.AddDisjunction([manager.NodeToIndex(node)], 1_000_000 + int(nodes[node]["acres"] * 10_000))

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    params.time_limit.seconds = 3
    solution = routing.SolveWithParameters(params)
    if solution is None:
        raise HTTPException(status_code=409, detail="No feasible dispatch plan")

    routes = []
    assigned = set()
    for vehicle in range(len(machines)):
        index = routing.Start(vehicle)
        stops = []
        total_acres = 0.0
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node:
                fid = nodes[node]["id"]
                stops.append(fid)
                assigned.add(fid)
                total_acres += nodes[node]["acres"]
            index = solution.Value(routing.NextVar(index))
        routes.append({"machine_id": machines[vehicle]["id"], "stops": stops, "total_acres": round(total_acres, 2), "status": "PLANNED" if stops else "IDLE"})

    unassigned = [f["id"] for f in fields if str(f["id"]) not in assigned]
    return {"engine": "ortools", "routes": routes, "unassigned": unassigned, "objective": int(solution.ObjectiveValue())}
