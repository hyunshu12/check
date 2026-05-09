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

export interface RoutineRule {
  id: string;
  weekday: number; // 0=Sun .. 6=Sat
  slotId: string;  // slotIdOf(slot)
  location: string;
}

export type RoutineMap = Record<string, RoutineRule[]>;

export interface ClassroomSettings {
  main: string[];
  extra: string[];
}

export interface AppBannerConfig {
  headline: string;
  subline?: string;
}

export interface GalleryImageVariant {
  webpSrc?: string;
  webpSrcSmall?: string;
  jpegSrc: string;
  width: number;
  widthSmall?: number;
  height: number;
}

export interface GalleryImageAsset {
  id: string;
  main: GalleryImageVariant;
  thumb: GalleryImageVariant;
}
