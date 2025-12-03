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

  useEffect(() => {
    if (!isBrowser) return;

    if (prevKeyRef.current !== key) {
      window.localStorage.removeItem(prevKeyRef.current);
      prevKeyRef.current = key;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[usePersistentState] failed to store ${key}`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

