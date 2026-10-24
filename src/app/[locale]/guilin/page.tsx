import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { CultureImage, HeroImage, type CultureImageName } from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import JiumaGame from './JiumaGame';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'guilin');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function GuilinHallPage({ params }: { params: { locale: string } }) {
  const { t, locale } = getT(params.locale, 'guilin');
  return (
    <main id="main-content" className="min-h-screen">
      {/* 展厅标题 - 水墨画风格 */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="guilin" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />

<div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-lg animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl mb-2 text-white/90 animate-slide-up animation-delay-200">
            {t('hero.titleEn')}
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/85 animate-slide-up animation-delay-300">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* 雾气粒子效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-mist-flow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-mist-flow animation-delay-500"></div>
        </div>
      </section>

      {/* 展区导航 */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-ink-cyan hover:text-white transition-colors text-sm font-medium"
              >
                
                {t(section.titleKey)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 漓江烟雨区 */}
      <section id="lijiang" className="py-20 bg-gradient-to-b from-white to-ink-gray-light/10">
        <div className="container-custom">
          <SectionHeader
            image="guilin-landscape"
            title={t('lijiang.title')}
            subtitle={t('lijiang.subtitle')}
            description={t('lijiang.description')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="card-cultural p-8 bg-gradient-to-br from-ink-cyan/10 to-ink-green/10">
                <h3 className="text-2xl font-bold mb-4 text-ink-black">{t('lijiang.cardTitle')}</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    {t('lijiang.cardBody')}
                  </p>
                  <div className="border-l-4 border-ink-cyan pl-4 italic text-ink-gray-dark">
                    "{t('lijiang.poemQuote')}" <br/>
                    <span className="text-sm">— {t('lijiang.poemAuthor')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {lijiangFeatures.map((feature, idx) => (
                  <div key={idx} className="card-cultural p-4 text-center">
                    <div className="font-bold text-lg mb-1">{t(feature.nameKey)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t(feature.descKey)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-ink-gray to-ink-cyan rounded-lg overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <HeroImage name="guilin" style={{ position: "absolute", inset: 0, opacity: 0.55 }} />
                    <p className="text-xl font-bold relative">{t('lijiang.panoramaTitle')}</p>
                    <p className="text-sm opacity-75 mt-2">{t('lijiang.panoramaHint')}</p>
                  </div>
                </div>
              </div>

              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">{t('lijiang.poemsTitle')}</h4>
                <div className="space-y-3 text-sm">
                  {poems.map((poem, idx) => (
                    <div key={idx} className="border-l-2 border-ink-blue pl-3">
                      <div className="font-medium text-ink-black dark:text-white">{t(poem.textKey)}</div>
                      <div className="text-gray-500 text-xs mt-1">— {t(poem.authorKey)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 喀斯特峰林区 */}
      <section id="karst" className="py-20 bg-ink-gray-light/5">
        <div className="container-custom">
          <SectionHeader
            image="guilin-landscape"
            title={t('karst.title')}
            subtitle={t('karst.subtitle')}
            description={t('karst.description')}
          />

          <div className="mt-12">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden relative">
              <HeroImage name="guilin" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <p className="text-2xl font-bold mb-2">{t('karst.viewerTitle')}</p>
                <p className="text-sm opacity-85">{t('karst.viewerHint')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {karstFeatures.map((feature, idx) => (
                <div key={idx} className="card-cultural p-6">
                  <div className="flex justify-center mb-3 text-ink-cyan"><Icon name={feature.icon} size={40} /></div>
                  <h4 className="font-bold text-lg mb-2">{t(feature.titleKey)}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(feature.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 象鼻山地标区 */}
      <section id="elephant" className="py-20">
        <div className="container-custom">
          <SectionHeader
            image="guilin-landscape"
            title={t('elephant.title')}
            subtitle={t('elephant.subtitle')}
            description={t('elephant.description')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative group">
                <HeroImage name="guilin" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <p className="text-2xl font-bold mb-1">{t('elephant.modelTitle')}</p>
                  <p className="text-sm opacity-85">{t('elephant.modelHint')}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">{t('elephant.geologyTitle')}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('elephant.geologyBody')}
                </p>
              </div>

              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">{t('elephant.symbolTitle')}</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    {t('elephant.symbol1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    {t('elephant.symbol2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    {t('elephant.symbol3')}
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-ink-cyan/20 to-ink-green/20 p-4 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{t('elephant.bestTimeLabel')}</strong><br/>
                  {t('elephant.bestTimeBody')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 九马画山诗意区 */}
      <section id="jiuma" className="py-20 bg-gradient-to-br from-ink-gray-light/10 to-transparent">
        <div className="container-custom">
          <SectionHeader
            image="guilin-landscape"
            title={t('jiuma.title')}
            subtitle={t('jiuma.subtitle')}
            description={t('jiuma.description')}
          />

          <div className="mt-12">
            <div className="card-cultural p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-ink-cyan to-ink-green px-6 py-2 rounded-full text-white font-medium mb-4">
                  {t('jiuma.gameTitle')}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('jiuma.gameDesc')}
                </p>
              </div>

              <JiumaGame />
            </div>
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-ink-cyan hover:text-ink-blue transition-colors font-medium"
          >
            ← {t('back')}
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function SectionHeader({ image, title, subtitle, description }: {
  image: CultureImageName;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <CultureImage name={image} style={{ width: 96, height: 96 }} label={title} />
      </div>
      <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-ink-cyan font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'lijiang', titleKey: 'nav.lijiang', image: 'guilin-landscape' as const },
  { id: 'karst', titleKey: 'nav.karst', image: 'rice-terraces' as const },
  { id: 'elephant', titleKey: 'nav.elephant', image: 'ink-painting' as const },
  { id: 'jiuma', titleKey: 'nav.jiuma', image: 'huashan-rock-art' as const },
];

const lijiangFeatures = [
  { nameKey: 'lijiang.feature1', descKey: 'lijiang.feature1Desc' },
  { nameKey: 'lijiang.feature2', descKey: 'lijiang.feature2Desc' },
  { nameKey: 'lijiang.feature3', descKey: 'lijiang.feature3Desc' },
  { nameKey: 'lijiang.feature4', descKey: 'lijiang.feature4Desc' },
];

const poems = [
  { textKey: 'lijiang.poem1Text', authorKey: 'lijiang.poem1Author' },
  { textKey: 'lijiang.poem2Text', authorKey: 'lijiang.poem2Author' },
  { textKey: 'lijiang.poem3Text', authorKey: 'lijiang.poem3Author' },
];

const karstFeatures = [
  {
    icon: 'mountain' as const,
    titleKey: 'karst.feature1',
    descriptionKey: 'karst.feature1Desc',
  },
  {
    icon: 'mountain' as const,
    titleKey: 'karst.feature2',
    descriptionKey: 'karst.feature2Desc',
  },
  {
    icon: 'globe' as const,
    titleKey: 'karst.feature3',
    descriptionKey: 'karst.feature3Desc',
  },
];
