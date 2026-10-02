from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt
import hmac
import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

app = FastAPI(title="NIRDHOOM OR-Tools Dispatch", version="1.1.0")

MAX_FIELDS = 200
MAX_MACHINES = 50
SPEED_KMH = 35.0


def valid_point(value: Any) -> bool:
    return (
        isinstance(value, dict)
        and isinstance(value.get("id"), str)
        and bool(value["id"].strip())
        and -90 <= float(value.get("lat", 999)) <= 90
        and -180 <= float(value.get("lng", 999)) <= 180
    )


def km(a: dict[str, Any], b: dict[str, Any]) -> float:
    r = 6371.0
    la1, la2 = radians(float(a["lat"])), radians(float(b["lat"]))
    dlat = radians(float(b["lat"]) - float(a["lat"]))
    dlng = radians(float(b["lng"]) - float(a["lng"]))
    h = sin(dlat / 2) ** 2 + cos(la1) * cos(la2) * sin(dlng / 2) ** 2
    return 2 * r * asin(sqrt(min(1.0, h)))


def travel_minutes(a: dict[str, Any], b: dict[str, Any]) -> int:
    return max(1, int(round(km(a, b) / SPEED_KMH * 60)))


def deadline_minutes(value: str | None) -> int:
    if not value:
        return 7 * 24 * 60
    try:
        raw = value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(1, int((dt - datetime.now(timezone.utc)).total_seconds() / 60))
    except (TypeError, ValueError):
        return 7 * 24 * 60


def validate_payload(fields: list[Any], machines: list[Any]) -> None:
    if not fields or len(fields) > MAX_FIELDS:
        raise HTTPException(status_code=400, detail=f"fields must contain 1-{MAX_FIELDS} records")
    if not machines or len(machines) > MAX_MACHINES:
        raise HTTPException(status_code=400, detail=f"machines must contain 1-{MAX_MACHINES} records")

    field_ids: set[str] = set()
    for field in fields:
        try:
            acres = float(field.get("acres", 0))
        except (TypeError, ValueError):
            acres = 0
        if (
            not valid_point(field)
            or field["id"] in field_ids
            or not 0 < acres <= 10000
        ):
            raise HTTPException(status_code=400, detail="Invalid field payload")
        field_ids.add(field["id"])

    machine_ids: set[str] = set()
    for machine in machines:
        try:
            capacity = float(machine.get("capacity_acres_day", 0))
        except (TypeError, ValueError):
            capacity = 0
        if (
            not valid_point(machine)
            or machine["id"] in machine_ids
            or not 0 < capacity <= 10000
        ):
            raise HTTPException(status_code=400, detail="Invalid machine payload")
        machine_ids.add(machine["id"])


@app.get("/health")
def health():
    return {"ok": True, "solver": "Google OR-Tools VRPTW", "version": app.version}


@app.post("/solve")
def solve(payload: dict[str, Any], authorization: str | None = Header(default=None)):
    expected = os.environ.get("DISPATCH_SERVICE_TOKEN", "")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not expected or not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")

    fields = payload.get("fields") or []
    machines = [m for m in (payload.get("machines") or []) if m.get("status") != "OFFLINE"]
    validate_payload(fields, machines)

    # Each machine gets its own depot node. This avoids pretending that all vehicles
    # start from the first machine's location.
    depots = [
        {"id": f"DEPOT:{m['id']}", "lat": float(m["lat"]), "lng": float(m["lng"]), "acres": 0.0}
        for m in machines
    ]
    nodes = depots + [
        {
            "id": str(f["id"]),
            "lat": float(f["lat"]),
            "lng": float(f["lng"]),
            "acres": float(f.get("acres", 0)),
            "deadline": f.get("deadline"),
        }
        for f in fields
    ]

    starts = list(range(len(machines)))
    ends = list(range(len(machines)))
    manager = pywrapcp.RoutingIndexManager(len(nodes), len(machines), starts, ends)
    routing = pywrapcp.RoutingModel(manager)

    def transit(from_index: int, to_index: int) -> int:
        return travel_minutes(nodes[manager.IndexToNode(from_index)], nodes[manager.IndexToNode(to_index)])

    transit_idx = routing.RegisterTransitCallback(transit)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_idx)

    routing.AddDimension(transit_idx, 24 * 60, 7 * 24 * 60, False, "Time")
    time_dim = routing.GetDimensionOrDie("Time")

    for depot_index in range(len(machines)):
        time_dim.CumulVar(manager.NodeToIndex(depot_index)).SetRange(0, 7 * 24 * 60)

    for offset, field in enumerate(fields, start=len(machines)):
        idx = manager.NodeToIndex(offset)
        time_dim.CumulVar(idx).SetRange(0, deadline_minutes(field.get("deadline")))

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

    # Dropping a field is allowed when hard constraints make full assignment
    # impossible; the API returns those IDs explicitly for human review.
    for node in range(len(machines), len(nodes)):
        acres = nodes[node]["acres"]
        routing.AddDisjunction([manager.NodeToIndex(node)], 1_000_000 + int(acres * 10_000))

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    params.time_limit.seconds = 3

    solution = routing.SolveWithParameters(params)
    if solution is None:
        raise HTTPException(status_code=409, detail="No feasible dispatch plan")

    routes = []
    assigned: set[str] = set()

    for vehicle, machine in enumerate(machines):
        index = routing.Start(vehicle)
        stops: list[str] = []
        total_acres = 0.0
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node >= len(machines):
                field_id = nodes[node]["id"]
                stops.append(field_id)
                assigned.add(field_id)
                total_acres += nodes[node]["acres"]
            index = solution.Value(routing.NextVar(index))

        routes.append({
            "machine_id": machine["id"],
            "stops": stops,
            "total_acres": round(total_acres, 2),
            "status": "PLANNED" if stops else "IDLE",
        })

    unassigned = [str(f["id"]) for f in fields if str(f["id"]) not in assigned]
    return {
        "engine": "ortools-v1.1",
        "routes": routes,
        "unassigned": unassigned,
        "objective": int(solution.ObjectiveValue()),
        "constraints": {
            "max_fields": MAX_FIELDS,
            "machine_capacity_acres_day": True,
            "deadline_windows": True,
            "vehicle_specific_depots": True,
            "travel_speed_kmh": SPEED_KMH,
        },
    }
