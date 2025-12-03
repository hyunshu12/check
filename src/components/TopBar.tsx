import { AppBannerConfig, ScheduleSlot } from '../types';
import { formatClock } from '../utils/date';

interface TopBarProps {
  banner: AppBannerConfig;
  now: Date;
  currentSlot?: ScheduleSlot;
  progress?: number;
}

export function TopBar({ banner, now, currentSlot, progress }: TopBarProps) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <div className="topbar__clock" aria-live="polite">
          <span className="clock">{formatClock(now)}</span>
          <span className="clock-label">{currentSlot?.name ?? '시간표 없음'}</span>
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

        <div className="topbar__banner">
          <span className="banner-indicator" aria-hidden="true" />
          <div className="banner-texts">
            <span className="banner-headline">{banner.headline}</span>
            {banner.subline ? <span className="banner-subline">{banner.subline}</span> : null}
          </div>
        </div>
      </div>
    </header>
  );
}

