// Shared download helpers so any component can export fire data
// without duplicating blob/anchor boilerplate.

const triggerDownload = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCsvCell = (value) => {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const exportCSV = (headers, rows, filenamePrefix) => {
  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");

  triggerDownload(
    csvContent,
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
    "text/csv;charset=utf-8;"
  );
};

// Builds a standard RFC 7946 FeatureCollection. Each fire becomes a Point
// feature; every original field is preserved in `properties` so analysts
// get the full record, not just what's shown in the UI.
export const exportGeoJSON = (fires, filenamePrefix) => {
  const featureCollection = {
    type: "FeatureCollection",
    features: fires
      .filter((f) => typeof f.latitude === "number" && typeof f.longitude === "number")
      .map((fire) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [fire.longitude, fire.latitude], // GeoJSON is [lon, lat]
        },
        properties: { ...fire },
      })),
  };

  triggerDownload(
    JSON.stringify(featureCollection, null, 2),
    `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.geojson`,
    "application/geo+json;charset=utf-8;"
  );
};