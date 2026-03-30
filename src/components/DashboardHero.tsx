import { useMemo } from 'react';

import { sundaySchedule, weekdaySchedule } from '../config/schedule';
import { useClock } from '../hooks/useClock';
import { formatClock } from '../utils/date';
import { getCurrentScheduleSlot } from '../utils/schedule';

export function DashboardHero() {
  const now = useClock();
  const day = now.getDay();

  const scheduleForToday = useMemo(() => {
    if (day === 0) return sundaySchedule;
    if (day >= 1 && day <= 5) return weekdaySchedule;
    return [];
  }, [day]);

  const currentSlot = useMemo(() => getCurrentScheduleSlot(scheduleForToday, now), [scheduleForToday, now]);

  return (
    <header className="skrr-hero" aria-label="현재 시각과 시간표">
      <p className="skrr-hero__time">{formatClock(now)}</p>
      <p className="skrr-hero__slot">{currentSlot?.name ?? '진행 중인 일정 없음'}</p>
    </header>
  );
}
