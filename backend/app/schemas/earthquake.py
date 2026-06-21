from pydantic import BaseModel
from typing import Optional


class EarthquakeCreate(BaseModel):
    magnitude: float
    depth: float
    latitude: float
    longitude: float
    place: Optional[str] = None
    usgs_time: Optional[str] = None
    usgs_id: Optional[str] = None
    tsunami: Optional[int] = None
    significance: Optional[int] = None