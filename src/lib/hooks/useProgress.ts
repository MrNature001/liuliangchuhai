'use client';

/**
 * 访客进度与成就
 * Visitor progress and achievements
 *
 * 所有数据保存在本机 localStorage，不上传。
 * 展陈的定位是「可带走的记忆」：完成度、徽章和历史都归访客自己所有。
 */

import { useCallback, useMemo } from 'react';
import { STORAGE_PREFIX, useLocalStorage } from './useLocalStorage';

export type ProgressEvent =
  | 'visit-guangxi'
  | 'visit-guilin'
  | 'visit-asean'
  | 'visit-exchange'
  | 'visit-archive'
  | 'visit-interactive'
  | 'visit-persona'
  | 'artifacts-3'
  | 'quiz-5'
  | 'quiz-perfect'
  | 'embroidery-50'
  | 'match-complete'
  | 'route-complete'
  | 'story-posted'
  | 'artifact-favorite';

export interface ProgressState {
  events: Partial<Record<ProgressEvent, number>>;
  /** 首次访问时间戳（毫秒） */
  firstSeen: number;
  /** 累计访问的展厅数 */
  halls: string[];
}

const EMPTY: ProgressState = { events: {}, firstSeen: 0, halls: [] };

export interface Badge {
  id: string;
  /** 字典 key（interactive 命名空间） */
  titleKey: string;
  descKey: string;
  /** 达成条件 */
  requires: ProgressEvent[];
  /** 需要的最小次数 */
  count?: number;
}

export const BADGES: Badge[] = [
  { id: 'explorer', titleKey: 'achievements.beginner.title', descKey: 'achievements.beginner.desc', requires: ['visit-guangxi'] },
  { id: 'all-halls', titleKey: 'achievements.explorer.title', descKey: 'achievements.explorer.desc', requires: ['visit-guangxi', 'visit-guilin', 'visit-asean', 'visit-exchange', 'visit-archive', 'visit-interactive'] },
  { id: 'scholar', titleKey: 'achievements.scholar.title', descKey: 'achievements.scholar.desc', requires: ['quiz-5'], count: 5 },
  { id: 'perfect', titleKey: 'achievements.perfect.title', descKey: 'achievements.perfect.desc', requires: ['quiz-perfect'] },
  { id: 'gamer', titleKey: 'achievements.gamer.title', descKey: 'achievements.gamer.desc', requires: ['embroidery-50'] },
  { id: 'matcher', titleKey: 'achievements.matcher.title', descKey: 'achievements.matcher.desc', requires: ['match-complete'] },
  { id: 'navigator', titleKey: 'achievements.navigator.title', descKey: 'achievements.navigator.desc', requires: ['route-complete'] },
  { id: 'speaker', titleKey: 'achievements.social.title', descKey: 'achievements.social.desc', requires: ['story-posted'] },
  { id: 'collector', titleKey: 'achievements.creator.title', descKey: 'achievements.creator.desc', requires: ['artifact-favorite'] },
];

export interface ProgressApi {
  state: ProgressState;
  hydrated: boolean;
  record: (event: ProgressEvent, amount?: number) => void;
  recordVisit: (hall: string) => void;
  count: (event: ProgressEvent) => number;
  unlocked: string[];
  percentFor: (badge: Badge) => number;
  reset: () => void;
}

export function useProgress(): ProgressApi {
  const { value, setValue, remove, hydrated } = useLocalStorage<ProgressState>(
    `${STORAGE_PREFIX}progress`,
    EMPTY
  );

  const record = useCallback(
    (event: ProgressEvent, amount = 1) => {
      setValue((prev) => {
        const current = prev.events[event] ?? 0;
        return {
          ...prev,
          firstSeen: prev.firstSeen || Date.now(),
          events: { ...prev.events, [event]: current + amount },
        };
      });
    },
    [setValue]
  );

  const recordVisit = useCallback(
    (hall: string) => {
      setValue((prev) => {
        if (prev.halls.includes(hall)) {
          return { ...prev, firstSeen: prev.firstSeen || Date.now() };
        }
        return {
          ...prev,
          firstSeen: prev.firstSeen || Date.now(),
          halls: [...prev.halls, hall],
        };
      });
    },
    [setValue]
  );

  const count = useCallback((event: ProgressEvent) => value.events[event] ?? 0, [value]);

  const unlocked = useMemo(
    () =>
      BADGES.filter((b) =>
        b.requires.every((req) => {
          if (req.startsWith('visit-')) return value.halls.includes(req.replace('visit-', ''));
          const need = b.count ?? 1;
          return (value.events[req] ?? 0) >= need;
        })
      ).map((b) => b.id),
    [value]
  );

  const percentFor = useCallback(
    (badge: Badge) => {
      if (badge.requires.length === 0) return 100;
      const done = badge.requires.filter((req) => {
        if (req.startsWith('visit-')) return value.halls.includes(req.replace('visit-', ''));
        return (value.events[req] ?? 0) >= (badge.count ?? 1);
      }).length;
      return Math.round((done / badge.requires.length) * 100);
    },
    [value]
  );

  return { state: value, hydrated, record, recordVisit, count, unlocked, percentFor, reset: remove };
}
