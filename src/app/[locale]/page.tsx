import type { Metadata } from 'next';
import Link from 'next/link';
import Icon, { HeroImage, CultureImage, type IconName } from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import { LOCALES, LOCALE_META } from '@/i18n/config';

/** 首页元信息（跟随语言） */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'home');
  return { title: t('meta.title'), description: t('meta.description') };
}

/** 展厅封面图映射 */
const EXHIBITION_IMAGE: Record<string, string> = {
  guangxi: 'culture/huashan-rock-art',     // 花山岩画 —— 广西壮族文化标志
  guilin: 'culture/guilin-landscape',      // 桂林喀斯特
  asean: 'culture/asean-culture',          // 吴哥窟 —— 东盟文化遗产
  exchange: 'culture/silk-road-sea',       // 海上丝路帆船
  archive: 'culture/archives',             // 古籍档案
  interactive: 'culture/festival',         // 民族节庆
};

/** 展厅顺序与路径（文案走 header 命名空间，与导航栏共用同一批 key） */
const EXHIBITIONS = [
  { key: 'guangxi', path: '/guangxi' },
  { key: 'guilin', path: '/guilin' },
  { key: 'asean', path: '/asean' },
  { key: 'exchange', path: '/exchange' },
  { key: 'archive', path: '/archive' },
  { key: 'interactive', path: '/interactive' },
];

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'home');
  const { t: th } = getT(params.locale, 'header');
  const { t: tc } = getT(params.locale, 'common');
  const { locale } = getT(params.locale, 'home');

  return (
    <main id="main-content" className="min-h-screen">
      {/* 英雄区域 | Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="guangxi" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60"></div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up animation-delay-200">
            {t('hero.titleEn')}
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 animate-slide-up animation-delay-300">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-500">
            <Link
              href={`/${locale}/persona`}
              className="btn-embroidery text-lg px-8 py-4"
            >
              {t('hero.ctaPersona')}
            </Link>
            <Link
              href={`/${locale}/guangxi`}
              className="glass-effect text-white px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform"
            >
              {t('hero.ctaExplore')}
            </Link>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* 文化人设生成器推广 | Persona Generator Promotion */}
      <section className="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6 animate-embroidery-bounce">
              <CultureImage
                name="embroidery-ball"
                style={{ width: 120, height: 120 }}
                label={t('persona.tag1')}
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('persona.title')}
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('persona.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['tag1', 'tag2', 'tag3', 'tag4', 'tag5'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm"
                >
                  {t(`persona.${tag}`)}
                </span>
              ))}
            </div>
            <Link
              href={`/${locale}/persona`}
              className="inline-block bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t('persona.cta')}
            </Link>
            <p className="text-sm mt-4 opacity-75">{t('persona.socialProof')}</p>
          </div>
        </div>
      </section>

      {/* 展厅导航 | Exhibition Navigation */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4 text-gradient-zhuang">
            {t('exhibitions.title')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            {t('exhibitions.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXHIBITIONS.map((exhibition, index) => (
              <Link
                key={exhibition.key}
                href={`/${locale}${exhibition.path}`}
                className="card-cultural group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${EXHIBITION_IMAGE[exhibition.key]}.jpg`}
                    alt={th(`exhibition.${exhibition.key}`)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-zhuang-red transition-colors">
                    {th(`exhibition.${exhibition.key}`)}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {th(`exhibition.${exhibition.key}.desc`)}
                  </p>
                  <div className="mt-4 flex items-center text-zhuang-blue font-medium group-hover:translate-x-2 transition-transform">
                    {t('exhibitions.explore')} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特色功能 | Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">{t('features.title')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon="gamepad" title={t('features.3d.title')} description={t('features.3d.desc')} />
            <FeatureCard icon="camera" title={t('features.ar.title')} description={t('features.ar.desc')} />
            <FeatureCard icon="globe" title={t('features.i18n.title')} description={t('features.i18n.desc')} />
            <FeatureCard icon="medal" title={t('features.a11y.title')} description={t('features.a11y.desc')} />
          </div>
        </div>
      </section>

      {/* 文化亮点 | Cultural Highlights */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">{t('highlights.title')}</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            {t('highlights.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HighlightCard
              title={t('highlights.huashan.title')}
              subtitle={t('highlights.huashan.tag')}
              description={t('highlights.huashan.desc')}
              image="huashan-rock-art"
            />
            <HighlightCard
              title={t('highlights.zhuangjin.title')}
              subtitle={t('highlights.zhuangjin.tag')}
              description={t('highlights.zhuangjin.desc')}
              image="zhuangjin-diamond"
            />
            <HighlightCard
              title={t('highlights.tonggu.title')}
              subtitle={t('highlights.tonggu.tag')}
              description={t('highlights.tonggu.desc')}
              image="bronze-drum"
            />
          </div>
        </div>
      </section>

      {/* 页脚 | Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">{tc('footer.aboutUs')}</h3>
              <p className="text-sm">{tc('footer.aboutDesc')}</p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">{tc('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/about`} className="hover:text-white">{tc('footer.about')}</Link></li>
                <li><Link href={`/${locale}/accessibility`} className="hover:text-white">{tc('footer.accessibility')}</Link></li>
                <li><Link href={`/${locale}/privacy`} className="hover:text-white">{tc('footer.privacy')}</Link></li>
                <li><Link href={`/${locale}/contact`} className="hover:text-white">{tc('footer.contact')}</Link></li>
                <li><Link href={`/${locale}/credits`} className="hover:text-white">{tc('footer.credits')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">{tc('footer.languages')}</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                {LOCALES.map((code, i) => (
                  <span key={code} className="flex items-center">
                    {i > 0 && <span className="text-gray-600 mr-2">|</span>}
                    <Link href={`/${code}`} hrefLang={code} className="hover:text-white">
                      {LOCALE_META[code].nativeName}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>{tc('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// 辅助组件 | Helper Components
function FeatureCard({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
      <div className="flex justify-center mb-4 text-zhuang-red dark:text-zhuang-gold">
        <Icon name={icon} size={52} />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function HighlightCard({ title, subtitle, description, image }: {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}) {
  return (
    <div className="card-cultural overflow-hidden group">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/culture/${image}.jpg`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{subtitle}</div>
        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-zhuang-red transition-colors">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
