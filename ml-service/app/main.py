from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.routes import router

app = FastAPI(
    title="Fraud Detection ML Service",
    description="Rule-based and ML-powered fraud scoring service",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Fraud Detection ML Service"}
