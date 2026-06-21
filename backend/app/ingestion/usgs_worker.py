import requests
from app.models.earthquake import Earthquake
from app.database import SessionLocal


class USGSWorker:

    def fetch(self):
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def transform(self, data):
        earthquakes = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            coords = feature.get("geometry", {}).get("coordinates", [])

            if len(coords) < 3:
                continue

            try:
                earthquakes.append({
                    "magnitude": float(props.get("mag") or 0),
                    "depth": float(coords[2]),
                    "latitude": float(coords[1]),
                    "longitude": float(coords[0]),
                    "place": props.get("place"),
                    "usgs_time": str(props.get("time")),
                    "usgs_id": feature.get("id"),
                    "tsunami": int(props.get("tsunami") or 0),
                    "significance": int(props.get("sig") or 0),
                })
            except Exception:
                continue

        return earthquakes

    def store(self, earthquakes):
        if not earthquakes:
            print("No earthquake data.")
            return

        db = SessionLocal()

        try:
            db.query(Earthquake).delete()
            db.commit()

            objects = [
                Earthquake(
                    magnitude=e["magnitude"],
                    depth=e["depth"],
                    latitude=e["latitude"],
                    longitude=e["longitude"],
                    place=e["place"],
                    usgs_time=e["usgs_time"],
                    usgs_id=e["usgs_id"],
                    tsunami=e["tsunami"],
                    significance=e["significance"],
                )
                for e in earthquakes
            ]

            db.bulk_save_objects(objects)
            db.commit()
            print(f"Inserted {len(objects)} earthquakes")

        except Exception as ex:
            db.rollback()
            print(f"Error: {ex}")

        finally:
            db.close()

    def run(self):
        data = self.fetch()
        transformed = self.transform(data)
        print(f"Fetched {len(transformed)} earthquakes")
        self.store(transformed)


if __name__ == "__main__":
    worker = USGSWorker()
    worker.run()