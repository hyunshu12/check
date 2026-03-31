const padClockValue = (value: number) => String(value).padStart(2, '0');

export function formatClock(now: Date) {
  const hour = padClockValue(now.getHours());
  const minute = padClockValue(now.getMinutes());
  const second = padClockValue(now.getSeconds());
  return `${hour} : ${minute} : ${second}`;
}
