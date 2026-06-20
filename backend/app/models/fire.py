from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy import UniqueConstraint
from app.database import Base


class Fire(Base):

    __tablename__ = "fires"

    __table_args__ = (
        UniqueConstraint(
            "latitude",
            "longitude",
            "acquisition_date",
            "acquisition_time",
            name="uq_fire_event"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    confidence = Column(
        Integer,
        nullable=False
    )

    brightness = Column(
        Float,
        nullable=False
    )

    satellite = Column(
        String,
        nullable=True
    )

    acquisition_date = Column(
        String,
        nullable=True
    )

    acquisition_time = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )