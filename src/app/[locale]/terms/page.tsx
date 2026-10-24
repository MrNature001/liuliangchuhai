import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'pages');
  return { title: t('meta.terms.title'), description: t('meta.terms.desc') };
}

export default function TermsPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'pages');

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="relative py-20 bg-gradient-to-br from-gray-800 to-gray-600 text-white">
        <div className="container-custom max-w-4xl text-center">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="archive" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('terms.title')}</h1>
          <p className="text-lg opacity-90">{t('terms.lead')}</p>
        </div>
      </header>

      <div className="container-custom max-w-4xl py-16 space-y-8">
        <section className="card-cultural p-8">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('terms.content.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('terms.content.body')}</p>
        </section>
        <section className="card-cultural p-8 border-l-4 border-amber-600">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('terms.disclaimer.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('terms.disclaimer.body')}</p>
        </section>
      </div>
    </main>
  );
}
