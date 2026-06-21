from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Import all models before create_all so SQLAlchemy registers them
from app.models.fire import Fire
from app.models.earthquake import Earthquake

from app.routers.fires import router as fire_router
from app.routers.earthquakes import router as earthquake_router

from apscheduler.schedulers.background import BackgroundScheduler
from app.ingestion.firms_worker import FIRMSWorker
from app.ingestion.usgs_worker import USGSWorker

Base.metadata.create_all(bind=engine)

def run_fire_worker():
    FIRMSWorker().run()

def run_usgs_worker():
    USGSWorker().run()

scheduler = BackgroundScheduler()
scheduler.add_job(run_fire_worker, "interval", minutes=60)
scheduler.add_job(run_usgs_worker, "interval", minutes=5)
scheduler.start()

app = FastAPI(title="Terrapulse")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fire_router)
app.include_router(earthquake_router)

@app.get("/")
def root():
    return {"status": "running"}