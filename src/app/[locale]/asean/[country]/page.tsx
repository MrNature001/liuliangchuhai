import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Flag, AseanPhoto, CultureImage } from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import { normalizeLocale } from '@/i18n/config';
import {
  ASEAN_COUNTRY_CODES,
  ASEAN_NAMES,
  ASEAN_PROFILES,
  getProfile,
  localized,
  isAseanCountryCode,
} from '@/lib/data/aseanProfiles';

export function generateStaticParams() {
  return ASEAN_COUNTRY_CODES.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; country: string };
}): Promise<Metadata> {
  const profile = getProfile(params.country);
  if (!profile) return { title: '404' };
  const locale = normalizeLocale(params.locale);
  const name = localized(profile.name, locale);
  return {
    title: `${name} · ${localized(profile.tagline, locale)}`,
    description: localized(profile.intro, locale).slice(0, 150),
    alternates: {
      canonical: `/${locale}/asean/${profile.code}`,
    },
  };
}

export default function CountryPage({
  params,
}: {
  params: { locale: string; country: string };
}) {
  if (!isAseanCountryCode(params.country)) notFound();
  const profile = ASEAN_PROFILES[params.country];
  const locale = normalizeLocale(params.locale);
  const { t } = getT(params.locale, 'asean');
  const L = (v: Parameters<typeof localized>[0]) => localized(v, locale);

  const index = ASEAN_COUNTRY_CODES.indexOf(params.country);
  const prev = ASEAN_COUNTRY_CODES[(index - 1 + ASEAN_COUNTRY_CODES.length) % ASEAN_COUNTRY_CODES.length];
  const next = ASEAN_COUNTRY_CODES[(index + 1) % ASEAN_COUNTRY_CODES.length];

  const facts = [
    { label: L({ zh: '正式名称', en: 'Official name' }), value: L(profile.officialName) },
    { label: L({ zh: '首都', en: 'Capital' }), value: L(profile.capital) },
    { label: L({ zh: '语言', en: 'Language' }), value: L(profile.language) },
    { label: L({ zh: '货币', en: 'Currency' }), value: L(profile.currency) },
    { label: L({ zh: '人口（约）', en: 'Population (approx.)' }), value: profile.population },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 顶部：实景照片 + 国旗 */}
      <section className="relative h-[52vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <AseanPhoto
            name={profile.heroImage}
            label={L(profile.name)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

        <div className="relative z-10 text-center text-white px-4">
          <div className="flex justify-center mb-4">
            <Flag country={profile.code} width={84} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">{L(profile.name)}</h1>
          <p className="text-lg md:text-2xl opacity-90 max-w-2xl mx-auto">{L(profile.tagline)}</p>
        </div>
      </section>

      {/* 面包屑 */}
      <nav aria-label="Breadcrumb" className="border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-3 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
          <Link href={`/${locale}`} className="hover:text-zhuang-red">← {t('back')}</Link>
          <span aria-hidden>/</span>
          <Link href={`/${locale}/asean`} className="hover:text-zhuang-red">{t('hero.title')}</Link>
          <span aria-hidden>/</span>
          <span className="text-gray-800 dark:text-gray-200">{L(profile.name)}</span>
        </div>
      </nav>

      <div className="container-custom py-14 space-y-16">
        {/* 概览 + 事实卡 */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-3">{L({ zh: '概览', en: 'Overview' })}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{L(profile.intro)}</p>

            <div className="mt-8 card-cultural p-6 border-l-4" style={{ borderLeftColor: profile.flagColors[0] }}>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                {L({ zh: '与广西的关联', en: 'Connection to Guangxi' })}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{L(profile.guangxiLink)}</p>
            </div>
          </div>

          <aside className="card-cultural p-6 h-fit">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              {L({ zh: '基本信息', en: 'At a glance' })}
            </h2>
            <dl className="space-y-3 text-sm">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col">
                  <dt className="text-gray-500 dark:text-gray-400">{f.label}</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-1 mt-5" aria-hidden>
              {profile.flagColors.map((c, i) => (
                <span key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </aside>
        </section>

        {/* 文化亮点 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {L({ zh: '代表性文化', en: 'Cultural highlights' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.highlights.map((h) => (
              <article key={h.title.zh} className="card-cultural overflow-hidden">
                {h.image && (
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                    <AseanPhoto
                      name={h.image}
                      label={L(h.title)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{L(h.title)}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{L(h.desc)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* UNESCO */}
        {profile.unesco.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-2">
              {L({ zh: 'UNESCO 世界遗产与非遗', en: 'UNESCO World & Intangible Heritage' })}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {L({
                zh: '年份为 UNESCO 正式列入年份；「非遗」指人类非物质文化遗产代表作名录。',
                en: 'Years are the official UNESCO inscription years; “intangible” refers to the Representative List of the Intangible Cultural Heritage of Humanity.',
              })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.unesco.map((u) => (
                <div key={u.name.zh} className="card-cultural p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{L(u.name)}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-asean-yellow/30 text-asean-blue whitespace-nowrap">
                      {u.year}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {u.type === 'world'
                      ? L({ zh: '世界文化遗产', en: 'World Heritage' })
                      : L({ zh: '人类非物质文化遗产', en: 'Intangible Cultural Heritage' })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{L(u.desc)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 节庆 / 饮食 / 礼仪 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-cultural p-6">
            <h2 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              {L({ zh: '节庆', en: 'Festivals' })}
            </h2>
            <ul className="space-y-4 text-sm">
              {profile.festivals.map((f) => (
                <li key={f.name.zh}>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{L(f.name)}</div>
                  <div className="text-xs text-zhuang-blue mb-1">{L(f.time)}</div>
                  <p className="text-gray-600 dark:text-gray-400">{L(f.desc)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-cultural p-6">
            <h2 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              {L({ zh: '饮食', en: 'Food' })}
            </h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {profile.cuisine.map((c) => (
                <li key={c.zh} className="flex gap-2">
                  <span className="text-zhuang-red" aria-hidden>▸</span>
                  <span>{L(c)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-cultural p-6">
            <h2 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              {L({ zh: '礼仪与禁忌', en: 'Etiquette' })}
            </h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {profile.etiquette.map((c) => (
                <li key={c.zh} className="flex gap-2">
                  <span className="text-zhuang-blue" aria-hidden>▸</span>
                  <span>{L(c)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 上下篇 */}
        <nav aria-label={L({ zh: '相邻国家', en: 'Neighbouring entries' })} className="grid grid-cols-2 gap-4">
          <Link
            href={`/${locale}/asean/${prev}`}
            className="card-cultural p-5 flex items-center gap-3"
          >
            <Flag country={prev} width={36} />
            <span>
              <span className="block text-xs text-gray-500">← {L({ zh: '上一个', en: 'Previous' })}</span>
              <span className="font-medium">{locale === 'zh' ? ASEAN_NAMES[prev].zh : ASEAN_NAMES[prev].en}</span>
            </span>
          </Link>
          <Link
            href={`/${locale}/asean/${next}`}
            className="card-cultural p-5 flex items-center gap-3 justify-end text-right"
          >
            <span>
              <span className="block text-xs text-gray-500">{L({ zh: '下一个', en: 'Next' })} →</span>
              <span className="font-medium">{locale === 'zh' ? ASEAN_NAMES[next].zh : ASEAN_NAMES[next].en}</span>
            </span>
            <Flag country={next} width={36} />
          </Link>
        </nav>
      </div>
    </main>
  );
}
