/**
 * 东盟十国档案合并入口
 * ASEAN profile registry
 *
 * 拆成两个数据文件是为了避免单文件过大：
 * - aseanCountries.ts     泰国 / 越南 / 印尼（展厅原有三国，内容更详细）
 * - aseanCountriesRest.ts 其余七国
 * 本文件只做合并与索引，页面统一从这里取数据。
 */

import {
  ASEAN_COUNTRY_CODES,
  ASEAN_COUNTRIES_DATA,
  isAseanCountryCode,
  localized,
  type AseanCountryCode,
  type CountryProfile,
} from './aseanCountries';
import { REST_PROFILES } from './aseanCountriesRest';

export const ASEAN_PROFILES: Record<AseanCountryCode, CountryProfile> = {
  ...ASEAN_COUNTRIES_DATA,
  ...REST_PROFILES,
} as Record<AseanCountryCode, CountryProfile>;

export { ASEAN_COUNTRY_CODES, isAseanCountryCode, localized };
export type { AseanCountryCode, CountryProfile };
export type { LocalizedText, CountryHighlight, UnescoEntry } from './aseanCountries';

/** 全站统一的东盟国家中文/英文名（用于导航、页脚、图谱等） */
export const ASEAN_NAMES: Record<AseanCountryCode, { zh: string; en: string }> = {
  thailand: { zh: '泰国', en: 'Thailand' },
  vietnam: { zh: '越南', en: 'Vietnam' },
  indonesia: { zh: '印度尼西亚', en: 'Indonesia' },
  malaysia: { zh: '马来西亚', en: 'Malaysia' },
  singapore: { zh: '新加坡', en: 'Singapore' },
  philippines: { zh: '菲律宾', en: 'Philippines' },
  cambodia: { zh: '柬埔寨', en: 'Cambodia' },
  laos: { zh: '老挝', en: 'Laos' },
  myanmar: { zh: '缅甸', en: 'Myanmar' },
  brunei: { zh: '文莱', en: 'Brunei' },
};

/** 取某个国家的档案；未知名返回 undefined */
export function getProfile(code: string): CountryProfile | undefined {
  if (!isAseanCountryCode(code)) return undefined;
  return ASEAN_PROFILES[code];
}
