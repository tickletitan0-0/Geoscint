// FIRMS acq_date is "YYYY-MM-DD" and acq_time is UTC time as HHMM
// (leading zeros dropped), e.g. 412 -> 04:12, 1842 -> 18:42.
// Combine both into a real UTC instant, then render in the browser's
// local timezone so the date can roll forward/back correctly too.

const parseAcquisition = (date, time) => {
  if (!date || time === undefined || time === null || time === "") {
    return null;
  }

  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match;
  const str = String(time).padStart(4, "0");
  const hours = Number(str.slice(0, 2));
  const minutes = Number(str.slice(2));

  const utcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes
  );

  return Number.isNaN(utcMs) ? null : new Date(utcMs);
};

// Local date, e.g. "Jun 21, 2026"
export const formatAcqDateLocal = (date, time) => {
  const d = parseAcquisition(date, time);
  if (!d) return date || "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Local time, e.g. "11:42 AM"
export const formatAcqTimeLocal = (date, time) => {
  const d = parseAcquisition(date, time);
  if (!d) {
    // Fall back to the raw UTC time string if we can't pair it with a date
    if (time === undefined || time === null || time === "") return "—";
    const str = String(time).padStart(4, "0");
    return `${str.slice(0, 2)}:${str.slice(2)} UTC`;
  }
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};