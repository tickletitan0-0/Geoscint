import { useEffect, useState } from "react";
import api from "../services/api";

function TopFires() {

  const [fires, setFires] = useState([]);

  useEffect(() => {

    api.get("/fires/top")
      .then((res) => {
        setFires(res.data);
      });

  }, []);

  return (
    <div className="top-fires">

      <h2>Top 10 Hottest Fires</h2>

      <table>

        <thead>
          <tr>
            <th>Brightness</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {fires.map((fire, index) => {
              const tier =
                fire.brightness > 370 ? "tier-high" :
                fire.brightness > 350 ? "tier-mid" : "tier-low";

              return (
                <tr key={index} className={tier}>
                  <td>{fire.brightness}</td>
                  <td>{fire.latitude}</td>
                  <td>{fire.longitude}</td>
                  <td>{fire.date}</td>
                </tr>
              );
            })}

        </tbody>

      </table>

    </div>
  );
}

export default TopFires;