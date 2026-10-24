'use client';

/**
 * localStorage 持久化 Hook
 * localStorage-backed state
 *
 * 站内互动（成就、留言、收藏）全部保存在访客本机，不上传服务器。
 * 读取放在 useEffect 里，避免 SSR 与 CSR 首屏不一致导致水合报错。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    setValue(read(key, initialRef.current));
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // 隐私模式或配额满：静默降级为内存态，不打断交互
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* 同上 */
    }
    setValue(initialRef.current);
  }, [key]);

  return { value, setValue: update, remove, hydrated };
}

/** 站内所有持久化键统一前缀，便于「清除本站数据」一次清空 */
export const STORAGE_PREFIX = 'llch:';
