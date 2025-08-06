import { ParsedSchedule } from "./parseScheduleFromText";

export const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function groupSchedule(schedule: ParsedSchedule[]) {
  const grouped: Record<string, ParsedSchedule[]> = {};

  for (const day of daysOfWeek) {
    grouped[day] = [];
  }

  for (const entry of schedule) {
    const day = entry.day;
    if (grouped[day]) {
      grouped[day].push(entry);
    }
  }

  return grouped;
}
