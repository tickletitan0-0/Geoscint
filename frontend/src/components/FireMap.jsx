import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";

const createPulseIcon = () => L.divIcon({
  className: "",
  html: `
    <div style="
      width: 14px; height: 14px;
      background: #ff0000;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 8px #ff0000;
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

const getMarkerColor = (brightness) => {

  if (brightness > 370)
    return "#ff0000";

  if (brightness > 350)
    return "#ff5c00";

  if (brightness > 330)
    return "#ffb000";

  return "#ffe600";
};

const getRadius = (brightness) => {

    if (brightness > 370) return 10;
    if (brightness > 350) return 8;
    if (brightness > 330) return 6;

    return 4;
};

function FireMap() {

  const [fires, setFires] = useState([]);

  useEffect(() => {
    api.get("/fires/map")
      .then((res) => {
        setFires(res.data);
      });
  }, []);

  const highCount   = fires.filter(f => f.brightness > 370).length;
  const midCount    = fires.filter(f => f.brightness > 350 && f.brightness <= 370).length;
  const lowCount    = fires.filter(f => f.brightness > 330 && f.brightness <= 350).length;
  const lowestCount = fires.filter(f => f.brightness <= 330).length;

  return (
  <>
  <div className="map-wrapper" style={{ height: "75vh" }}>
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {fires.map((fire, index) => {
  if (fire.brightness > 370) {
    return (
      <Marker
        key={index}
        position={[fire.latitude, fire.longitude]}
        icon={createPulseIcon()}
      >
        <Popup>
          <div>
            <h3>Fire Hotspot</h3>
            <p>Brightness: {fire.brightness}</p>
            <p>Satellite: {fire.satellite}</p>
            <p>Date: {fire.acquisition_date}</p>
            <p>Time: {fire.acquisition_time}</p>
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <CircleMarker
      key={index}
      center={[fire.latitude, fire.longitude]}
      radius={getRadius(fire.brightness)}
      pathOptions={{
        color: getMarkerColor(fire.brightness),
        fillColor: getMarkerColor(fire.brightness),
        fillOpacity: 0.85
      }}
    >
      <Popup>
        <div>
          <h3>Fire Hotspot</h3>
          <p>Brightness: {fire.brightness}</p>
          <p>Satellite: {fire.satellite}</p>
          <p>Date: {fire.acquisition_date}</p>
          <p>Time: {fire.acquisition_time}</p>
        </div>
      </Popup>
    </CircleMarker>
  );
})}
    </MapContainer>

    <div className="map-legend">
      <div className="legend-row">
        <span className="legend-dot red"></span>
        <span>High Risk (&gt; 370)</span>
        <span className="legend-count">{highCount.toLocaleString()}</span>
      </div>
      <div className="legend-row">
        <span className="legend-dot orange"></span>
        <span>Medium Risk (350–370)</span>
        <span className="legend-count">{midCount.toLocaleString()}</span>
      </div>
      <div className="legend-row">
        <span className="legend-dot yellow"></span>
        <span>Lower Risk (330–350)</span>
        <span className="legend-count">{lowCount.toLocaleString()}</span>
      </div>
      <div className="legend-row">
        <span className="legend-dot" style={{ background: "#ffe600" }}></span>
        <span>Lowest (&lt; 330)</span>
        <span className="legend-count">{lowestCount.toLocaleString()}</span>
      </div>
    </div>

  </div>
  </>
  );
}

export default FireMap;