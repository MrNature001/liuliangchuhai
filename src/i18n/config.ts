/**
 * i18n 核心类型与配置
 * i18n Core Types & Configuration
 *
 * 零依赖的极简 i18n 层：
 * - 字典是 build 期静态 import 的普通 TS 对象，不涉及 cookies()/headers()，
 *   因此不破坏 SSG。
 * - 服务端组件走 getT(locale, ns)，客户端组件走 useT(ns)，共用同一个 createT 纯函数，
 *   保证 SSR 与 CSR 输出一致。
 */

/** 支持的语言代码 */
export const LOCALES = ['zh', 'en', 'vi', 'th', 'id', 'ms', 'my', 'lo', 'km', 'tl'] as const;

export type Locale = (typeof LOCALES)[number];

/** 默认语言（中文） */
export const DEFAULT_LOCALE: Locale = 'zh';

/** 判断是否为受支持的语言 */
export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** 规整语言参数，非法值回落到默认语言 */
export function normalizeLocale(v: string | undefined): Locale {
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/**
 * 扁平字典：键为点号路径（如 'hero.title'），值为文案。
 * 值为 string 时直接使用；为数组时按下标取（用于列表类文案）。
 */
export type Dict = Record<string, string | string[]>;

/** 插值变量 */
export type TVars = Record<string, string | number>;

/** 翻译函数签名 */
export type TFunc = (key: string, vars?: TVars) => string;

/**
 * 语言元信息（供语言切换器使用）
 * 注意：国旗代码复用 public/images/icons/flags/ 下已生成的 SVG。
 */
export const LOCALE_META: Record<Locale, { nativeName: string; englishName: string; flag: string }> = {
  zh: { nativeName: '中文（简体）', englishName: 'Chinese', flag: 'china' },
  en: { nativeName: 'English', englishName: 'English', flag: 'singapore' },
  vi: { nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: 'vietnam' },
  th: { nativeName: 'ภาษาไทย', englishName: 'Thai', flag: 'thailand' },
  id: { nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: 'indonesia' },
  ms: { nativeName: 'Bahasa Melayu', englishName: 'Malay', flag: 'malaysia' },
  my: { nativeName: 'ဗမာစာ', englishName: 'Burmese', flag: 'myanmar' },
  lo: { nativeName: 'ພາສາລາວ', englishName: 'Lao', flag: 'laos' },
  km: { nativeName: 'ភាសាខ្មែរ', englishName: 'Khmer', flag: 'cambodia' },
  tl: { nativeName: 'Tagalog', englishName: 'Filipino', flag: 'philippines' },
};
