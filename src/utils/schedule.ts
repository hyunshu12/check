import { ScheduleSlot } from '../types';
import { sundaySchedule, weekdaySchedule } from '../config/schedule';

const MINUTES_IN_HOUR = 60;

export function toMinutes({ hour, minute }: { hour: number; minute: number }) {
  return hour * MINUTES_IN_HOUR + minute;
}

export function slotIdOf(slot: ScheduleSlot) {
  return `${slot.name}|${slot.start.hour}:${slot.start.minute}`;
}

const EMPTY_SCHEDULE: ScheduleSlot[] = [];

export function getScheduleForWeekday(weekday: number): ScheduleSlot[] {
  if (weekday === 0) return sundaySchedule;
  if (weekday >= 1 && weekday <= 5) return weekdaySchedule;
  return EMPTY_SCHEDULE;
}

export function getCurrentScheduleSlot(schedule: ScheduleSlot[], now: Date) {
  const minutes = now.getHours() * MINUTES_IN_HOUR + now.getMinutes();

  return schedule.find((slot) => {
    const start = toMinutes(slot.start);
    const end = toMinutes(slot.end);
    return minutes >= start && minutes < end;
  });
}

export function getSlotProgress(slot: ScheduleSlot, now: Date) {
  const total = toMinutes(slot.end) - toMinutes(slot.start);
  const elapsed = now.getHours() * MINUTES_IN_HOUR + now.getMinutes() - toMinutes(slot.start);
  if (total <= 0) return 0;
  const progress = (elapsed / total) * 100;
  return Math.max(0, Math.min(100, progress));
}

