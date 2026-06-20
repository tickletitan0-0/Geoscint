import os
import csv
import requests
from io import StringIO
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
from app.models.fire import Fire
from app.database import SessionLocal
from app.schemas.fire import FireCreate
from app.services.fire_service import FireService
from app.models.fire import Fire

load_dotenv()

API_KEY = os.getenv("FIRMS_API_KEY")


class FIRMSWorker:

    def fetch(self):

        url = (
            f"https://firms.modaps.eosdis.nasa.gov"
            f"/api/area/csv/{API_KEY}"
            f"/VIIRS_SNPP_NRT/world/1"
        )

        response = requests.get(url)

        response.raise_for_status()

        return response.text

    def transform(self, raw_csv):

        reader = csv.DictReader(
            StringIO(raw_csv)
        )

        fires = []

        for row in reader:

            try:

                fires.append(
                    {
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "confidence": 100,
                        "brightness": float(row["bright_ti4"]),

                        "satellite": row.get("satellite"),
                        "acquisition_date": row.get("acq_date"),
                        "acquisition_time": row.get("acq_time")
                    }
                )

            except Exception:
                continue

        return fires

    def store(self, fires):

        db = SessionLocal()

        try:

            fire_objects = []

            for fire in fires:

                fire_objects.append(
                    Fire(
                        latitude=fire["latitude"],
                        longitude=fire["longitude"],
                        confidence=fire["confidence"],
                        brightness=fire["brightness"],
                        satellite=fire.get("satellite"),
                        acquisition_date=fire.get(
                            "acquisition_date"
                        ),
                        acquisition_time=fire.get(
                            "acquisition_time"
                        )
                    )
                )

            db.bulk_save_objects(
                fire_objects
            )

            db.commit()

            print(
                f"Inserted {len(fire_objects)} fires"
            )

        except IntegrityError:

            db.rollback()

            print(
                "Duplicate records detected."
            )

        finally:

            db.close()

    def run(self):

        raw_data = self.fetch()

        transformed = self.transform(
            raw_data
        )

        print(
            f"Fetched {len(transformed)} fires"
        )

        self.store(transformed)


if __name__ == "__main__":

    worker = FIRMSWorker()

    worker.run()