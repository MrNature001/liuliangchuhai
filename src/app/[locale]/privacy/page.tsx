import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'pages');
  return { title: t('meta.privacy.title'), description: t('meta.privacy.desc') };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'pages');

  const blocks: { title: string; body: string; aside?: string }[] = [
    { title: t('privacy.collect.title'), body: t('privacy.collect.body'), aside: t('privacy.collect.not') },
    { title: t('privacy.where.title'), body: t('privacy.where.body') },
    { title: t('privacy.third.title'), body: t('privacy.third.body') },
    { title: t('privacy.rights.title'), body: t('privacy.rights.body') },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="relative py-20 bg-gradient-to-br from-gray-800 to-zhuang-blue text-white">
        <div className="container-custom max-w-4xl text-center">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="archive" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-lg opacity-90">{t('privacy.lead')}</p>
        </div>
      </header>

      <div className="container-custom max-w-4xl py-16 space-y-8">
        {blocks.map((block) => (
          <section key={block.title} className="card-cultural p-8">
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{block.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{block.body}</p>
            {block.aside && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 leading-relaxed">
                {block.aside}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
