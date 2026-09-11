/**
 * 广西-东盟文化色彩系统
 * Cultural Color System for Guangxi-ASEAN Exhibition
 */

// 壮族传统配色 | Zhuang Traditional Colors
export const ZHUANG_COLORS = {
  primary: {
    red: '#D73C2C',      // 壮锦红 | Zhuangjin Red
    blue: '#1E5BA8',     // 壮锦蓝 | Zhuangjin Blue
    black: '#1A1A1A',    // 壮锦黑 | Zhuangjin Black
  },
  secondary: {
    gold: '#D4AF37',     // 金色 | Gold
    green: '#2E8B57',    // 绿色 | Green
    purple: '#6A0DAD',   // 紫色 | Purple
  },
  neutral: {
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
} as const;

// 水墨画风格色彩 | Ink Painting Style Colors
export const INK_COLORS = {
  black: '#000000',
  grayDark: '#333333',
  gray: '#808080',
  grayLight: '#CCCCCC',
  white: '#FFFFFF',
  cyan: '#7FCDCD',      // 淡青 | Light Cyan
  green: '#90EE90',     // 淡绿 | Light Green
} as const;

// ASEAN 官方色彩 | ASEAN Official Colors
export const ASEAN_COLORS = {
  red: '#C8102E',       // ASEAN 红 | ASEAN Red
  blue: '#003DA5',      // ASEAN 蓝 | ASEAN Blue
  yellow: '#FFD100',    // ASEAN 黄 | ASEAN Yellow
  white: '#FFFFFF',     // ASEAN 白 | ASEAN White
} as const;

// 东盟十国代表色 | ASEAN Countries Representative Colors
export const COUNTRY_COLORS = {
  thailand: {
    primary: '#ED1C24',   // 泰国红 | Thai Red
    secondary: '#0033A0', // 泰国蓝 | Thai Blue
    accent: '#FFD700',    // 金色 | Gold
  },
  vietnam: {
    primary: '#DA251D',   // 越南红 | Vietnamese Red
    secondary: '#FFCD00', // 金色 | Gold
  },
  indonesia: {
    primary: '#FF0000',   // 印尼红 | Indonesian Red
    secondary: '#FFFFFF', // 白色 | White
  },
  malaysia: {
    primary: '#010066',   // 马来西亚蓝 | Malaysian Blue
    secondary: '#CC0001', // 红色 | Red
    accent: '#FFCC00',    // 金色 | Gold
  },
  singapore: {
    primary: '#EF3340',   // 新加坡红 | Singaporean Red
    secondary: '#FFFFFF', // 白色 | White
  },
  philippines: {
    primary: '#0038A8',   // 菲律宾蓝 | Philippine Blue
    secondary: '#CE1126', // 红色 | Red
    accent: '#FCD116',    // 黄色 | Yellow
  },
  cambodia: {
    primary: '#032EA1',   // 柬埔寨蓝 | Cambodian Blue
    secondary: '#E00025', // 红色 | Red
  },
  laos: {
    primary: '#CE1126',   // 老挝红 | Laotian Red
    secondary: '#002868', // 蓝色 | Blue
    accent: '#FFFFFF',    // 白色 | White
  },
  myanmar: {
    primary: '#FECB00',   // 缅甸黄 | Burmese Yellow
    secondary: '#34B233', // 绿色 | Green
    accent: '#EA2839',    // 红色 | Red
  },
  brunei: {
    primary: '#F7E017',   // 文莱黄 | Bruneian Yellow
    secondary: '#000000', // 黑色 | Black
    accent: '#FFFFFF',    // 白色 | White
  },
} as const;

// 语义化色彩 | Semantic Colors
export const SEMANTIC_COLORS = {
  success: '#10B981',   // 成功 | Success
  warning: '#F59E0B',   // 警告 | Warning
  error: '#EF4444',     // 错误 | Error
  info: '#3B82F6',      // 信息 | Info
} as const;

// 文化元素配色映射 | Cultural Element Color Mapping
export const CULTURAL_ELEMENT_COLORS = {
  zhuangjin: ZHUANG_COLORS.primary.red,      // 壮锦 | Zhuangjin
  tonggu: ZHUANG_COLORS.secondary.gold,      // 铜鼓 | Bronze Drum
  huashan: INK_COLORS.black,                 // 花山岩画 | Huashan Rock Art
  architecture: ZHUANG_COLORS.primary.black, // 干栏式建筑 | Stilt House
  festival: ZHUANG_COLORS.primary.red,       // 三月三节日 | Sanyuesan Festival
  landscape: INK_COLORS.cyan,                // 桂林山水 | Guilin Landscape
  heritage: ZHUANG_COLORS.secondary.gold,    // 文化遗产 | Cultural Heritage
  asean: ASEAN_COLORS.blue,                  // 东盟 | ASEAN
} as const;

// 导出所有颜色 | Export All Colors
export const COLORS = {
  zhuang: ZHUANG_COLORS,
  ink: INK_COLORS,
  asean: ASEAN_COLORS,
  countries: COUNTRY_COLORS,
  semantic: SEMANTIC_COLORS,
  elements: CULTURAL_ELEMENT_COLORS,
} as const;

export type ZhuangColors = typeof ZHUANG_COLORS;
export type InkColors = typeof INK_COLORS;
export type AseanColors = typeof ASEAN_COLORS;
export type CountryColors = typeof COUNTRY_COLORS;
export type SemanticColors = typeof SEMANTIC_COLORS;
export type CulturalElementColors = typeof CULTURAL_ELEMENT_COLORS;
