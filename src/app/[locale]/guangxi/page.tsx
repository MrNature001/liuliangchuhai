import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { CultureImage, HeroImage, type CultureImageName } from '@/components/ui/Icon';
import FestivalActivities from '@/components/guangxi/FestivalActivities';
import { getT } from '@/i18n/server';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'guangxi');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function GuangxiHallPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'guangxi');
  const { locale } = getT(params.locale, 'guangxi');

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 | Hall Title */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* 背景：花山岩画·广西实景 */}
        <div className="absolute inset-0">
          <HeroImage name="guangxi" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70"></div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            {t('hero.titleEn')}
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto animate-slide-up animation-delay-300">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* 展区导航 | Section Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-zhuang-red hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CultureImage name={section.icon} style={{ width: 20, height: 20 }} />
                {t(section.titleKey)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 左江花山岩画区 | Huashan Rock Art Section */}
      <section id="huashan" className="py-20">
        <div className="container-custom">
          <SectionHeader
            image="huashan-rock-art"
            title={t('huashan.title')}
            subtitle={t('huashan.tag')}
            description={t('huashan.desc')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-2xl font-bold mb-4 text-zhuang-red">{t('huashan.historyTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('huashan.historyBody')}
                </p>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-2xl font-bold mb-4 text-zhuang-blue">{t('huashan.symbolTitle')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CultureImage name="huashan-rock-art" style={{ width: 32, height: 32 }} />
                    <div>
                      <strong className="text-gray-900 dark:text-white">{t('huashan.symbol1')}</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('huashan.symbol1Desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="share" size={32} />
                    <div>
                      <strong className="text-gray-900 dark:text-white">{t('huashan.symbol2')}</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('huashan.symbol2Desc')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="lantern" size={32} />
                    <div>
                      <strong className="text-gray-900 dark:text-white">{t('huashan.symbol3')}</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('huashan.symbol3Desc')}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center text-white">
                <div className="text-center">
                  <CultureImage
                    name="huashan-rock-art"
                    style={{ width: 160, height: 100, margin: "0 auto 16px" }}
                  />
                  <p className="text-xl">{t('huashan.viewerTitle')}</p>
                  <p className="text-sm opacity-75 mt-2">{t('huashan.viewerHint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zhuang-red/10 dark:bg-zhuang-red/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-zhuang-red mb-1">38+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('huashan.stat1')}</div>
                </div>
                <div className="bg-zhuang-blue/10 dark:bg-zhuang-blue/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-zhuang-blue mb-1">2016</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('huashan.stat2')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 壮锦织艺区 | Zhuangjin Weaving Section */}
      <section id="zhuangjin" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            image="zhuangjin-diamond"
            title={t('zhuangjin.title')}
            subtitle={t('zhuangjin.tag')}
            description={t('zhuangjin.desc')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {zhuangjinPatterns.map((pattern, index) => (
              <div key={index} className="card-cultural group">
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <CultureImage
                    name={pattern.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t(pattern.nameKey)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t(pattern.descKey)}
                  </p>
                  <div className="flex gap-2">
                    {pattern.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 铜鼓文化区 | Bronze Drum Section */}
      <section id="tonggu" className="py-20">
        <div className="container-custom">
          <SectionHeader
            image="bronze-drum"
            title={t('tonggu.title')}
            subtitle={t('tonggu.tag')}
            description={t('tonggu.desc')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-square rounded-lg overflow-hidden relative group bg-gray-100 dark:bg-gray-800">
                <CultureImage
                  name="bronze-drum"
                  label={t('tonggu.title')}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                <p className="absolute bottom-3 inset-x-0 text-center text-xs text-white/90">
                  {t('tonggu.imageCaption')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-3 text-zhuang-gold">{t('tonggu.historyTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('tonggu.historyBody')}
                </p>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-3 text-zhuang-gold">{t('tonggu.meaningTitle')}</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> {t('tonggu.meaning1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> {t('tonggu.meaning2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> {t('tonggu.meaning3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> {t('tonggu.meaning4')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 干栏式建筑区 | Stilt-house Architecture Section */}
      <section id="architecture" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            image="stilt-house"
            title={t('architecture.title')}
            subtitle={t('architecture.tag')}
            description={t('architecture.desc')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <CultureImage
                name="stilt-house"
                label={t('architecture.title')}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-5">
              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-3 text-zhuang-red">{t('architecture.whyTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('architecture.whyBody')}</p>
              </div>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-zhuang-blue" aria-hidden>▸</span>
                    <span>{t(`architecture.point${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 刘三姐与歌圩区 | Liu Sanjie & Song Fair Section */}
      <section id="liusanjie" className="py-20">
        <div className="container-custom">
          <SectionHeader
            image="zhuangjin-wave"
            title={t('liusanjie.title')}
            subtitle={t('liusanjie.tag')}
            description={t('liusanjie.desc')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card-cultural p-6 lg:col-span-2">
              <h3 className="text-xl font-bold mb-3 text-zhuang-blue">{t('liusanjie.storyTitle')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('liusanjie.storyBody')}</p>
              <div className="mt-5 rounded-lg bg-zhuang-blue/5 dark:bg-zhuang-blue/20 p-4 italic text-gray-700 dark:text-gray-200">
                {t('liusanjie.quote')}
              </div>
            </div>
            <div className="space-y-4">
              <div className="card-cultural p-5">
                <div className="text-sm text-gray-500 mb-1">{t('liusanjie.statLabel')}</div>
                <div className="text-3xl font-bold text-zhuang-red">1200+</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('liusanjie.statHint')}</p>
              </div>
              <Link
                href={`/${locale}/interactive#games`}
                className="card-cultural p-5 block hover:border-zhuang-red"
              >
                <div className="font-bold mb-1">{t('liusanjie.ctaTitle')}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('liusanjie.ctaBody')}</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 三月三节日体验区 | Sanyuesan Festival Section */}
      <section id="sanyuesan" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            image="embroidery-ball"
            title={t('sanyuesan.title')}
            subtitle={t('sanyuesan.tag')}
            description={t('sanyuesan.desc')}
          />

          <FestivalActivities />
        </div>
      </section>

      {/* 返回导航 | Back Navigation */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container-custom text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-zhuang-blue hover:text-zhuang-red transition-colors font-medium"
          >
            ← {t('back')}
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件 | Helper Components
function SectionHeader({
  image,
  title,
  subtitle,
  description,
}: {
  image: CultureImageName;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <CultureImage name={image} style={{ width: 92, height: 92 }} label={title} />
      </div>
      <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-zhuang-red font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义 | Data Definitions
const sections = [
  { id: 'huashan', titleKey: 'nav.huashan', icon: 'huashan-rock-art' },
  { id: 'zhuangjin', titleKey: 'nav.zhuangjin', icon: 'zhuangjin-diamond' },
  { id: 'tonggu', titleKey: 'nav.tonggu', icon: 'bronze-drum' },
  { id: 'architecture', titleKey: 'nav.architecture', icon: 'stilt-house' },
  { id: 'sanyuesan', titleKey: 'nav.sanyuesan', icon: 'embroidery-ball' },
  { id: 'liusanjie', titleKey: 'nav.liusanjie', icon: 'zhuangjin-wave' },
] as const;

const zhuangjinPatterns = [
  {
    nameKey: 'zhuangjin.pattern1',
    descKey: 'zhuangjin.pattern1Desc',
    image: 'zhuangjin-diamond' as const,
    colors: ['#D73C2C', '#1E5BA8', '#D4AF37'],
  },
  {
    nameKey: 'zhuangjin.pattern2',
    descKey: 'zhuangjin.pattern2Desc',
    image: 'zhuangjin-fret' as const,
    colors: ['#1E5BA8', '#2E8B57', '#1A1A1A'],
  },
  {
    nameKey: 'zhuangjin.pattern3',
    descKey: 'zhuangjin.pattern3Desc',
    image: 'zhuangjin-wave' as const,
    colors: ['#7FCDCD', '#1E5BA8', '#FFFFFF'],
  },
];

