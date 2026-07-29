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

import os

# Allow all origins so the Vercel frontend can always reach this Railway backend.
# For a production app with auth, restrict this to specific Vercel URLs instead.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Blinkit Discovery Engine Backend (SQLite)"}

