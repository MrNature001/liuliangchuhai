'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { type IconName } from '@/components/ui/Icon';
import { LOCALES, LOCALE_META, normalizeLocale, type Locale } from '@/i18n/config';
import { useT } from '@/i18n/client';
import { SearchDialog } from '@/components/search/SearchDialog';

/** 展厅图标映射 */
const EXHIBITION_ICON: Record<string, IconName> = {
  guangxi: 'lantern',
  guilin: 'mountain',
  asean: 'globe',
  exchange: 'handshake',
  archive: 'archive',
  interactive: 'gamepad',
};

/** 展厅路由（key 与字典里的 exhibition.* 对应） */
const EXHIBITIONS: { key: string; path: string }[] = [
  { key: 'guangxi', path: '/guangxi' },
  { key: 'guilin', path: '/guilin' },
  { key: 'asean', path: '/asean' },
  { key: 'exchange', path: '/exchange' },
  { key: 'archive', path: '/archive' },
  { key: 'interactive', path: '/interactive' },
];

/**
 * 把当前路径里的语言段替换为目标语言。
 * 采用「跳过首段」写法而非硬编码长度判断，为将来 zh-Hans 之类的代码留余地。
 */
function switchLocaleInPath(pathname: string, next: Locale): string {
  if (!pathname) return `/${next}`;
  const parts = pathname.split('/').filter(Boolean);
  // 首段若是已知语言则丢弃，否则保留
  if (parts.length > 0 && (LOCALES as readonly string[]).includes(parts[0])) {
    parts.shift();
  }
  return `/${next}${parts.length ? `/${parts.join('/')}` : ''}`;
}

export default function Header({ locale: localeProp = 'zh' }: { locale?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const locale = normalizeLocale(localeProp);
  const { t } = useT('header', locale);
  const { t: tc } = useT('common', locale);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[1100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
            <Icon
              name="museum"
              size={28}
              className="text-zhuang-red dark:text-zhuang-gold"
              label={t('logo')}
            />
            <span className="font-bold text-lg text-gradient-zhuang hidden sm:inline">
              {t('logo')}
            </span>
          </Link>

          {/* 桌面导航 | Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-hidden">
            {EXHIBITIONS.map((ex) => (
              <Link
                key={ex.key}
                href={`/${locale}${ex.path}`}
                className="px-2.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 text-gray-700 dark:text-gray-300 hover:bg-zhuang-red hover:text-white transition-colors"
              >
                {t(`exhibition.${ex.key}`)}
              </Link>
            ))}
            {/* 人设测试与六个展馆并列，但用分隔线区分，避免被误读为「当前选中项」 */}
            <span aria-hidden className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
            <Link
              href={`/${locale}/persona`}
              className="px-2.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 text-gray-700 dark:text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
            >
              {t('nav.persona')}
            </Link>
          </nav>

          {/* 右侧操作 | Right Actions */}
          <div className="flex items-center gap-2">
            {/* 语言切换 | Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={tc('a11y.switchLang')}
                aria-expanded={langMenuOpen}
              >
                <LangFlag code={locale} />
                <span className="hidden sm:inline">{LOCALE_META[locale].nativeName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto">
                  {LOCALES.map((code) => (
                    <Link
                      key={code}
                      href={switchLocaleInPath(pathname, code)}
                      hrefLang={code}
                      className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        code === locale ? 'bg-zhuang-blue/10 text-zhuang-blue' : ''
                      }`}
                      onClick={() => setLangMenuOpen(false)}
                    >
                      <LangFlag code={code} />
                      <span>{LOCALE_META[code].nativeName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 搜索按钮 | Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={tc('a11y.search')}
              aria-haspopup="dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 移动端菜单按钮 | Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileMenuOpen ? tc('a11y.closeMenu') : tc('a11y.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 | Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container-custom py-4 space-y-1">
            <Link
              href={`/${locale}/persona`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon name="medal" size={22} />
              <div>
                <div className="font-medium">{t('nav.persona')}</div>
                <div className="text-xs opacity-90">{t('nav.mobilePersonaDesc')}</div>
              </div>
            </Link>
            {EXHIBITIONS.map((ex) => (
              <Link
                key={ex.key}
                href={`/${locale}${ex.path}`}
                className="exhibition-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={EXHIBITION_ICON[ex.key] || 'museum'} size={22} />
                <div>
                  <div className="font-medium">{t(`exhibition.${ex.key}`)}</div>
                  <div className="text-xs text-gray-500">{t(`exhibition.${ex.key}.desc`)}</div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

/** 语言国旗（复用已生成的 SVG） */
function LangFlag({ code }: { code: Locale }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/icons/flags/${LOCALE_META[code].flag}.svg`}
      alt=""
      aria-hidden
      style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
    />
  );
}
