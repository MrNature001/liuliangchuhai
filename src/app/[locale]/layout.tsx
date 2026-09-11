import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import { SUPPORTED_LOCALES } from '@/constants/config';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale: locale.code,
  }));
}

export const metadata: Metadata = {
  title: '广西-东盟线上文化展',
  description: '探索广西壮族文化与东盟十国的文化交流',
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  return (
    <>
      <Header locale={locale} />
      {children}
    </>
  );
}
