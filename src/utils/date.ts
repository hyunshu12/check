export function formatClock(now: Date) {
  return now.toLocaleTimeString('ko-KR', { hour12: false });
}
