# NIRDHOOM OR-Tools dispatch service

Run locally:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8787
```

Then set:

```text
DISPATCH_SERVICE_URL=http://localhost:8787/solve
```

The solver uses vehicle routing with time windows, per-machine acreage capacity, travel time and a high penalty for dropped fields. The Vercel `/api/dispatch` route calls this service when configured and otherwise returns a deterministic demo fallback.
