/**
 * 路由常量定义
 * Route Constants Definition
 */

/**
 * 生成带语言前缀的路由
 * Generate route with locale prefix
 */
export function getLocalizedRoute(path: string, locale: string = 'zh'): string {
  return `/${locale}${path}`;
}

// 主要路由 | Main Routes
export const ROUTES = {
  HOME: '/',

  // 展厅路由 | Exhibition Routes
  GUANGXI: '/guangxi',
  GUILIN: '/guilin',
  ASEAN: '/asean',
  EXCHANGE: '/exchange',
  ARCHIVE: '/archive',
  INTERACTIVE: '/interactive',

  // 3D/AR 路由 | 3D/AR Routes
  HALL_3D: '/3d-hall',
  AR_EXPERIENCE: '/ar-experience',

  // 东盟国家详情 | ASEAN Country Details
  ASEAN_COUNTRY: (country: string) => `/asean/${country}`,

  // 文物详情 | Artifact Details
  ARTIFACT: (id: string) => `/artifact/${id}`,

  // 展览详情 | Exhibition Details
  EXHIBITION: (id: string) => `/exhibition/${id}`,

  // 搜索 | Search
  SEARCH: '/search',
  SEARCH_RESULTS: (query: string) => `/search?q=${encodeURIComponent(query)}`,

  // 用户相关 | User Related
  USER_PROFILE: '/user/profile',
  USER_FAVORITES: '/user/favorites',
  USER_HISTORY: '/user/history',
  USER_ACHIEVEMENTS: '/user/achievements',

  // 其他页面 | Other Pages
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',
  ACCESSIBILITY: '/accessibility',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // API 路由 | API Routes
  API: {
    ARTIFACTS: '/api/artifacts',
    ARTIFACT_BY_ID: (id: string) => `/api/artifacts/${id}`,
    EXHIBITIONS: '/api/exhibitions',
    SEARCH: '/api/search',
    USER_FAVORITES: '/api/user/favorites',
    USER_HISTORY: '/api/user/history',
  },
} as const;

// 展厅导航项 | Exhibition Navigation Items
export const EXHIBITION_ROUTES = [
  {
    key: 'guangxi',
    path: ROUTES.GUANGXI,
    titleZh: '壮乡之韵',
    titleEn: 'Guangxi Culture',
    descriptionZh: '广西民族文化',
    descriptionEn: 'Ethnic Culture of Guangxi',
    icon: 'zhuangjin',
  },
  {
    key: 'guilin',
    path: ROUTES.GUILIN,
    titleZh: '山水桂林',
    titleEn: 'Guilin Landscape',
    descriptionZh: '自然景观与诗意文化',
    descriptionEn: 'Natural Scenery and Poetic Culture',
    icon: 'mountain',
  },
  {
    key: 'asean',
    path: ROUTES.ASEAN,
    titleZh: '东盟十国',
    titleEn: 'ASEAN Nations',
    descriptionZh: '东盟文化万花筒',
    descriptionEn: 'ASEAN Cultural Kaleidoscope',
    icon: 'asean',
  },
  {
    key: 'exchange',
    path: ROUTES.EXCHANGE,
    titleZh: '丝路新章',
    titleEn: 'Silk Road',
    descriptionZh: '广西-东盟文化交流',
    descriptionEn: 'Guangxi-ASEAN Cultural Exchange',
    icon: 'bridge',
  },
  {
    key: 'archive',
    path: ROUTES.ARCHIVE,
    titleZh: '数字遗产',
    titleEn: 'Digital Heritage',
    descriptionZh: '文化宝库与档案中心',
    descriptionEn: 'Cultural Treasury and Archives',
    icon: 'archive',
  },
  {
    key: 'interactive',
    path: ROUTES.INTERACTIVE,
    titleZh: '互动体验',
    titleEn: 'Interactive',
    descriptionZh: '文化游戏与社区',
    descriptionEn: 'Cultural Games and Community',
    icon: 'gamepad',
  },
] as const;

// 东盟十国路由 | ASEAN Countries Routes
export const ASEAN_COUNTRIES = [
  { code: 'thailand', nameZh: '泰国', nameEn: 'Thailand', flag: '🇹🇭' },
  { code: 'vietnam', nameZh: '越南', nameEn: 'Vietnam', flag: '🇻🇳' },
  { code: 'indonesia', nameZh: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩' },
  { code: 'malaysia', nameZh: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'singapore', nameZh: '新加坡', nameEn: 'Singapore', flag: '🇸🇬' },
  { code: 'philippines', nameZh: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭' },
  { code: 'cambodia', nameZh: '柬埔寨', nameEn: 'Cambodia', flag: '🇰🇭' },
  { code: 'laos', nameZh: '老挝', nameEn: 'Laos', flag: '🇱🇦' },
  { code: 'myanmar', nameZh: '缅甸', nameEn: 'Myanmar', flag: '🇲🇲' },
  { code: 'brunei', nameZh: '文莱', nameEn: 'Brunei', flag: '🇧🇳' },
] as const;

// 面包屑导航辅助函数 | Breadcrumb Helper
export function getBreadcrumbs(pathname: string, locale: string = 'zh') {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: locale === 'zh' ? '首页' : 'Home', path: getLocalizedRoute('/', locale) },
  ];

  let currentPath = '';
  paths.forEach((segment, index) => {
    // 跳过语言代码
    if (index === 0 && segment.length === 2) {
      return;
    }

    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segment,
      path: getLocalizedRoute(currentPath, locale),
    });
  });

  return breadcrumbs;
}

export type Route = typeof ROUTES;
export type ExhibitionRoute = typeof EXHIBITION_ROUTES[number];
export type AseanCountry = typeof ASEAN_COUNTRIES[number];
