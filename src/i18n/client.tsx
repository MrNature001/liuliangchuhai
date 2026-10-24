'use client';

/**
 * 客户端取词
 * Client-side translation access
 *
 * 供客户端组件（有 'use client'）使用。
 * 语言来源优先级：
 *   1. 显式传入的 locale 参数
 *   2. Next 的 useParams().locale（URL 段）
 *   3. LocaleProvider 提供的 context
 *   4. 默认语言 zh
 *
 * 实现与 server.ts 共用同一个 createT 纯函数，保证 SSR/CSR 输出一致。
 */

import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createT } from './core';
import { DEFAULT_LOCALE, normalizeLocale, type Locale, type TFunc } from './config';
import { getDict } from './dicts';

/** locale 的客户端 context（由 [locale]/layout.tsx 注入） */
export const LocaleContext = createContext<Locale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** 读取当前语言：URL 段优先于 context */
export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  // useParams 在 SSG 预渲染时也会返回当前 locale 段，不会得到占位符
  const params = useParams<{ locale?: string }>();
  const fromUrl = typeof params?.locale === 'string' ? params.locale : undefined;
  return normalizeLocale(fromUrl ?? ctx ?? DEFAULT_LOCALE);
}

/**
 * 取客户端翻译函数。
 *
 * 用法：
 *   const { t } = useT('archive');
 *   return <h1>{t('hero.title')}</h1>;
 */
export function useT(ns: string, explicitLocale?: string): { t: TFunc; locale: Locale } {
  const detected = useLocale();
  const locale = explicitLocale ? normalizeLocale(explicitLocale) : detected;

  const t = useMemo(() => createT(getDict(locale, ns), ns, locale), [locale, ns]);

  return { t, locale };
}
