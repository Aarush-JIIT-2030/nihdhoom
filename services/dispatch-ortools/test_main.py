import os
import unittest

from fastapi.testclient import TestClient

os.environ["DISPATCH_SERVICE_TOKEN"] = "test-token"

from main import app  # noqa: E402

client = TestClient(app)


class DispatchServiceTests(unittest.TestCase):
    def payload(self):
        return {
            "fields": [
                {"id": "F1", "lat": 30.20, "lng": 75.80, "acres": 3, "deadline": None},
                {"id": "F2", "lat": 30.21, "lng": 75.81, "acres": 4, "deadline": None},
            ],
            "machines": [
                {"id": "M1", "lat": 30.19, "lng": 75.79, "capacity_acres_day": 10, "status": "IDLE"},
            ],
        }

    def test_health(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])

    def test_requires_token(self):
        response = client.post("/solve", json=self.payload())
        self.assertEqual(response.status_code, 401)

    def test_solves_and_assigns_each_field_once(self):
        response = client.post(
            "/solve",
            json=self.payload(),
            headers={"Authorization": "Bearer test-token"},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        assigned = [field_id for route in body["routes"] for field_id in route["stops"]]
        self.assertEqual(sorted(assigned), ["F1", "F2"])
        self.assertEqual(body["unassigned"], [])
        self.assertEqual(body["routes"][0]["total_acres"], 7.0)

    def test_rejects_duplicate_field_ids(self):
        payload = self.payload()
        payload["fields"][1]["id"] = "F1"
        response = client.post(
            "/solve",
            json=payload,
            headers={"Authorization": "Bearer test-token"},
        )
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
