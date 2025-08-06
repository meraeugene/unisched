import { v4 as uuidv4 } from "uuid";

export type ParsedSchedule = {
  id: string;
  code: string;
  subject: string;
  day: string;
  time: string;
  room: string;
  instructor?: string;
};

// Extracts minutes from a time string like "9:30 AM" or "2:15 PM"
function extractMinutes(timeRange: string): number {
  const match = timeRange.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return Infinity;

  const [, hour, minute, meridian] = match;
  let h = parseInt(hour);
  const m = parseInt(minute);

  if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridian.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

/**
 * Expands compact day strings like "MWF", "TTh", etc.
 */
function expandDays(compact: string): string[] {
  const days: string[] = [];
  let i = 0;
  while (i < compact.length) {
    if (compact[i] === "T" && compact[i + 1] === "h") {
      days.push("Thursday");
      i += 2;
    } else if (compact[i] === "M") {
      days.push("Monday");
      i++;
    } else if (compact[i] === "T") {
      days.push("Tuesday");
      i++;
    } else if (compact[i] === "W") {
      days.push("Wednesday");
      i++;
    } else if (compact[i] === "F") {
      days.push("Friday");
      i++;
    } else if (compact[i] === "S") {
      days.push("Saturday");
      i++;
    } else {
      i++;
    }
  }
  return days;
}

/**
 * Cleans scheduleRoom and returns { day, time, room }
 */
function parseScheduleDetails(
  scheduleRoom: string
): { day: string; time: string; room: string }[] {
  const results: { day: string; time: string; room: string }[] = [];

  const match = scheduleRoom.match(/^([MTWFSUThh]+)\s+(.*?)\/(.+)$/i);
  if (match) {
    const [, dayPartRaw, timeRaw, roomRaw] = match;
    const dayPart = dayPartRaw.replace(/[^MTWFSUTh]/g, "");
    const days = expandDays(dayPart);
    const time = timeRaw.trim();

    // Clean room to extract only values like 09-301 or Dorm Classroom 5
    const roomClean = extractRoom(roomRaw);

    days.forEach((day) => {
      results.push({ day, time, room: roomClean });
    });
    return results;
  }

  // Fallback match
  const fallback = scheduleRoom.match(/^([MTWFSUThh]+)\s+(.*)$/i);
  if (fallback) {
    const [, dayPartRaw, timeRoom] = fallback;
    const dayPart = dayPartRaw.replace(/[^MTWFSUTh]/g, "");
    const days = expandDays(dayPart);

    const timeMatch = timeRoom.match(
      /\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M/
    );
    const time = timeMatch ? timeMatch[0].trim() : "";

    const roomRaw = timeRoom.slice(time.length).trim();
    const room = extractRoom(roomRaw);

    days.forEach((day) => {
      results.push({ day, time, room });
    });
  }

  return results;
}

/**
 * Extracts only valid room names (e.g., 09-301, Dorm Classroom 5)
 */
function extractRoom(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " "); // normalize spaces
  const roomMatch = cleaned.match(/\b(09-\d{3}|Dorm Classroom \d{1,2}|GnS)\b/);
  return roomMatch ? roomMatch[0].trim() : "";
}

/**
 * Main function to parse the schedule from lines
 */
export function parseScheduleFromText(lines: string[]): ParsedSchedule[] {
  const parsed: ParsedSchedule[] = [];

  let currentCode = "";
  let currentSubject = "";
  let collecting = false;

  for (let i = 12; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("Total Unit")) break;

    const fullRegex =
      /^([A-Z]{2,}\d{3}|GnS)\s+(.+?)\s+\d\s+\d\s+\d(?:\s+\S+)?\s+([MTWFSUTH].+)$/;
    const matchFull = line.match(fullRegex);

    if (matchFull) {
      currentCode = matchFull[1].trim();
      currentSubject = matchFull[2].trim();
      const scheduleRoom = matchFull[3].trim();

      const details = parseScheduleDetails(scheduleRoom);
      for (const entry of details) {
        parsed.push({
          id: uuidv4(),
          code: currentCode,
          subject: currentSubject,
          ...entry,
        });
      }

      collecting = true;
      continue;
    }

    const subjectOnlyRegex = /^([A-Z]{2,}\d{3}|GnS)\s+(.+?)\s+\d\s+\d\s+\d/;
    const matchSubject = line.match(subjectOnlyRegex);
    if (matchSubject) {
      currentCode = matchSubject[1].trim();
      currentSubject = matchSubject[2].trim();
      collecting = true;
      continue;
    }

    const scheduleFollowupRegex = /^[MTWFSUTH]+\s+.+$/;
    const matchFollow = line.match(scheduleFollowupRegex);
    if (matchFollow && collecting) {
      const scheduleRoom = line.trim();
      const details = parseScheduleDetails(scheduleRoom);
      for (const entry of details) {
        parsed.push({
          id: uuidv4(),
          code: currentCode,
          subject: currentSubject,
          ...entry,
        });
      }
    }
  }

  // Sort by time (AM → PM) across all entries
  parsed.sort((a, b) => extractMinutes(a.time) - extractMinutes(b.time));

  return parsed;
}
