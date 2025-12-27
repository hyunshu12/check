export interface Student {
  name: string;
  hakbun: string;
}

export interface MovementRecord {
  location: string;
  timestamp?: number; // 이동 시작 시간 (밀리초)
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

