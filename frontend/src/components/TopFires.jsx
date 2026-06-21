import { useEffect, useState, useRef } from "react";
import api from "../services/api";

import { formatAcqDateLocal, formatAcqTimeLocal } from "../utils/datetime";
import { reverseGeocode } from "../utils/geocode";
import { exportCSV, exportGeoJSON } from "../utils/export";

function TopFires({ mapRef, onSelectFire }) {

  const [fires, setFires] = useState([]);
  const [locations, setLocations] = useState({});

  useEffect(() => {
    // BUGFIX: React StrictMode mounts effects twice in development, and any
    // component remount would fire two concurrent requests. Without an ignore
    // flag both .then() callbacks call setFires, causing the table to render
    // duplicate rows. The cleanup sets ignored=true so only the response from
    // the most-recent mount wins.
    let ignored = false;
    api.get("/fires/top").then((res) => {
      if (!ignored) setFires(res.data);
    });
    return () => { ignored = true; };
  }, []);

  useEffect(() => {
    if (!fires.length) return;

    let cancelled = false;
    // Accumulate results in a ref so we can flush them all in one setState
    // call once every geocode has resolved. Individual setLocations calls
    // arriving during React's render cycle (one per ~1100ms gap) were causing
    // React 18 concurrent-mode to discard in-progress row renders, making
    // rows 3–7 appear to vanish intermittently.
    const accumulated = {};

    const validFires = fires
      .map((fire, index) => ({ fire, index }))
      .filter(({ fire }) =>
        typeof fire.latitude === "number" && typeof fire.longitude === "number"
      );

    let settled = 0;

    validFires.forEach(({ fire, index }) => {
      reverseGeocode(fire.latitude, fire.longitude).then((label) => {
        if (cancelled) return;
        accumulated[index] = label;
        settled++;
        // Flush once all geocodes have resolved so the table re-renders once,
        // not ten times in sequence.
        if (settled === validFires.length) {
          setLocations((prev) => ({ ...prev, ...accumulated }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [fires]);

  const handleRowClick = (fire) => {
  onSelectFire?.(fire);
  if (mapRef?.current) {
    document.querySelector(".map-wrapper").scrollIntoView({ 
      behavior: "smooth", 
      block: "center" 
    });
    setTimeout(() => {
      mapRef.current.flyTo([fire.latitude, fire.longitude], 8, {
        animate: true,
        duration: 1.5,
      });
    }, 500);
  }
};

  const handleExportCSV = () => {
    if (!fires.length) return;

    const headers = ["Brightness", "Location", "Latitude", "Longitude", "Date", "Time"];
    const rows = fires.map((fire, index) => [
      fire.brightness,
      locations[index] ?? "—",
      fire.latitude,
      fire.longitude,
      formatAcqDateLocal(fire.date, fire.acquisition_time),
      formatAcqTimeLocal(fire.date, fire.acquisition_time),
    ]);

    exportCSV(headers, rows, "top-fires");
  };

  const handleExportGeoJSON = () => {
    if (!fires.length) return;
    exportGeoJSON(fires, "top-fires");
  };

  return (
    <div className="top-fires">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Hight-Intensity Detections</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleExportCSV}
            disabled={!fires.length}
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: fires.length ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
              fontSize: "0.75rem",
              cursor: fires.length ? "pointer" : "not-allowed",
              fontFamily: "JetBrains Mono, monospace",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { if (fires.length) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            Download CSV
          </button>
          <button
            onClick={handleExportGeoJSON}
            disabled={!fires.length}
            title="Export as GeoJSON for GIS tools (QGIS, ArcGIS, Google Earth)"
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: fires.length ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
              fontSize: "0.75rem",
              cursor: fires.length ? "pointer" : "not-allowed",
              fontFamily: "JetBrains Mono, monospace",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={e => { if (fires.length) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            Download GeoJSON
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Thermal Intensity (K)</th>
            <th>Region</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Detected </th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {fires.map((fire, index) => {
            const tier =
              fire.brightness > 370 ? "tier-high" :
              fire.brightness > 350 ? "tier-mid" : "tier-low";

            return (
              <tr
                key={index}
                className={tier}
                onClick={() => handleRowClick(fire)}
                style={{ cursor: "pointer" }}
              >
                <td>{fire.brightness}</td>
                <td className="location-cell">
                  {locations[index] ?? <span className="location-loading">locating…</span>}
                </td>
                <td>{fire.latitude}</td>
                <td>{fire.longitude}</td>
                <td>{formatAcqDateLocal(fire.date, fire.acquisition_time)}</td>
                <td>{formatAcqTimeLocal(fire.date, fire.acquisition_time)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TopFires;