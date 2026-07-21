from fastapi.testclient import TestClient
from database.database import init_db
from main import app

# Initialize DB tables for testing
init_db()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "documents_count" in data
    assert "vector_store_indexed" in data

def test_settings_get_and_update():
    get_res = client.get("/settings")
    assert get_res.status_code == 200
    settings_data = get_res.json()
    assert settings_data["chunk_size"] > 0

    put_res = client.put("/settings", json={"chunk_size": 600, "top_k": 5})
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["chunk_size"] == 600
    assert updated["top_k"] == 5

def test_chat_mock_endpoint():
    payload = {
        "question": "What is the primary objective of InsightRAG?",
        "stream": False
    }
    res = client.post("/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "citations" in data
