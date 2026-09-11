'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EXHIBITION_ROUTES } from '@/constants/routes';
import { SUPPORTED_LOCALES } from '@/constants/config';

export default function Header({ locale = 'zh' }: { locale?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  return (
    <header className="sticky top-0 z-[1100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🏛️</span>
            <span className="font-bold text-lg text-gradient-zhuang hidden sm:inline">
              广西-东盟文化展
            </span>
          </Link>

          {/* 桌面导航 | Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href={`/${locale}/persona`}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
            >
              🎭 文化人设
            </Link>
            {EXHIBITION_ROUTES.map((exhibition) => (
              <Link
                key={exhibition.key}
                href={`/${locale}${exhibition.path}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-zhuang-red hover:text-white transition-colors"
              >
                {exhibition.titleZh}
              </Link>
            ))}
          </nav>

          {/* 右侧操作 | Right Actions */}
          <div className="flex items-center gap-2">
            {/* 语言切换 | Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="切换语言"
                aria-expanded={langMenuOpen}
              >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.nativeName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 max-h-80 overflow-y-auto">
                  {SUPPORTED_LOCALES.map((lang) => (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}`}
                      className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        lang.code === locale ? 'bg-zhuang-blue/10 text-zhuang-blue' : ''
                      }`}
                      onClick={() => setLangMenuOpen(false)}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 搜索按钮 | Search Button */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="搜索"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 移动端菜单按钮 | Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
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
              <span className="text-xl">🎭</span>
              <div>
                <div className="font-medium">发现文化人设</div>
                <div className="text-xs opacity-90">30秒测试你的文化身份</div>
              </div>
            </Link>
            {EXHIBITION_ROUTES.map((exhibition) => (
              <Link
                key={exhibition.key}
                href={`/${locale}${exhibition.path}`}
                className="exhibition-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">{getExhibitionEmoji(exhibition.key)}</span>
                <div>
                  <div className="font-medium">{exhibition.titleZh}</div>
                  <div className="text-xs text-gray-500">{exhibition.descriptionZh}</div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function getExhibitionEmoji(key: string): string {
  const emojiMap: Record<string, string> = {
    guangxi: '🎭',
    guilin: '🏔️',
    asean: '🌏',
    exchange: '🤝',
    archive: '📚',
    interactive: '🎮',
  };
  return emojiMap[key] || '🏛️';
}
