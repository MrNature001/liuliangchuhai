'use client';

/**
 * 站内搜索
 * Site search
 *
 * 索引在构建期静态生成（src/lib/data/searchIndex.ts），
 * 搜索在浏览器内完成：不请求后端、可离线、查询内容不外泄。
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { searchDocs, sectionLabel, SEARCH_SUGGESTIONS } from '@/lib/data/searchIndex';
import { useLocale, useT } from '@/i18n/client';
import { Dialog } from '@/components/ui/Dialog';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchDocs(query, locale), [query, locale]);
  const suggestions = SEARCH_SUGGESTIONS[locale] ?? SEARCH_SUGGESTIONS.en;

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // 打开后聚焦输入框（dialog 已经 showModal，焦点可编程移动）
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = (path: string) => {
    onClose();
    router.push(`/${locale}${path}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active].doc.path);
    }
  };

  const isZh = locale === 'zh';

  return (
    <Dialog open={open} onClose={onClose} title={t('search.title')}>
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="site-search" className="sr-only">
            {t('search.placeholder')}
          </label>
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            autoComplete="off"
            className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-zhuang-red focus:outline-none"
            aria-describedby="search-hint"
            aria-controls="search-results"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
          </span>
        </div>

        <p id="search-hint" className="text-xs text-gray-500 dark:text-gray-400">
          {t('search.hint')}
        </p>

        {query.trim() === '' ? (
          <div>
            <div className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">{t('search.suggestions')}</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm hover:bg-zhuang-red hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2" aria-live="polite">
              {t('search.count', { count: results.length })}
            </div>
            {results.length === 0 ? (
              <p className="py-6 text-center text-gray-500 dark:text-gray-400">{t('search.empty')}</p>
            ) : (
              <ul id="search-results" className="divide-y divide-gray-100 dark:divide-gray-800" role="listbox">
                {results.map((hit, i) => (
                  <li key={hit.doc.id} role="option" aria-selected={i === active}>
                    <Link
                      href={`/${locale}${hit.doc.path}`}
                      onClick={onClose}
                      onMouseEnter={() => setActive(i)}
                      className={`block px-3 py-3 rounded-lg ${
                        i === active ? 'bg-amber-50 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {isZh ? hit.doc.title : hit.doc.titleEn}
                        </span>
                        <span className="text-xs text-zhuang-blue flex-shrink-0">
                          {sectionLabel(hit.doc.section, locale)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {isZh ? hit.doc.summary : hit.doc.summaryEn}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {pathname && (
          <p className="text-xs text-gray-400">
            {t('search.currentPath')}: <span className="font-mono">{pathname}</span>
          </p>
        )}
      </div>
    </Dialog>
  );
}
