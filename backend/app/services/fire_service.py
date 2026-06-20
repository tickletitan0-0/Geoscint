from sqlalchemy.orm import Session
from app.schemas.fire import FireCreate
from app.models.fire import Fire


class FireService:

    @staticmethod
    def create_fire(
        db: Session,
        fire: FireCreate
    ):
        db_fire = Fire(**fire.model_dump())

        db.add(db_fire)
        db.commit()
        db.refresh(db_fire)

        return db_fire

    @staticmethod
    def get_all_fires(
        db: Session
    ):
        return db.query(Fire).all()

    @staticmethod
    def delete_fire(
        db: Session,
        fire_id: int
    ):
        fire = (
            db.query(Fire)
            .filter(Fire.id == fire_id)
            .first()
        )

        if not fire:
            return None

        db.delete(fire)
        db.commit()

        return fire
    
    @staticmethod
    def get_stats(db):
        fires = db.query(Fire).all()

        total = len(fires)

        avg_brightness = (
            sum(f.brightness for f in fires) / total
            if total else 0
        )

        high_confidence = (
            db.query(Fire)
            .filter(Fire.brightness > 360)
            .count()
        )

        return {
            "total_fires": total,
            "average_brightness": avg_brightness,
            "high_confidence_fires": high_confidence
        }
    
    @staticmethod
    def get_latest_fires(db, limit=10):
        return (
            db.query(Fire)
            .order_by(Fire.id.desc())
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_high_risk_fires(db):

        return (
            db.query(Fire)
            .filter(
                Fire.confidence >= 80,
                Fire.brightness >= 330
            )
            .all()
        )
    
    @staticmethod
    def get_by_confidence(
        db,
        min_confidence
    ):
        return (
            db.query(Fire)
            .filter(
                Fire.confidence >= min_confidence
            )
            .all()
        )
    
    @staticmethod
    def bulk_create_fires(
        db,
        fires
    ):
        db.bulk_save_objects(fires)
        db.commit()

    def get_map_data(db):

        fires = db.query(Fire).all()

        return [
            {
                "latitude": fire.latitude,
                "longitude": fire.longitude,
                "brightness": fire.brightness,
                "satellite": fire.satellite,
                "acquisition_date": fire.acquisition_date,
                "acquisition_time": fire.acquisition_time,
            }
            for fire in fires
        ]
    
    @staticmethod
    def get_top_hottest_fires(
        db,
        limit=10
    ):
        return (
            db.query(Fire)
            .order_by(
                Fire.brightness.desc()
            )
            .limit(limit)
            .all()
        )