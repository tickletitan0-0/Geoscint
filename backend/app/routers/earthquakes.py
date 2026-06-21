from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.earthquake_service import EarthquakeService

router = APIRouter(prefix="/earthquakes", tags=["earthquakes"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return EarthquakeService.get_stats(db)


@router.get("/map")
def get_map_data(db: Session = Depends(get_db)):
    return EarthquakeService.get_map_data(db)


@router.get("/top")
def get_top(db: Session = Depends(get_db)):
    return EarthquakeService.get_top(db)