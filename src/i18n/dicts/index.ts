/**
 * 字典索引
 * Dictionary Index
 *
 * 每种语言一个入口，按命名空间组织。
 * 未翻译的语言留空对象，运行时自动回落到中文（见 server.ts / client.tsx）。
 *
 * 新增一种语言：在 config.ts 的 LOCALES 里加代码，然后在本文件的 OVERRIDES 里加一行即可。
 */

import type { Dict, Locale } from '../config';

import { zh as commonZh, en as commonEn, vi as commonVi, th as commonTh } from './common';
import { zh as headerZh, en as headerEn, vi as headerVi, th as headerTh } from './header';
import { zh as homeZh, en as homeEn, vi as homeVi, th as homeTh } from './home';
import { zh as guangxiZh, en as guangxiEn, vi as guangxiVi, th as guangxiTh } from './guangxi';
import { zh as aseanZh, en as aseanEn, vi as aseanVi, th as aseanTh } from './asean';
import { zh as guilinZh, en as guilinEn, vi as guilinVi, th as guilinTh } from './guilin';
import { zh as exchangeZh, en as exchangeEn, vi as exchangeVi, th as exchangeTh } from './exchange';
import { zh as archiveZh, en as archiveEn, vi as archiveVi, th as archiveTh } from './archive';
import { zh as interactiveZh, en as interactiveEn, vi as interactiveVi, th as interactiveTh } from './interactive';
import { zh as personaZh, en as personaEn, vi as personaVi, th as personaTh } from './persona';
import { zh as festivalZh, en as festivalEn, vi as festivalVi, th as festivalTh } from './festival';
import { zh as creditsZh, en as creditsEn } from './credits';
import { zh as pagesZh, en as pagesEn } from './pages';
import { zh as ixZh, en as ixEn } from './interactiveExtra';

/** 命名空间 -> 中文基准字典（所有语言的最终回落目标） */
const BASE: Record<string, Dict> = {
  common: commonZh,
  header: headerZh,
  home: homeZh,
  guangxi: guangxiZh,
  asean: aseanZh,
  guilin: guilinZh,
  exchange: exchangeZh,
  archive: archiveZh,
  interactive: { ...interactiveZh, ...ixZh },
  persona: personaZh,
  festival: festivalZh,
  credits: creditsZh,
  pages: pagesZh,
};

/** 命名空间 -> 英文覆盖字典 */
const EN: Record<string, Dict> = {
  common: commonEn,
  header: headerEn,
  home: homeEn,
  guangxi: guangxiEn,
  asean: aseanEn,
  guilin: guilinEn,
  exchange: exchangeEn,
  archive: archiveEn,
  interactive: { ...interactiveEn, ...ixEn },
  persona: personaEn,
  festival: festivalEn,
  credits: creditsEn,
  pages: pagesEn,
};

/** 命名空间 -> 越南语覆盖字典 */
const VI: Record<string, Dict> = {
  common: commonVi,
  header: headerVi,
  home: homeVi,
  guangxi: guangxiVi,
  asean: aseanVi,
  guilin: guilinVi,
  exchange: exchangeVi,
  archive: archiveVi,
  interactive: interactiveVi,
  persona: personaVi,
  festival: festivalVi,
};

/** 命名空间 -> 泰语覆盖字典 */
const TH: Record<string, Dict> = {
  common: commonTh,
  header: headerTh,
  home: homeTh,
  guangxi: guangxiTh,
  asean: aseanTh,
  guilin: guilinTh,
  exchange: exchangeTh,
  archive: archiveTh,
  interactive: interactiveTh,
  persona: personaTh,
  festival: festivalTh,
};

/**
 * 各语言的「命名空间 -> 覆盖字典」映射。
 * 未列出的语言为空对象，运行时会以中文为基底回落。
 *
 * 注意：zh 必须指向 BASE 自身，而不是空对象——
 * 否则中文（基准语言）会查不到任何 key，页面上会显示出 key 名。
 */
export const OVERRIDES: Record<Locale, Record<string, Dict>> = {
  zh: BASE,
  en: EN,
  vi: VI,
  th: TH,
  id: {},
  ms: {},
  my: {},
  lo: {},
  km: {},
  tl: {},
};

/** 取中文基准字典 */
export function getBase(ns: string): Dict {
  const d = BASE[ns];
  if (!d) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] 未知命名空间: "${ns}"`);
    }
    return {};
  }
  return d;
}

/**
 * 取某语言在某命名空间的覆盖字典。
 * zh 直接返回基准字典；其他语言只返回本语言真正翻译过的部分，
 * 未翻译的 key 由调用方通过 mergeDict 回落到中文。
 */
export function getOverride(locale: Locale, ns: string): Dict {
  return OVERRIDES[locale]?.[ns] ?? {};
}

/**
 * 把某命名空间的字典加上命名空间前缀。
 * 字典内部写的是短键（'hero.title'），加上前缀后成为全量键（'home.hero.title'），
 * 这样多个命名空间可以安全地合并进同一个对象而不会互相覆盖。
 */
function withPrefix(ns: string, d: Dict): Dict {
  const out: Dict = {};
  for (const [k, v] of Object.entries(d)) out[`${ns}.${k}`] = v;
  return out;
}

/**
 * 取「已合并好、且带命名空间前缀」的最终字典。
 * 服务端与客户端都应使用本函数，避免各自漏掉 mergeDict 导致 key 泄漏到页面。
 *
 * @param locale 当前语言
 * @param ns     指定命名空间则只返回该空间；省略则返回该语言的全部命名空间
 */
export function getDict(locale: Locale, ns?: string): Dict {
  const namespaces = ns ? [ns] : Object.keys(BASE);

  let out: Dict = {};
  for (const n of namespaces) {
    // 先铺中文基准（保证漏翻时有中文兜底），再盖该语言的覆盖
    out = { ...out, ...withPrefix(n, getBase(n)), ...withPrefix(n, getOverride(locale, n)) };
  }
  return out;
}

export const NAMESPACES = Object.keys(BASE);
