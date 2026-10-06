/**
 * Converts duration in seconds to MM:SS or HH:MM:SS format
 * @param {number|string} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const totalSeconds = Math.round(Number(seconds) || 0);
  if (totalSeconds <= 0) return '0:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

  if (hours > 0) {
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

export default formatDuration;

