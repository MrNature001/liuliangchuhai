'use client';

/**
 * 全站页脚
 * Site footer
 *
 * 之前页脚只存在于首页，导致其它页面没有导航出口；
 * 现在作为布局组件统一渲染，并承担「清除本站数据」与进度展示。
 */

import { useState } from 'react';
import Link from 'next/link';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/client';
import { useProgress } from '@/lib/hooks/useProgress';
import { STORAGE_PREFIX } from '@/lib/hooks/useLocalStorage';
import { Toast } from '@/components/ui/Dialog';

export default function Footer() {
  const locale = useLocale();
  const { t } = useT('common');
  const { state, unlocked, reset, hydrated } = useProgress();
  const [toast, setToast] = useState<string | null>(null);

  const clearAll = () => {
    if (typeof window === 'undefined') return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    reset();
    setToast(t('footer.clearDataDone'));
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-4">{t('footer.aboutUs')}</h2>
            <p className="text-sm leading-relaxed">{t('footer.aboutDesc')}</p>
          </div>

          <nav aria-label={t('footer.quickLinks')}>
            <h2 className="text-white font-bold text-lg mb-4">{t('footer.quickLinks')}</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/about`} className="hover:text-white">{t('footer.about')}</Link></li>
              <li><Link href={`/${locale}/accessibility`} className="hover:text-white">{t('footer.accessibility')}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="hover:text-white">{t('footer.privacy')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="hover:text-white">{t('footer.terms')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white">{t('footer.contact')}</Link></li>
              <li><Link href={`/${locale}/credits`} className="hover:text-white">{t('footer.credits')}</Link></li>
              {/* 关联项目：流量出海（地址可用 NEXT_PUBLIC_LIUCHUHAI_URL 覆盖） */}
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_LIUCHUHAI_URL || 'http://localhost:3000'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-1"
                >
                  {t('footer.liuchuhai')} <span aria-hidden>↗</span>
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-white font-bold text-lg mb-4">{t('footer.progress')}</h2>
            <p className="text-sm mb-3">
              {t('footer.progressDesc', { halls: state.halls.length, badges: unlocked.length })}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-sm px-4 py-2 rounded-full border border-gray-700 hover:border-gray-400 hover:text-white transition-colors"
            >
              {t('footer.clearData')}
            </button>
            <p className="text-xs text-gray-500 mt-3">{t('footer.privacyNote')}</p>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-4">{t('footer.languages')}</h2>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
              {LOCALES.map((code, i) => (
                <span key={code} className="flex items-center">
                  {i > 0 && <span className="text-gray-600 mr-2" aria-hidden>|</span>}
                  <Link href={`/${code}`} hrefLang={code} className="hover:text-white">
                    {LOCALE_META[code].nativeName}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>{t('footer.copyright')}</p>
          {hydrated && unlocked.length > 0 && (
            <p className="sr-only">{t('footer.progressDesc', { halls: state.halls.length, badges: unlocked.length })}</p>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </footer>
  );
}
