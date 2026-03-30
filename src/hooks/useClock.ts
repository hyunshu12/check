import { useEffect, useState } from 'react';

export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timerId: number | null = null;

    const clearTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const scheduleNextTick = () => {
      const delay = intervalMs - (Date.now() % intervalMs) || intervalMs;
      timerId = window.setTimeout(() => {
        setNow(new Date());
        scheduleNextTick();
      }, delay);
    };

    const syncClock = () => {
      clearTimer();
      setNow(new Date());
      scheduleNextTick();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncClock();
      }
    };

    syncClock();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncClock);
    window.addEventListener('pageshow', syncClock);

    return () => {
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncClock);
      window.removeEventListener('pageshow', syncClock);
    };
  }, [intervalMs]);

  return now;
}
