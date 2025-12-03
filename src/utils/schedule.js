const MINUTES_IN_HOUR = 60;
export function toMinutes({ hour, minute }) {
    return hour * MINUTES_IN_HOUR + minute;
}
export function getCurrentScheduleSlot(schedule, now) {
    const minutes = now.getHours() * MINUTES_IN_HOUR + now.getMinutes();
    return schedule.find((slot) => {
        const start = toMinutes(slot.start);
        const end = toMinutes(slot.end);
        return minutes >= start && minutes < end;
    });
}
export function getSlotProgress(slot, now) {
    const total = toMinutes(slot.end) - toMinutes(slot.start);
    const elapsed = now.getHours() * MINUTES_IN_HOUR + now.getMinutes() - toMinutes(slot.start);
    if (total <= 0)
        return 0;
    const progress = (elapsed / total) * 100;
    return Math.max(0, Math.min(100, progress));
}
