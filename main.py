from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import cv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    logger.info("=== Starting Application ===")
    logger.info(f"SUPABASE_URL exists: {bool(settings.SUPABASE_URL)}")
    logger.info(f"SUPABASE_KEY exists: {bool(settings.SUPABASE_KEY)}")
    logger.info(f"GEMINI_API_KEY exists: {bool(settings.GEMINI_API_KEY)}")

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specifica i domini consentiti
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includi i router
app.include_router(cv.router)

@app.get("/")
async def root():
    return {"message": "CV Parser API"} 