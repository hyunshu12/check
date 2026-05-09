import { memo, useMemo, useRef } from 'react';

import { sundaySchedule, weekdaySchedule } from '../config/schedule';
import { useClock } from '../hooks/useClock';
import { getCurrentScheduleSlot, getSlotProgress, toMinutes } from '../utils/schedule';

interface DashboardHeroProps {
  total: number;
  present: number;
  moved: number;
  absent: number;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
});

export const DashboardHero = memo(function DashboardHero({
  total,
  present,
  moved,
  absent
}: DashboardHeroProps) {
  const now = useClock();
  const day = now.getDay();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();

  const scheduleForToday = useMemo(() => {
    if (day === 0) return sundaySchedule;
    if (day >= 1 && day <= 5) return weekdaySchedule;
    return [];
  }, [day]);

  const currentSlot = useMemo(
    () => getCurrentScheduleSlot(scheduleForToday, now),
    // currentSlot only flips at minute boundaries; avoid re-finding every second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheduleForToday, minuteOfDay]
  );

  const progress = currentSlot ? getSlotProgress(currentSlot, now) : 0;

  const remain = useMemo(() => {
    if (!currentSlot) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const remainMin = Math.max(0, toMinutes(currentSlot.end) - nowMin);
    const mm = Math.floor(remainMin);
    const ss = Math.round((remainMin - mm) * 60);
    return { mm, ss: ss === 60 ? 0 : ss };
  }, [currentSlot, now]);

  const clock = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  const dateCache = useRef<{ key: string; label: string } | null>(null);
  const dateKey = now.toDateString();
  if (!dateCache.current || dateCache.current.key !== dateKey) {
    dateCache.current = { key: dateKey, label: dateFormatter.format(now) };
  }
  const dateLabel = dateCache.current.label;

  return (
    <header className="va-hero" aria-label="현재 시각과 시간표">
      <div className="va-hero__clock">
        <div className="va-hero__time">{clock}</div>
        <div className="va-hero__date">{dateLabel}</div>
      </div>

      <div className="va-hero__schedule">
        <div className="va-hero__slot-row">
          <span className="va-hero__slot-name">{currentSlot?.name ?? '진행 중인 일정 없음'}</span>
          {currentSlot ? (
            <span className="va-hero__slot-time">
              {pad2(currentSlot.start.hour)}:{pad2(currentSlot.start.minute)}
              {' – '}
              {pad2(currentSlot.end.hour)}:{pad2(currentSlot.end.minute)}
            </span>
          ) : null}
          {remain ? (
            <span className="va-hero__slot-remain">
              남은 시간 <strong>{remain.mm}분 {pad2(remain.ss)}초</strong>
            </span>
          ) : null}
        </div>
        <div className="va-hero__bar" aria-hidden="true">
          <div className="va-hero__bar-fill" style={{ width: `${progress}%` }} />
          <div className="va-hero__bar-tick" style={{ left: `${progress}%` }} />
        </div>
      </div>

      <div className="va-hero__counts" aria-label="출결 카운트">
        <CountChip label="총원" value={total} />
        <CountChip label="현원" value={present} variant="big" />
        <CountChip label="결원" value={moved} variant="big" />
        <CountChip label="결석" value={absent} variant="small" />
      </div>
    </header>
  );
});

interface CountChipProps {
  label: string;
  value: number;
  variant?: 'big' | 'small';
}

const CountChip = memo(function CountChip({ label, value, variant }: CountChipProps) {
  const className = ['va-count', variant === 'big' ? 'is-big' : '', variant === 'small' ? 'is-small' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className}>
      <span className="va-count__label">{label}</span>
      <span className="va-count__value">{value}</span>
    </div>
  );
});
