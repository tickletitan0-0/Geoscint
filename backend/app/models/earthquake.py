from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Earthquake(Base):
    __tablename__ = "earthquakes"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    magnitude = Column(Float)
    depth = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    place = Column(String, nullable=True)
    usgs_time = Column(String, nullable=True)
    usgs_id = Column(String, nullable=True, unique=True)
    tsunami = Column(Integer, nullable=True)
    significance = Column(Integer, nullable=True)