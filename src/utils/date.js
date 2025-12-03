export function formatClock(now) {
    return now.toLocaleTimeString('ko-KR', { hour12: false });
}
