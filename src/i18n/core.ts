/**
 * i18n 核心实现（纯函数，无 React 依赖）
 * i18n Core Implementation (pure, framework-agnostic)
 *
 * 服务端与客户端共用本实现，确保 SSR/CSR 输出一致。
 */

import { DEFAULT_LOCALE, type Dict, type Locale, type TFunc, type TVars } from './config';

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * 用变量替换文案中的 {name} 占位符。
 * 未提供的变量保持原样（便于发现漏填）。
 */
function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER, (whole, name: string) => {
    const v = vars[name];
    return v === undefined || v === null ? whole : String(v);
  });
}

/**
 * 创建翻译函数。
 *
 * 传入的 dict 应是「整个语言的全部命名空间」合并后的字典，
 * 由 createT 负责加上命名空间前缀，这样调用处写 t('hero.title') 即可。
 *
 * @param dict   当前语言的全量字典（键形如 'home.hero.title'）
 * @param ns     命名空间，如 'home'；传 '' 表示不加前缀
 * @param locale 当前语言（用于提示与兜底）
 */
export function createT(dict: Dict, ns = '', locale: Locale = DEFAULT_LOCALE): TFunc {
  const prefix = ns ? `${ns}.` : '';

  return function t(key: string, vars?: TVars): string {
    // 优先按「命名空间 + key」查；查不到再退回直接按 key 查（兼容全量字典）
    const full = `${prefix}${key}`;
    let value = dict[full];
    if (value === undefined) value = dict[key];

    if (value === undefined) {
      // 缺 key：返回 key 本身，便于在页面上直接发现遗漏（而不是显示空白）
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] 缺少文案 key: "${full}" (locale=${locale})`);
      }
      return full;
    }

    if (Array.isArray(value)) {
      // 数组型文案：vars.index 指定下标
      const idx = typeof vars?.index === 'number' ? vars.index : 0;
      return interpolate(value[idx] ?? value[0] ?? '', vars);
    }

    return interpolate(value, vars);
  };
}

/**
 * 把某语言的字典叠加在 zh 基底之上。
 * 漏翻的 key 自动回落到中文，绝不出现空白或 key 泄漏。
 */
export function mergeDict(base: Dict, overrides: Dict): Dict {
  return { ...base, ...overrides };
}

/** 取数组型文案（如多段说明），语言缺该数组时回落到中文 */
export function getList(dict: Dict, ns: string, key: string): string[] {
  const full = ns ? `${ns}.${key}` : key;
  const v = dict[full];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return [v];
  return [];
}
