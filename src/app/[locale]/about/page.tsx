import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'pages');
  return { title: t('meta.about.title'), description: t('meta.about.desc') };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'pages');

  const sections: { icon: 'museum' | 'handshake' | 'archive' | 'camera' | 'globe'; title: string; body?: string; items?: string[] }[] = [
    { icon: 'museum', title: t('about.mission.title'), body: t('about.mission.body') },
    { icon: 'handshake', title: t('about.method.title'), body: t('about.method.body') },
    { icon: 'archive', title: t('about.sources.title'), body: t('about.sources.body') },
    {
      icon: 'camera',
      title: t('about.limits.title'),
      items: [t('about.limits.item1'), t('about.limits.item2'), t('about.limits.item3'), t('about.limits.item4')],
    },
    { icon: 'globe', title: t('about.stack.title'), body: t('about.stack.body') },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="relative py-20 bg-gradient-to-br from-zhuang-blue to-zhuang-black text-white">
        <div className="container-custom max-w-4xl">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="museum" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">{t('about.title')}</h1>
          <p className="text-lg opacity-90 leading-relaxed text-center">{t('about.lead')}</p>
        </div>
      </header>

      <div className="container-custom max-w-4xl py-16 space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="card-cultural p-8">
            <div className="flex items-start gap-5">
              <span className="text-zhuang-blue flex-shrink-0">
                <Icon name={section.icon} size={36} />
              </span>
              <div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{section.title}</h2>
                {section.body && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.body}</p>
                )}
                {section.items && (
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2 leading-relaxed">
                        <span className="text-zhuang-red mt-1" aria-hidden>▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
