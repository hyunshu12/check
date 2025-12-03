export interface Student {
  name: string;
  hakbun: string;
}

export interface MovementRecord {
  location: string;
}

export type MovementMap = Record<string, MovementRecord>;

export interface ScheduleSlot {
  name: string;
  start: { hour: number; minute: number };
  end: { hour: number; minute: number };
}

export interface ClassroomSettings {
  main: string[];
  extra: string[];
}

export interface AppBannerConfig {
  headline: string;
  subline?: string;
}

