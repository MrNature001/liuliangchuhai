'use client';

/**
 * 动态同步 <html lang> 与跳过导航链接
 * Syncs <html lang> and the skip link with the current locale.
 *
 * 根布局 src/app/layout.tsx 是服务端组件、拿不到 [locale] 段，
 * 而 <html lang> 又必须真实反映当前语言（影响屏幕阅读器发音与 SEO）。
 * 这里在客户端读取 URL 段并同步；服务端渲染时先给出默认值 zh，
 * 客户端挂载后在 effect 中纠正，不产生可见闪烁（lang 不影响视觉）。
 */

import { useEffect } from 'react';
import { useLocale } from '@/i18n/client';
import { useT } from '@/i18n/client';

export default function HtmlLangSync() {
  const locale = useLocale();
  const { t } = useT('common');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <a href="#main-content" className="skip-link">
      {t('a11y.skipToMain')}
    </a>
  );
}
