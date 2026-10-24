/**
 * 服务端取词
 * Server-side translation access
 *
 * 供服务端组件（无 'use client'）使用。
 * 全程只做静态 import 的字典查表，不触碰 cookies()/headers()/searchParams，
 * 因此不会把页面踢出静态生成（SSG）。
 */

import { createT } from './core';
import { normalizeLocale, type Locale, type TFunc } from './config';
import { getDict } from './dicts';

/**
 * 取服务端翻译函数。
 *
 * @param locale URL 段里的语言
 * @param ns     命名空间（如 'home' / 'guangxi'）
 *
 * 用法：
 *   export default async function Page({ params: { locale } }) {
 *     const { t } = getT(locale, 'home');
 *     return <h1>{t('hero.title')}</h1>;
 *   }
 */
export function getT(locale: string | undefined, ns: string): { t: TFunc; locale: Locale } {
  const loc = normalizeLocale(locale);
  return { t: createT(getDict(loc, ns), ns, loc), locale: loc };
}

/** 只取规整后的语言 */
export { normalizeLocale };
