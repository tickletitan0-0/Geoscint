import { useEffect, useState } from "react";
import { formatAcqDateLocal, formatAcqTimeLocal } from "../utils/datetime";
import { reverseGeocode } from "../utils/geocode";

const getTier = (brightness) => {
  if (brightness > 370) return { label: "High", color: "#ff4d4d" };
  if (brightness > 350) return { label: "Medium", color: "#ff8800" };
  if (brightness > 330) return { label: "Lower", color: "#ffb000" };
  return { label: "Lowest", color: "#ffe600" };
};

// FRP (fire radiative power, in megawatts) is a rough proxy for fire intensity.
// These bands are a simple, non-authoritative read for display purposes only.
const describeFrp = (frp) => {
  if (frp > 100) return "Very high intensity";
  if (frp > 50) return "High intensity";
  if (frp > 10) return "Moderate intensity";
  return "Low intensity";
};

function FireDetailPanel({ fire, onClose }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    setLocation(null);
    if (!fire || typeof fire.latitude !== "number" || typeof fire.longitude !== "number") return;

    let cancelled = false;
    reverseGeocode(fire.latitude, fire.longitude).then((label) => {
      if (!cancelled) setLocation(label);
    });
    return () => {
      cancelled = true;
    };
  }, [fire]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (fire) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fire, onClose]);

  if (!fire) return null;

  const tier = getTier(fire.brightness);
  const hasConfidence = fire.confidence !== undefined && fire.confidence !== null;
  const hasFrp = fire.frp !== undefined && fire.frp !== null;

  return (
    <>
      <div className="fire-panel-backdrop" onClick={onClose} />
      <aside className="fire-panel" role="dialog" aria-label="Fire details">
        <button className="fire-panel-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="fire-panel-header">
          <span className="fire-panel-tier" style={{ color: tier.color, borderColor: tier.color }}>
            {tier.label} risk
          </span>
          <h3>{location ?? <span className="location-loading">resolving…</span>}</h3>
          <p className="fire-panel-coords">
            {fire.latitude?.toFixed(3)}, {fire.longitude?.toFixed(3)}
          </p>
        </div>

        <div className="fire-panel-section">
          <div className="fire-panel-row">
            <span>Brightness</span>
            <strong>{fire.brightness}</strong>
          </div>

          {hasFrp && (
            <div className="fire-panel-row">
              <span>Radiative power</span>
              <strong>{fire.frp} MW</strong>
            </div>
          )}

          {hasFrp && (
            <p className="fire-panel-note">{describeFrp(fire.frp)}</p>
          )}

          {hasConfidence && (
            <div className="fire-panel-row">
              <span>Confidence</span>
              <strong>{fire.confidence}{typeof fire.confidence === "number" ? "%" : ""}</strong>
            </div>
          )}

          <div className="fire-panel-row">
            <span>Satellite</span>
            <strong>{fire.satellite ?? "—"}</strong>
          </div>

          <div className="fire-panel-row">
            <span>Date</span>
            <strong>{formatAcqDateLocal(fire.acquisition_date ?? fire.date, fire.acquisition_time)}</strong>
          </div>

          <div className="fire-panel-row">
            <span>Time</span>
            <strong>{formatAcqTimeLocal(fire.acquisition_date ?? fire.date, fire.acquisition_time)}</strong>
          </div>
        </div>
      </aside>
    </>
  );
}

export default FireDetailPanel;