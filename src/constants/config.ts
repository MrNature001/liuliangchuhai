/**
 * 应用配置常量
 * Application Configuration Constants
 */

// 应用基本信息 | Application Basic Info
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Guangxi-ASEAN Cultural Exhibition',
  nameZh: '广西-东盟线上文化展',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: {
    zh: '展现广西壮族文化特色与东盟十国文化交流的现代化线上博物馆平台',
    en: 'A modern online museum platform showcasing Guangxi Zhuang culture and ASEAN cultural exchange',
  },
  version: '1.0.0',
} as const;

// 支持的语言 | Supported Languages
export const SUPPORTED_LOCALES = [
  { code: 'zh', name: '中文', nativeName: '中文（简体）', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'my', name: 'Burmese', nativeName: 'ဗမာစာ', flag: '🇲🇲' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: '🇱🇦' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
] as const;

export const DEFAULT_LOCALE = 'zh' as const;

// 功能开关 | Feature Flags
export const FEATURES = {
  enable3D: process.env.NEXT_PUBLIC_ENABLE_3D === 'true',
  enableAR: process.env.NEXT_PUBLIC_ENABLE_AR === 'true',
  enableVR: process.env.NEXT_PUBLIC_ENABLE_VR === 'true',
  enableSocial: process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true',
  enableComments: process.env.NEXT_PUBLIC_ENABLE_COMMENTS === 'true',
  enableOffline: process.env.NEXT_PUBLIC_ENABLE_OFFLINE === 'true',
  enableAnalytics: Boolean(process.env.NEXT_PUBLIC_GA_ID),
} as const;

// 3D 渲染配置 | 3D Rendering Configuration
export const RENDER_CONFIG = {
  minFPS: 30,
  targetFPS: 60,
  maxPolygons: {
    mobile: 50000,
    tablet: 100000,
    desktop: 200000,
  },
  textureQuality: {
    low: 512,
    medium: 1024,
    high: 2048,
    ultra: 4096,
  },
  lodLevels: [
    { distance: 0, quality: 1.0 },
    { distance: 10, quality: 0.7 },
    { distance: 20, quality: 0.4 },
    { distance: 50, quality: 0.2 },
  ],
} as const;

// 性能指标目标 | Performance Targets
export const PERFORMANCE_TARGETS = {
  FCP: 1800,  // First Contentful Paint (ms)
  LCP: 2500,  // Largest Contentful Paint (ms)
  TTI: 3800,  // Time to Interactive (ms)
  CLS: 0.1,   // Cumulative Layout Shift
  FID: 100,   // First Input Delay (ms)
} as const;

// 无障碍配置 | Accessibility Configuration
export const A11Y_CONFIG = {
  minTouchTarget: 44, // pixels
  minContrastRatio: 4.5,
  focusOutlineWidth: 2, // pixels
  skipLinkText: {
    zh: '跳转到主内容',
    en: 'Skip to main content',
  },
  enableKeyboardShortcuts: true,
  enableScreenReaderOptimizations: true,
} as const;

// API 端点 | API Endpoints
export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_API_URL || '/api',
  graphql: process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql',
  artifacts: '/api/artifacts',
  exhibitions: '/api/exhibitions',
  search: '/api/search',
  user: '/api/user',
  analytics: '/api/analytics',
} as const;

// CDN 配置 | CDN Configuration
export const CDN_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  images: '/images',
  models: '/models',
  audio: '/audio',
  videos: '/videos',
  fonts: '/fonts',
} as const;

// 缓存策略 | Cache Strategy
export const CACHE_CONFIG = {
  staticAssets: 60 * 60 * 24 * 30, // 30 days
  images: 60 * 60 * 24 * 7, // 7 days
  api: 60 * 5, // 5 minutes
  user: 60 * 15, // 15 minutes
} as const;

// 分页配置 | Pagination Configuration
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// 搜索配置 | Search Configuration
export const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxQueryLength: 100,
  debounceMs: 300,
  maxResults: 50,
} as const;

// 社交分享 | Social Sharing
export const SOCIAL_CONFIG = {
  shareTitle: APP_CONFIG.name,
  shareDescription: APP_CONFIG.description.en,
  shareImage: `${APP_CONFIG.url}/og-image.jpg`,
  twitterHandle: '@guangxiasean',
} as const;

// 联系方式 | Contact Information
export const CONTACT_INFO = {
  email: 'info@guangxi-asean-cultural.com',
  phone: '+86-771-XXXXXXX',
  address: {
    zh: '中国广西壮族自治区南宁市',
    en: 'Nanning, Guangxi Zhuang Autonomous Region, China',
  },
} as const;

// 外部链接 | External Links
export const EXTERNAL_LINKS = {
  caexpo: 'https://www.caexpo.org/', // 中国-东盟博览会
  unesco: 'https://whc.unesco.org/',
  guangxiTourism: 'http://wlt.gxzf.gov.cn/',
  asean: 'https://asean.org/',
} as const;
