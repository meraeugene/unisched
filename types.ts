export interface ScheduleEntry {
  id: string;
  code: string;
  subject: string;
  day: string;
  time: string;
  room: string;
  instructor?: string;
}

export interface ScheduleWithId extends ScheduleEntry {
  id: string;
}
