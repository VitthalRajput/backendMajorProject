/**
 * Formats a number into a compact YouTube-style string (e.g., 1200 -> 1.2K, 2400000 -> 2.4M)
 * @param {number|string} count
 * @returns {string}
 */
export function formatViews(count) {
  const num = Number(count) || 0;
  if (num < 1000) {
    return num.toString();
  }
  if (num < 1000000) {
    const k = num / 1000;
    return k >= 10 ? `${Math.floor(k)}K` : `${k.toFixed(1).replace(/\.0$/, '')}K`;
  }
  if (num < 1000000000) {
    const m = num / 1000000;
    return `${m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  const b = num / 1000000000;
  return `${b.toFixed(1).replace(/\.0$/, '')}B`;
}

export default formatViews;
