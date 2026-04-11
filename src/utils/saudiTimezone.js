/**
 * Saudi Arabia Timezone Converter
 *
 * Converts all UTC ISO-8601 date strings in Express JSON responses
 * to Saudi local time (Asia/Riyadh).
 */

const SAUDI_TZ = "Asia/Riyadh";

/**
 * Get the UTC offset in minutes for Saudi Arabia at a specific point in time.
 * Uses Intl so it automatically handles timezone offset natively.
 */
function getSaudiOffsetMinutes(date) {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const saudiStr = date.toLocaleString("en-US", { timeZone: SAUDI_TZ });
  return (new Date(saudiStr) - new Date(utcStr)) / 60_000;
}

/**
 * Convert a UTC Date to an ISO-8601 string in Saudi timezone.
 */
function toSaudiISO(date) {
  const offsetMin = getSaudiOffsetMinutes(date);

  // Shift the date by the offset so toISOString() prints Saudi local time
  const shifted = new Date(date.getTime() + offsetMin * 60_000);

  // Strip the trailing "Z" so clients treat it as bare local time
  return shifted.toISOString().replace("Z", "");
}

/**
 * Matches UTC ISO-8601 strings produced by Date.prototype.toJSON()
 */
const UTC_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Express JSON replacer
 */
function saudiTimezoneReplacer(_key, value) {
  if (typeof value === "string" && UTC_ISO_RE.test(value)) {
    return toSaudiISO(new Date(value));
  }
  return value;
}

module.exports = {
  saudiTimezoneReplacer
};
