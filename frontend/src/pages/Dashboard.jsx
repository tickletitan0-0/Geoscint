import { useEffect, useState } from "react";
import api from "../services/api";
import FireMap from "../components/FireMap";
import TopFires from "../components/TopFires";

function Dashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/fires/stats")
      .then((res) => {
        setStats(res.data);
      });
  }, []);

  if (!stats) {
    return <h2>Loading...</h2>;
  }

  return (
  <div className="dashboard-container">
    <div>
      <div className="dashboard">

        <div className="hero animate delay-1">
          <h1>Terrapulse</h1>
          <p>Global Wildfire Intelligence Platform</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card animate delay-2">
            <h2>{stats.total_fires?.toLocaleString()}</h2>
            <p>Total Fires</p>
          </div>
          <div className="stat-card animate delay-3">
            <h2>{stats.average_brightness?.toFixed(1)}</h2>
            <p>Avg Brightness</p>
          </div>
          <div className="stat-card animate delay-4">
            <h2>{stats.high_confidence_fires?.toLocaleString()}</h2>
            <p>High Risk Fires</p>
          </div>
        </div>

        <hr className="divider" />

        <div className="animate delay-5">
          <FireMap />
        </div>

        <div className="animate delay-6">
          <TopFires />
        </div>

      </div>
    </div>
  </div>
);
}

export default Dashboard;