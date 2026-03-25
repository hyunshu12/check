import { AppBannerConfig, ScheduleSlot } from '../types';
import { formatClock } from '../utils/date';

interface TopBarProps {
  banner: AppBannerConfig;
  now: Date;
  currentSlot?: ScheduleSlot;
  progress?: number;
}

export function TopBar({ banner, now, currentSlot, progress }: TopBarProps) {
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(now);

  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <div className="topbar__summary">
          <div className="topbar__headline-block">
            <span className="topbar__eyebrow">실시간 출결 모니터</span>
            <div className="topbar__headline-line">
              <h1 className="topbar__title">출석 현황 대시보드</h1>
              <span className="topbar__date">{formattedDate}</span>
            </div>
          </div>

          <div className="topbar__banner">
            <span className="banner-indicator" aria-hidden="true" />
            <div className="banner-texts">
              <span className="banner-headline">{banner.headline}</span>
              {banner.subline ? <span className="banner-subline">{banner.subline}</span> : null}
            </div>
          </div>
        </div>

        <div className="topbar__clock" aria-live="polite">
          <div className="schedule-stack">
            <span className="schedule-label">{currentSlot?.name ?? '시간표 없음'}</span>
            <span className="schedule-subline">
              {currentSlot ? '현재 교시 진행 상황' : '진행 중인 수업이 없습니다.'}
            </span>
          </div>

          <div className="clock-stack">
            <span className="clock-label">현재 시각</span>
            <span className="clock">{formatClock(now)}</span>
          </div>

          {currentSlot && progress !== undefined ? (
            <div
              className="clock-progress"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
