'use client';

/**
 * 搜索结果（客户端）
 *
 * 匹配全部在浏览器内完成，不请求后端。
 * 打分：标题命中 > 关键词命中 > 摘要命中；中文额外用二元组覆盖。
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useT, useLocale } from '@/i18n/client';

interface Doc {
  id: string;
  path: string;
  title: string;
  summary: string;
  section: string;
  keywords: string;
}

function score(doc: Doc, q: string): number {
  const query = q.trim().toLowerCase();
  if (!query) return 0;
  const title = doc.title.toLowerCase();
  const kw = doc.keywords.toLowerCase();
  const sum = doc.summary.toLowerCase();

  let s = 0;
  if (title.includes(query)) s += 12;
  if (kw.includes(query)) s += 8;
  if (sum.includes(query)) s += 4;

  if (/[一-鿿]/.test(query) && query.length >= 2) {
    for (let i = 0; i < query.length - 1; i += 1) {
      const g = query.slice(i, i + 2);
      if (title.includes(g)) s += 3;
      else if (kw.includes(g)) s += 2;
      else if (sum.includes(g)) s += 1;
    }
  }
  return s;
}

export default function SearchResults({ docs, initialQuery }: { docs: Doc[]; initialQuery: string }) {
  const { t } = useT('common');
  const locale = useLocale();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const hits = useMemo(() => {
    if (!q.trim()) return [];
    return docs
      .map((d) => ({ d, s: score(d, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40);
  }, [docs, q]);

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container-custom max-w-4xl py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('search.title')}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">{t('search.hint')}</p>

        <label htmlFor="search-page-input" className="sr-only">
          {t('search.placeholder')}
        </label>
        <input
          id="search-page-input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search.placeholder')}
          autoFocus
          className="w-full px-5 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-zhuang-red focus:outline-none"
        />

        <p className="mt-4 mb-6 text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {q.trim() ? t('search.count', { count: hits.length }) : t('search.suggestions')}
        </p>

        {q.trim() && hits.length === 0 && (
          <p className="py-10 text-center text-gray-500 dark:text-gray-400">{t('search.empty')}</p>
        )}

        <ul className="space-y-3">
          {hits.map(({ d }) => (
            <li key={d.id} className="card-cultural p-5">
              <Link href={`/${locale}${d.path}`} className="block">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-bold text-lg">{d.title}</h2>
                  <span className="text-xs text-zhuang-blue flex-shrink-0">{d.section}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{d.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
