import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'pages');
  return { title: t('meta.accessibility.title'), description: t('meta.accessibility.desc') };
}

export default function AccessibilityPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'pages');
  const done = [1, 2, 3, 4, 5, 6, 7].map((i) => t(`a11yPage.done.item${i}`));
  const limits = [1, 2, 3].map((i) => t(`a11yPage.limits.item${i}`));

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="relative py-20 bg-gradient-to-br from-zhuang-green to-zhuang-blue text-white">
        <div className="container-custom max-w-4xl text-center">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="globe" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('a11yPage.title')}</h1>
          <p className="text-lg opacity-90">{t('a11yPage.lead')}</p>
        </div>
      </header>

      <div className="container-custom max-w-4xl py-16 space-y-10">
        <section className="card-cultural p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('a11yPage.done.title')}</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            {done.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-green-600 flex-shrink-0" aria-hidden>✓</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-cultural p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('a11yPage.limits.title')}</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            {limits.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-amber-600 flex-shrink-0" aria-hidden>▸</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-cultural p-8 border-l-4 border-zhuang-blue">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{t('a11yPage.feedback.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('a11yPage.feedback.body')}</p>
        </section>
      </div>
    </main>
  );
}
