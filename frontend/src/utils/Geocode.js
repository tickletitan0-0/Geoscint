// Reverse geocoding via OpenStreetMap's free Nominatim API.
// No API key required, but usage policy caps requests at ~1/sec and
// asks for a descriptive User-Agent/Referer (browsers set Referer
// automatically). We round coordinates before caching/keying so
// nearby fires (often clustered from the same hotspot) share one
// lookup instead of hammering the API.

const cache = new Map();
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const MIN_INTERVAL_MS = 1100; // stay under Nominatim's 1 req/sec policy

let queue = Promise.resolve();

const roundCoord = (n) => Math.round(n * 100) / 100; // ~1.1km precision

const cacheKey = (lat, lon) => `${roundCoord(lat)},${roundCoord(lon)}`;

const buildLabel = (address, fallback) => {
  if (!address) return fallback;
  const place =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state_district ||
    null;
  const region = address.state || address.region || null;
  const country = address.country || null;

  const parts = [place, region && place !== region ? region : null, country].filter(Boolean);

  if (parts.length === 0) return fallback;
  // Avoid overly long labels; keep it to the two most specific parts
  return parts.slice(0, 2).join(", ");
};

const schedule = (task) => {
  const run = queue.then(() =>
    task().finally(() => new Promise((r) => setTimeout(r, MIN_INTERVAL_MS)))
  );
  // Keep the chain alive even if this task fails
  queue = run.catch(() => {});
  return run;
};

// Resolves to a short human-readable place name, e.g. "Paradise, California"
// or "Pacific Ocean" / "—" for open water / unresolved points.
export const reverseGeocode = async (lat, lon) => {
  if (typeof lat !== "number" || typeof lon !== "number") return "—";

  const key = cacheKey(lat, lon);
  if (cache.has(key)) return cache.get(key);

  const pending = schedule(async () => {
    try {
      const url = `${NOMINATIM_URL}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=8&addressdetails=1`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("geocode failed");
      const data = await res.json();
      const label = buildLabel(data.address, data.display_name ? data.display_name.split(",").slice(0, 2).join(",").trim() : "Open ocean");
      cache.set(key, label);
      return label;
    } catch {
      cache.set(key, "—");
      return "—";
    }
  });

  return pending;
};