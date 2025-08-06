export function extractMinutes(timeRange: string): number {
  const match = timeRange.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return Infinity;
  const [, hour, minute, meridian] = match;
  let h = parseInt(hour);
  const m = parseInt(minute);
  if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridian.toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}
