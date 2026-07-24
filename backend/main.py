from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ingest
from database import engine, Base
import models.db_models

from dotenv import load_dotenv
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blinkit Discovery Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Blinkit Discovery Engine Backend (SQLite)"}

