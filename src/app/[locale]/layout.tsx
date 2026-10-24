import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VisitTracker from '@/components/layout/VisitTracker';
import { LocaleProvider } from '@/i18n/client';
import { LOCALES, normalizeLocale, type Locale } from '@/i18n/config';
import { getT } from '@/i18n/server';

/** 预生成全部语言路径（保持 SSG） */
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** 语言化的页面元信息 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t, locale } = getT(params.locale, 'header');
  return {
    title: t('logo'),
    description: t('logo'),
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      locale,
      title: t('logo'),
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = normalizeLocale(params.locale);

  return (
    <LocaleProvider locale={locale}>
      <a href="#main-content" className="skip-link">
        {getT(locale, 'common').t('a11y.skipToMain')}
      </a>
      <Header locale={locale} />
      <VisitTracker />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
