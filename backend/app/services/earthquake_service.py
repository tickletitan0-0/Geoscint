from app.models.earthquake import Earthquake


class EarthquakeService:

    @staticmethod
    def get_stats(db):
        quakes = db.query(Earthquake).all()
        total = len(quakes)
        avg_mag = sum(q.magnitude for q in quakes) / total if total else 0
        significant = len([q for q in quakes if q.magnitude >= 5.0])
        tsunami = len([q for q in quakes if q.tsunami == 1])

        return {
            "total_earthquakes": total,
            "average_magnitude": round(avg_mag, 2),
            "significant_earthquakes": significant,
            "tsunami_alerts": tsunami,
        }

    @staticmethod
    def get_map_data(db):
        quakes = db.query(Earthquake).all()
        return [
            {
                "latitude": q.latitude,
                "longitude": q.longitude,
                "magnitude": q.magnitude,
                "depth": q.depth,
                "place": q.place,
                "usgs_time": q.usgs_time,
                "tsunami": q.tsunami,
            }
            for q in quakes
        ]

    @staticmethod
    def get_top(db, limit=10):
        return (
            db.query(Earthquake)
            .order_by(Earthquake.magnitude.desc())
            .limit(limit)
            .all()
        )