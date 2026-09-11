import type { Metadata } from 'next';
import './globals.css';
import { APP_CONFIG } from '@/constants/config';

/**
 * 字体策略 | Font Strategy
 * 使用系统字体栈，避免构建时依赖外部网络下载 Google Fonts。
 * 若需使用 Noto Sans SC，可在 public/fonts 放置字体文件并通过 next/font/local 加载，
 * 或在 globals.css 中通过 @font-face 引入 CDN。
 */
const fontClassName = 'font-sans';

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description.en,
  keywords: [
    'Guangxi',
    'ASEAN',
    'Cultural Exhibition',
    'Online Museum',
    'Zhuang Culture',
    '广西',
    '东盟',
    '文化展览',
    '线上博物馆',
    '壮族文化',
  ],
  authors: [{ name: 'Guangxi-ASEAN Cultural Exhibition Team' }],
  creator: 'Guangxi-ASEAN Cultural Exhibition',
  publisher: 'Guangxi-ASEAN Cultural Exhibition',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_CONFIG.url),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh',
      'en-US': '/en',
      'vi-VN': '/vi',
      'th-TH': '/th',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description.en,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: APP_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description.en,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#D73C2C" />
      </head>
      <body className={`${fontClassName} antialiased`}>
        {/* 跳过导航链接（无障碍） */}
        <a href="#main-content" className="skip-link">
          跳转到主内容
        </a>

        {children}
      </body>
    </html>
  );
}
