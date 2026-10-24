import type { Metadata } from 'next';
import Link from 'next/link';
import { ASEAN_COUNTRIES } from '@/constants/routes';
import Icon, { Flag, HeroImage, AseanPhoto, type IconName } from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import { ASEAN_NAMES, type AseanCountryCode } from '@/lib/data/aseanProfiles';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'asean');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function AseanHallPage({ params }: { params: { locale: string } }) {
  const { t, locale } = getT(params.locale, 'asean');
  const countryOf = (code: string) => ASEAN_NAMES[code as AseanCountryCode];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="asean" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70"></div>

        {/* 底部东盟十国国旗条 */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/45 backdrop-blur-sm">
          <div className="container-custom py-3 flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            {ASEAN_COUNTRIES.map((country) => (
              <Flag key={country.code} country={country.code} width={34} />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            {t('hero.titleEn')}
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* 国家导航 */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-3">
            {ASEAN_COUNTRIES.map((country) => {
              const name = countryOf(country.code);
              return (
                <Link
                  key={country.code}
                  href={`/${locale}/asean/${country.code}`}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-asean-blue hover:text-white transition-colors text-sm font-medium"
                >
                  <Flag country={country.code} width={22} />
                  {locale === 'zh' ? name.zh : name.en}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 十国入口卡片：直接进入各国详情页 */}
      <section className="py-14 bg-gray-50 dark:bg-gray-800/40">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('others.title')}</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('nav.allCountries')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ASEAN_COUNTRIES.map((country) => {
              const name = countryOf(country.code);
              return (
                <Link
                  key={country.code}
                  href={`/${locale}/asean/${country.code}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-asean-blue hover:shadow-md transition-all"
                >
                  <Flag country={country.code} width={30} />
                  <span className="text-sm font-medium truncate">{locale === 'zh' ? name.zh : name.en}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 泰国文化区 */}
      <section id="thailand" className="py-20">
        <div className="container-custom">
          <CountryHeader
            country="thailand"
            nameKey="thailand.name"
            nameEn="Thailand"
            taglineKey="thailand.tagline"
            locale={locale}
            t={t}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              image="thailand-grand-palace"
              titleKey="thailand.card1"
              subtitle="Grand Palace"
              descKey="thailand.card1Desc"
              t={t}
            />
            <CulturalCard
              image="thailand-songkran"
              titleKey="thailand.card2"
              subtitle="Songkran"
              descKey="thailand.card2Desc"
              t={t}
            />
            <CulturalCard
              image="thailand-muaythai"
              titleKey="thailand.card3"
              subtitle="Muay Thai"
              descKey="thailand.card3Desc"
              t={t}
            />
          </div>
        </div>
      </section>

      {/* 越南文化区 */}
      <section id="vietnam" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <CountryHeader
            country="vietnam"
            nameKey="vietnam.name"
            nameEn="Vietnam"
            taglineKey="vietnam.tagline"
            locale={locale}
            t={t}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              image="vietnam-aodai"
              titleKey="vietnam.card1"
              subtitle="Áo Dài"
              descKey="vietnam.card1Desc"
              t={t}
            />
            <CulturalCard
              image="vietnam-water-puppetry"
              titleKey="vietnam.card2"
              subtitle="Water Puppetry"
              descKey="vietnam.card2Desc"
              t={t}
            />
            <CulturalCard
              image="vietnam-tet"
              titleKey="vietnam.card3"
              subtitle="Tết Festival"
              descKey="vietnam.card3Desc"
              t={t}
            />
          </div>
        </div>
      </section>

      {/* 印度尼西亚文化区 */}
      <section id="indonesia" className="py-20">
        <div className="container-custom">
          <CountryHeader
            country="indonesia"
            nameKey="indonesia.name"
            nameEn="Indonesia"
            taglineKey="indonesia.tagline"
            locale={locale}
            t={t}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              image="indonesia-borobudur"
              titleKey="indonesia.card1"
              subtitle="Borobudur"
              descKey="indonesia.card1Desc"
              t={t}
            />
            <CulturalCard
              image="indonesia-batik"
              titleKey="indonesia.card2"
              subtitle="Batik"
              descKey="indonesia.card2Desc"
              t={t}
            />
            <CulturalCard
              image="indonesia-wayang"
              titleKey="indonesia.card3"
              subtitle="Wayang"
              descKey="indonesia.card3Desc"
              t={t}
            />
          </div>
        </div>
      </section>

      {/* 其他七国概览 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">{t('others.title')}</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            {t('others.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCountries.map((country) => (
              <Link
                key={country.code}
                href={`/${locale}/asean/${country.code}`}
                className="card-cultural group"
                aria-label={`${t(country.nameKey)} — ${t('others.openDetail')}`}
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <AseanPhoto
                    name={country.code}
                    label={t(country.nameKey)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* 国旗角标 */}
                  <div className="absolute top-3 left-3 rounded shadow-md overflow-hidden">
                    <Flag country={country.code} width={40} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-asean-blue transition-colors">
                    {t(country.nameKey)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {country.nameEn}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {t(country.highlightKey)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-asean-blue group-hover:translate-x-1 transition-transform">
                    {t('others.openDetail')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UNESCO遗产专题 */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4 text-asean-blue"><Icon name="museum" size={64} /></div>
            <h2 className="text-4xl font-bold mb-4">{t('unesco.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('unesco.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {unescoSites.map((site, idx) => (
              <div key={idx} className="card-cultural overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${site.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Flag country={site.countryCode} width={34} />
                    <span className="text-sm text-gray-500">{t(site.countryKey)}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t(site.nameKey)}</h3>
                  <p className="text-sm text-gray-500 mb-3">{site.nameEn}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {t(site.descKey)}
                  </p>
                  <div className="inline-block bg-asean-yellow/20 text-asean-blue px-3 py-1 rounded-full text-xs font-medium">
                    {t('unesco.inscribed', { year: site.year })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-asean-blue hover:text-asean-red transition-colors font-medium"
          >
            ← {t('back')}
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function CountryHeader({ country, nameKey, nameEn, taglineKey, locale, t }: {
  country: string;
  nameKey: string;
  nameEn: string;
  taglineKey: string;
  locale: string;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8">
      <div className="flex justify-center mb-4">
        <Flag country={country} width={96} />
      </div>
      <h2 className="text-4xl font-bold mb-2">{t(nameKey)}</h2>
      <p className="text-lg text-gray-500 mb-3">{nameEn}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{t(taglineKey)}</p>
      <Link
        href={`/${locale}/asean/${country}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-asean-blue hover:text-asean-red transition-colors"
      >
        {t('others.openDetail')} →
      </Link>
    </div>
  );
}

function CulturalCard({ image, titleKey, subtitle, descKey, t }: {
  image: string;
  titleKey: string;
  subtitle: string;
  descKey: string;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  return (
    <div className="card-cultural overflow-hidden group">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        <AseanPhoto
          name={image}
          label={t(titleKey)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{t(titleKey)}</h3>
        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{t(descKey)}</p>
      </div>
    </div>
  );
}

// 数据定义
const otherCountries = [
  {
    code: 'malaysia',
    nameKey: 'others.malaysia',
    nameEn: 'Malaysia',
    highlightKey: 'others.malaysiaDesc',
    gradient: 'from-blue-600 to-yellow-500',
  },
  {
    code: 'singapore',
    nameKey: 'others.singapore',
    nameEn: 'Singapore',
    highlightKey: 'others.singaporeDesc',
    gradient: 'from-red-500 to-white',
  },
  {
    code: 'philippines',
    nameKey: 'others.philippines',
    nameEn: 'Philippines',
    highlightKey: 'others.philippinesDesc',
    gradient: 'from-blue-600 to-red-600',
  },
  {
    code: 'cambodia',
    nameKey: 'others.cambodia',
    nameEn: 'Cambodia',
    highlightKey: 'others.cambodiaDesc',
    gradient: 'from-blue-800 to-red-700',
  },
  {
    code: 'laos',
    nameKey: 'others.laos',
    nameEn: 'Laos',
    highlightKey: 'others.laosDesc',
    gradient: 'from-red-600 to-blue-600',
  },
  {
    code: 'myanmar',
    nameKey: 'others.myanmar',
    nameEn: 'Myanmar',
    highlightKey: 'others.myanmarDesc',
    gradient: 'from-yellow-500 to-green-600',
  },
  {
    code: 'brunei',
    nameKey: 'others.brunei',
    nameEn: 'Brunei',
    highlightKey: 'others.bruneiDesc',
    gradient: 'from-yellow-400 to-black',
  },
];

const unescoSites = [
  {
    countryCode: 'cambodia',
    countryKey: 'unesco.cambodia',
    nameEn: 'Angkor Wat',
    nameKey: 'unesco.angkor',
    descKey: 'unesco.angkorDesc',
    year: 1992,
    color: 'from-amber-500 to-orange-600',
  },
  {
    countryCode: 'indonesia',
    countryKey: 'unesco.indonesia',
    nameEn: 'Borobudur',
    nameKey: 'unesco.borobudur',
    descKey: 'unesco.borobudurDesc',
    year: 1991,
    color: 'from-amber-500 to-amber-800',
  },
  {
    countryCode: 'laos',
    countryKey: 'unesco.laos',
    nameEn: 'Luang Prabang',
    nameKey: 'unesco.luangprabang',
    descKey: 'unesco.luangprabangDesc',
    year: 1995,
    color: 'from-blue-500 to-purple-600',
  },
  {
    countryCode: 'vietnam',
    countryKey: 'unesco.vietnam',
    nameEn: 'Nhã nhạc court music',
    nameKey: 'unesco.nhaNhac',
    descKey: 'unesco.nhaNhacDesc',
    year: 2008,
    color: 'from-green-500 to-teal-600',
  },
  {
    countryCode: 'indonesia',
    countryKey: 'unesco.indonesia',
    nameEn: 'Indonesian Batik',
    nameKey: 'unesco.batik',
    descKey: 'unesco.batikDesc',
    year: 2009,
    color: 'from-purple-600 to-pink-600',
  },
  {
    countryCode: 'philippines',
    countryKey: 'unesco.philippines',
    nameEn: 'Rice Terraces',
    nameKey: 'unesco.riceTerraces',
    descKey: 'unesco.riceTerracesDesc',
    year: 1995,
    color: 'from-green-600 to-lime-600',
  },
];
