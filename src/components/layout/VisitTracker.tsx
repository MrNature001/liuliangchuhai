'use client';

/**
 * 展厅到访记录
 * Hall visit tracker
 *
 * 放在 [locale]/layout 里，路由变化时把「到过哪个展厅」写进本机进度，
 * 成就系统据此判断「探索者」类徽章。不发送任何请求。
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useProgress, type ProgressEvent } from '@/lib/hooks/useProgress';

const HALLS: Record<string, ProgressEvent> = {
  '/guangxi': 'visit-guangxi',
  '/guilin': 'visit-guilin',
  '/asean': 'visit-asean',
  '/exchange': 'visit-exchange',
  '/archive': 'visit-archive',
  '/interactive': 'visit-interactive',
  '/persona': 'visit-persona',
};

export default function VisitTracker() {
  const pathname = usePathname();
  const { recordVisit, hydrated } = useProgress();

  useEffect(() => {
    if (!hydrated || !pathname) return;
    const parts = pathname.split('/').filter(Boolean);
    // 去掉语言段
    const rest = parts.slice(1).join('/');
    const key = `/${rest.split('/')[0] ?? ''}`;
    const hall = HALLS[key];
    if (hall) recordVisit(hall.replace('visit-', ''));
  }, [pathname, hydrated, recordVisit]);

  return null;
}
