const pad2 = value => String(value).padStart(2, '0');

/**
 * Returns zero-padded date/time parts for the current time
 * @returns {{ year: number, month: string, day: string, hour: string, minute: string, second: string }} date/time parts.
 * @author isahooman
 */
function getDateParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: pad2(now.getMonth() + 1),
    day: pad2(now.getDate()),
    hour: pad2(now.getHours()),
    minute: pad2(now.getMinutes()),
    second: pad2(now.getSeconds()),
  };
}

/**
 * Formats the current time as `YYYY-MM-DD HH:mm:ss`.
 * @returns {string} Current timestamp.
 * @author isahooman
 */
function formatTimestamp() {
  const { year, month, day, hour, minute, second } = getDateParts();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Formats the current time as `YYYY-MM-DD_HH-mm` for filenames.
 * @returns {string} Current timestamp safe for filenames.
 * @author isahooman
 */
function formatFileTimestamp() {
  const { year, month, day, hour, minute } = getDateParts();
  return `${year}-${month}-${day}_${hour}-${minute}`;
}

/**
 * Formats seconds as `Xd Xh Xm Xs`.
 * @param {number} seconds Duration in seconds.
 * @returns {string} Human-readable duration string.
 * @author isahooman
 */
function formatDuration(seconds) {
  let total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;

  const remainingSeconds = total % 60;
  total = Math.floor(total / 60);
  const minutes = total % 60;
  total = Math.floor(total / 60);
  const hours = total % 24;
  const days = Math.floor(total / 24);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${remainingSeconds}s`);
  return parts.join(' ');
}

module.exports = { formatTimestamp, formatFileTimestamp, formatDuration };
