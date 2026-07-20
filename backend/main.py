from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import init_db
from api.documents import router as documents_router
from api.chat import router as chat_router
from api.settings import router as settings_router
from api.health import router as health_router
from core.logger import logger

app = FastAPI(
    title="InsightRAG API",
    description="Production-grade clean Retrieval-Augmented Generation engine for technical document research.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing InsightRAG SQLite database tables...")
    init_db()
    logger.info("InsightRAG API backend is ready.")

app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(settings_router)
app.include_router(health_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to InsightRAG API",
        "docs": "/docs",
        "health": "/health"
    }
