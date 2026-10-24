import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { CultureImage, AseanPhoto } from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import attribution from '../../../../data/photo-attribution.json';

interface Credit {
  key: string;
  fileTitle: string;
  sourcePage: string;
  uploader: string;
  originalWidth: number;
  originalHeight: number;
  license: string;
  group?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'credits');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function CreditsPage({ params }: { params: { locale: string } }) {
  const { t, locale } = getT(params.locale, 'credits');
  const credits = attribution as Credit[];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 页头 */}
      <section className="relative py-20 bg-gradient-to-br from-zhuang-blue to-zhuang-black text-white">
        <div className="container-custom text-center">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="camera" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('hero.title')}</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom max-w-5xl">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-10">{t('intro')}</p>

          {/* 署名列表（按组） */}
          {[
            { g: 'culture', items: credits.filter((c) => c.group !== 'asean') },
            { g: 'asean', items: credits.filter((c) => c.group === 'asean') },
          ].map(({ g, items }) =>
            items.length ? (
              <div key={g} className="mb-12">
                <h2 className="text-2xl font-bold mb-5 pb-2 border-b-2 border-zhuang-red text-gray-900 dark:text-white">
                  {t(`group.${g}`)}
                </h2>
                <div className="space-y-4">
                  {items.map((c) => (
                    <div key={c.key} className="card-cultural flex flex-col sm:flex-row gap-5 p-4 items-start">
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                        {g === 'asean' ? (
                          <AseanPhoto name={c.key} className="w-full h-full object-cover" />
                        ) : (
                          <CultureImage name={c.key as never} className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                          {t(`subject.${c.key}`)}
                        </h3>
                        <dl className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex gap-2">
                            <dt className="text-gray-500 flex-shrink-0">{t('table.photographer')}:</dt>
                            <dd className="font-medium text-gray-800 dark:text-gray-200">{c.uploader}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="text-gray-500 flex-shrink-0">{t('table.resolution')}:</dt>
                            <dd>
                              {c.originalWidth} × {c.originalHeight}
                            </dd>
                          </div>
                        </dl>
                        <a
                          href={c.sourcePage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-sm text-zhuang-blue hover:text-zhuang-red transition-colors break-all"
                        >
                          <Icon name="share" size={14} />
                          {t('table.source')} · Wikimedia Commons
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}

          {/* 使用说明 */}
          <div className="mt-12 space-y-5">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-l-4 border-zhuang-blue">
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{t('notice.title')}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('notice.body')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-l-4 border-zhuang-gold">
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                {t('illustration.title')}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('notice.illustration')}
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-zhuang-blue hover:text-zhuang-red transition-colors font-medium"
            >
              ← {t('back')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
