from pydantic import BaseModel


class FireCreate(BaseModel):

    latitude: float
    longitude: float
    confidence: int
    brightness: float

    satellite: str | None = None
    acquisition_date: str | None = None
    acquisition_time: str | None = None


class FireResponse(FireCreate):

    id: int

    class Config:
        from_attributes = True