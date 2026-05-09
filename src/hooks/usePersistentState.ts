import { useEffect, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (!isBrowser) return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (error) {
      console.warn(`[usePersistentState] failed to parse ${key}`, error);
      return defaultValue;
    }
  });

  const prevKeyRef = useRef(key);
  const writeHandleRef = useRef<number | null>(null);
  const lastSerializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isBrowser) return;

    if (prevKeyRef.current !== key) {
      window.localStorage.removeItem(prevKeyRef.current);
      prevKeyRef.current = key;
      lastSerializedRef.current = null;
    }

    let serialized: string;
    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      console.warn(`[usePersistentState] failed to serialize ${key}`, error);
      return;
    }

    if (serialized === lastSerializedRef.current) return;

    const scheduleIdle = (cb: () => void): number => {
      if (typeof window.requestIdleCallback === 'function') {
        return window.requestIdleCallback(cb, { timeout: 2000 }) as unknown as number;
      }
      return window.setTimeout(cb, 0);
    };
    const cancelIdle = (handle: number) => {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };

    if (writeHandleRef.current !== null) {
      cancelIdle(writeHandleRef.current);
    }

    writeHandleRef.current = scheduleIdle(() => {
      writeHandleRef.current = null;
      try {
        window.localStorage.setItem(key, serialized);
        lastSerializedRef.current = serialized;
      } catch (error) {
        console.warn(`[usePersistentState] failed to store ${key}`, error);
      }
    });

    return () => {
      if (writeHandleRef.current !== null) {
        cancelIdle(writeHandleRef.current);
        writeHandleRef.current = null;
      }
    };
  }, [key, value]);

  return [value, setValue] as const;
}

