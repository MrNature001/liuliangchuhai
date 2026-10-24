'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon, { CultureImage, Flag, HeroImage, AseanPhoto, type IconName, type CultureImageName } from '@/components/ui/Icon';
import { useT, useLocale } from '@/i18n/client';

export default function ExchangeClient() {
  const { t } = useT('exchange');
  const locale = useLocale();
  const [story, setStory] = useState('');
  const [savedStories, setSavedStories] = useState<{ id: string; text: string }[]>([]);
  const [hint, setHint] = useState<string | null>(null);

  const saveStory = () => {
    const text = story.trim();
    if (!text) return;
    setSavedStories((prev) => [{ id: `${Date.now()}`, text }, ...prev].slice(0, 10));
    setStory('');
    setHint(t('stories.saved'));
  };

  const copyStory = async () => {
    const text = story.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setHint(t('stories.copied'));
    } catch {
      setHint(t('stories.copied'));
    }
  };

  const removeStory = (id: string) => setSavedStories((prev) => prev.filter((s) => s.id !== id));

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="exchange" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70"></div>

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

      {/* 展区导航 */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Icon name={section.icon} size={18} />
                {t(section.titleKey)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 古代海上丝绸之路 */}
      <section id="silk-road" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="handshake"
            title={t('silkRoad.title')}
            subtitle={t('silkRoad.subtitle')}
            description={t('silkRoad.desc')}
          />

          <div className="mt-12">
            {/* 交互式时间轴 */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="space-y-16">
                {timelineEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="card-cultural p-6 inline-block max-w-md">
                        <div className="text-sm text-purple-600 font-bold mb-2">{t(event.periodKey)}</div>
                        <h3 className="text-xl font-bold mb-3">{t(event.titleKey)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t(event.descKey)}</p>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg border-2 border-purple-500">
                        <CultureImage name={event.image} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 壮族与泰族同源文化 */}
      <section id="zhuang-tai" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="handshake"
            title={t('zhuangTai.title')}
            subtitle={t('zhuangTai.subtitle')}
            description={t('zhuangTai.desc')}
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-600">{t('zhuangTai.langTitle')}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t('zhuangTai.langBody')}
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">{t('zhuangTai.langTreeTitle')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('zhuangTai.langTree')}
                  </div>
                </div>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-600">{t('zhuangTai.simTitle')}</h3>
                <ul className="space-y-3">
                  {culturalSimilarities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-purple-600"><Icon name={item.icon} size={24} /></span>
                      <div>
                        <strong className="text-gray-900 dark:text-white">{t(item.aspectKey)}</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t(item.descKey)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden relative group bg-gray-100 dark:bg-gray-800">
                <CultureImage name="stilt-house" label={t('zhuangTai.compareTitle')} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <p className="text-2xl font-bold mb-1">{t('zhuangTai.compareTitle')}</p>
                  <p className="text-sm opacity-85">{t('zhuangTai.compareDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-cultural p-4 text-center">
                  <div className="flex justify-center mb-2 text-purple-600"><Icon name="museum" size={32} /></div>
                  <div className="font-bold mb-1">{t('zhuangTai.zhuang')}</div>
                  <div className="text-xs text-gray-500">{t('zhuangTai.zhuangRegion')}</div>
                  <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                    {t('zhuangTai.zhuangPop')}
                  </div>
                </div>
                <div className="card-cultural p-4 text-center">
                  <div className="flex justify-center mb-2 text-purple-600"><Icon name="museum" size={32} /></div>
                  <div className="font-bold mb-1">{t('zhuangTai.tai')}</div>
                  <div className="text-xs text-gray-500">{t('zhuangTai.taiRegion')}</div>
                  <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                    {t('zhuangTai.taiPop')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 中国-东盟博览会 */}
      <section id="caexpo" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="museum"
            title={t('caexpo.title')}
            subtitle={t('caexpo.subtitle')}
            description={t('caexpo.desc')}
          />

          <div className="mt-12">
            <div className="card-cultural p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">{t('caexpo.edition')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('caexpo.history')}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-1">{t('caexpo.countriesValue')}</div>
                  <div className="text-sm text-gray-500">{t('caexpo.countriesLabel')}</div>
                </div>
              </div>

              {/* 数据可视化 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caexpoStats.map((stat, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{t(stat.valueKey)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{t(stat.labelKey)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VR全景展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exhibitionHighlights.map((highlight, idx) => (
                <Link
                  key={idx}
                  href={`/${locale}${highlight.path}`}
                  className="card-cultural overflow-hidden group flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-600"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <AseanPhoto name={highlight.image} label={t(highlight.titleKey)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-bold mb-2">{t(highlight.titleKey)}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{t(highlight.descKey)}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-300 group-hover:translate-x-1 transition-transform">
                      {t(highlight.ctaKey)} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 教育文化合作 */}
      <section id="education" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            icon="medal"
            title={t('education.title')}
            subtitle={t('education.subtitle')}
            description={t('education.desc')}
          />

          <div className="mt-12">
            {/* 网络图谱可视化 */}
            <div className="aspect-video bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-4xl">
                  {/* 中心节点 - 广西 */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-xl">
                      <div className="text-center">
                        <div className="text-2xl"><Flag country="china" width={34} /></div>
                        <div className="text-xs font-bold">{t('education.guangxi')}</div>
                      </div>
                    </div>
                  </div>

                  {/* 东盟国家节点 */}
                  {cooperationNodes.map((node, idx) => {
                    const angle = (idx * 360) / cooperationNodes.length;
                    const radius = 160;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
                          <Flag country={node.code} width={30} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-cultural p-6 text-center">
                <div className="flex justify-center mb-3 text-purple-600"><Icon name="archive" size={40} /></div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{t('education.card1Value')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('education.card1Label')}</div>
              </div>
              <div className="card-cultural p-6 text-center">
                <div className="flex justify-center mb-3 text-blue-600"><Icon name="medal" size={40} /></div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{t('education.card2Value')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('education.card2Label')}</div>
              </div>
              <div className="card-cultural p-6 text-center">
                <div className="flex justify-center mb-3 text-pink-600"><Icon name="globe" size={40} /></div>
                <div className="text-3xl font-bold text-pink-600 mb-2">{t('education.card3Value')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('education.card3Label')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 用户故事墙 */}
      <section id="stories" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="share"
            title={t('stories.title')}
            subtitle={t('stories.subtitle')}
            description={t('stories.desc')}
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.map((story, idx) => (
              <div key={idx} className="card-cultural p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl">
                    {story.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-xs text-gray-500">{t(story.roleKey)}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{t(story.storyKey)}"
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  {story.year} • {t(story.locationKey)}
                </div>
              </div>
            ))}
          </div>

          <div className="card-cultural p-6 mt-8 max-w-3xl mx-auto">
            <label htmlFor="story-input" className="block font-bold mb-2">
              {t('stories.formTitle')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('stories.formHint')}</p>
            <textarea
              id="story-input"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              maxLength={400}
              placeholder={t('stories.prompt')}
              className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-3 focus:border-purple-600 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <span className="text-xs text-gray-500">{story.length}/400</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyStory}
                  disabled={!story.trim()}
                  className="px-4 py-2 rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40"
                >
                  {t('stories.copy')}
                </button>
                <button
                  type="button"
                  onClick={saveStory}
                  disabled={!story.trim()}
                  className="btn-embroidery px-5 py-2 text-sm disabled:opacity-40"
                >
                  <Icon name="share" size={16} /> {t('stories.save')}
                </button>
              </div>
            </div>
            {savedStories.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold mb-2 text-sm">{t('stories.mine')}</h4>
                <ul className="space-y-2">
                  {savedStories.map((st) => (
                    <li key={st.id} className="text-sm bg-purple-50 dark:bg-purple-900/20 rounded p-3 flex justify-between gap-3">
                      <span className="whitespace-pre-wrap">{st.text}</span>
                      <button type="button" onClick={() => removeStory(st.id)} className="text-xs text-gray-400 hover:text-red-600 flex-shrink-0">
                        {t('stories.delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hint && (
              <p className="text-sm text-green-700 dark:text-green-400 mt-3" role="status" aria-live="polite">
                {hint}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-3">{t('stories.localOnly')}</p>
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors font-medium"
          >
            ← {t('back.home')}
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function SectionHeader({ icon, title, subtitle, description }: {
  icon: IconName;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex justify-center mb-4 text-purple-600"><Icon name={icon} size={60} label={title} /></div>
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-purple-600 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'silk-road', titleKey: 'nav.silkRoad', icon: 'handshake' as const },
  { id: 'zhuang-tai', titleKey: 'nav.zhuangTai', icon: 'handshake' as const },
  { id: 'caexpo', titleKey: 'nav.caexpo', icon: 'museum' as const },
  { id: 'education', titleKey: 'nav.education', icon: 'medal' as const },
  { id: 'stories', titleKey: 'nav.stories', icon: 'share' as const },
];

const timelineEvents = [
  {
    periodKey: 'timeline.ancientPeriod',
    image: 'huashan-rock-art' as CultureImageName,
    titleKey: 'timeline.ancientTitle',
    descKey: 'timeline.ancientDesc'
  },
  {
    periodKey: 'timeline.hanTangPeriod',
    image: 'stilt-house' as CultureImageName,
    titleKey: 'timeline.hanTangTitle',
    descKey: 'timeline.hanTangDesc'
  },
  {
    periodKey: 'timeline.mingQingPeriod',
    image: 'zhuangjin-fret' as CultureImageName,
    titleKey: 'timeline.mingQingTitle',
    descKey: 'timeline.mingQingDesc'
  },
  {
    periodKey: 'timeline.y2004Period',
    image: 'zhuangjin-wave' as CultureImageName,
    titleKey: 'timeline.y2004Title',
    descKey: 'timeline.y2004Desc'
  },
];

const culturalSimilarities = [
  { icon: 'museum' as IconName, aspectKey: 'zhuangTai.sim1', descKey: 'zhuangTai.sim1Desc' },
  { icon: 'archive' as IconName, aspectKey: 'zhuangTai.sim2', descKey: 'zhuangTai.sim2Desc' },
  { icon: 'music' as IconName, aspectKey: 'zhuangTai.sim3', descKey: 'zhuangTai.sim3Desc' },
  { icon: 'lantern' as IconName, aspectKey: 'zhuangTai.sim4', descKey: 'zhuangTai.sim4Desc' },
];

const caexpoStats = [
  { valueKey: 'caexpo.stat1Value', labelKey: 'caexpo.stat1Label' },
  { valueKey: 'caexpo.stat2Value', labelKey: 'caexpo.stat2Label' },
  { valueKey: 'caexpo.stat3Value', labelKey: 'caexpo.stat3Label' },
  { valueKey: 'caexpo.stat4Value', labelKey: 'caexpo.stat4Label' },
];

const exhibitionHighlights = [
  {
    icon: 'archive' as IconName,
    titleKey: 'caexpo.hl1Title',
    descKey: 'caexpo.hl1Desc',
    ctaKey: 'caexpo.hl1Cta',
    path: '/archive',
    image: 'indonesia-batik',
    color: 'from-pink-400 to-rose-500'
  },
  {
    icon: 'music' as IconName,
    titleKey: 'caexpo.hl2Title',
    descKey: 'caexpo.hl2Desc',
    ctaKey: 'caexpo.hl2Cta',
    path: '/interactive',
    image: 'cambodia-apsara',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    icon: 'lantern' as IconName,
    titleKey: 'caexpo.hl3Title',
    descKey: 'caexpo.hl3Desc',
    ctaKey: 'caexpo.hl3Cta',
    path: '/asean',
    image: 'singapore-hawker',
    color: 'from-orange-400 to-red-500'
  },
];

const cooperationNodes = [
  { code: 'thailand', nameKey: 'country.thailand' },
  { code: 'vietnam', nameKey: 'country.vietnam' },
  { code: 'indonesia', nameKey: 'country.indonesia' },
  { code: 'malaysia', nameKey: 'country.malaysia' },
  { code: 'singapore', nameKey: 'country.singapore' },
  { code: 'philippines', nameKey: 'country.philippines' },
  { code: 'cambodia', nameKey: 'country.cambodia' },
  { code: 'laos', nameKey: 'country.laos' },
];

const userStories = [
  {
    avatar: '阮',
    name: '阮文明',
    roleKey: 'stories.story1Role',
    storyKey: 'stories.story1Text',
    year: '2021',
    locationKey: 'stories.story1Location'
  },
  {
    avatar: '李',
    name: '李梅',
    roleKey: 'stories.story2Role',
    storyKey: 'stories.story2Text',
    year: '2019',
    locationKey: 'stories.story2Location'
  },
  {
    avatar: 'S',
    name: 'Suthi',
    roleKey: 'stories.story3Role',
    storyKey: 'stories.story3Text',
    year: '2020',
    locationKey: 'stories.story3Location'
  },
];
