'use client';

/**
 * 互动体验展厅主体
 * Interactive hall (client)
 */

import { useState } from 'react';
import Link from 'next/link';
import Icon, { CultureImage, HeroImage, type CultureImageName, type IconName } from '@/components/ui/Icon';
import { useT, useLocale } from '@/i18n/client';
import { useProgress, BADGES } from '@/lib/hooks/useProgress';
import EmbroideryToss from './EmbroideryToss';
import CulturalQuiz from './CulturalQuiz';
import MotifMatchGame from './MotifMatchGame';
import RouteOrderGame from './RouteOrderGame';
import CommunityWall from './CommunityWall';

type GameKey = 'embroidery' | 'quiz' | 'match' | 'route';

const GAMES: {
  key: GameKey;
  titleKey: string;
  descKey: string;
  image: CultureImageName;
  icon: IconName;
  tone: string;
}[] = [
  { key: 'embroidery', titleKey: 'game.embroidery.title', descKey: 'game.embroidery.desc', image: 'embroidery-ball', icon: 'gamepad', tone: 'from-pink-500 to-rose-600' },
  { key: 'quiz', titleKey: 'game.quiz.title', descKey: 'game.quiz.desc', image: 'huashan-rock-art', icon: 'medal', tone: 'from-purple-500 to-indigo-600' },
  { key: 'match', titleKey: 'game.match.title', descKey: 'game.match.desc', image: 'zhuangjin-diamond', icon: 'search', tone: 'from-amber-500 to-orange-600' },
  { key: 'route', titleKey: 'game.route.title', descKey: 'game.route.desc', image: 'silk-road-sea', icon: 'handshake', tone: 'from-blue-500 to-cyan-600' },
];

const HALL_KEYS = ['guangxi', 'guilin', 'asean', 'exchange', 'archive'] as const;

export default function InteractiveClient() {
  const { t } = useT('interactive');
  const locale = useLocale();
  const { state, hydrated, unlocked, count, percentFor } = useProgress();

  const [openGame, setOpenGame] = useState<GameKey | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  const hallLabel = (key: string) => t(`hall.${key}`, { defaultValue: key } as never) || key;

  const sections = [
    { id: 'games', key: 'nav.games', icon: 'gamepad' as IconName },
    { id: 'achievements', key: 'nav.achievements', icon: 'medal' as IconName },
    { id: 'community', key: 'nav.community', icon: 'share' as IconName },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="interactive" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">{t('hero.title')}</h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">{t('hero.titleEn')}</p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">{t('hero.subtitle')}</p>
        </div>
      </section>

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
                {t(section.key)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="games" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="gamepad"
            title={t('games.title')}
            subtitle={t('games.subtitle')}
            description={t('games.desc')}
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {GAMES.map((game) => {
              const isOpen = openGame === game.key;
              return (
                <div key={game.key} className="card-cultural overflow-hidden flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <CultureImage name={game.image} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${game.tone} opacity-45`} />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                      <Icon name={game.icon} size={22} />
                      <span className="text-sm font-semibold drop-shadow">{t(game.titleKey)}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">{t(game.titleKey)}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">{t(game.descKey)}</p>

                    {best[game.key] !== undefined && (
                      <p className="text-xs text-purple-600 font-medium mb-3">
                        {t('play.personalBest', { score: best[game.key] })}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setOpenGame(isOpen ? null : game.key)}
                      aria-expanded={isOpen}
                      aria-controls={`game-${game.key}`}
                      className="btn-embroidery w-full py-3"
                    >
                      {isOpen ? t('play.close') : t('play.start')}
                    </button>
                  </div>

                  {isOpen && (
                    <div id={`game-${game.key}`} className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/40">
                      {game.key === 'embroidery' && (
                        <EmbroideryToss onComplete={(s) => setBest((b) => ({ ...b, embroidery: Math.max(b.embroidery ?? 0, s) }))} />
                      )}
                      {game.key === 'quiz' && (
                        <CulturalQuiz onComplete={(s) => setBest((b) => ({ ...b, quiz: Math.max(b.quiz ?? 0, s) }))} />
                      )}
                      {game.key === 'match' && (
                        <MotifMatchGame onComplete={(s) => setBest((b) => ({ ...b, match: Math.max(b.match ?? 0, s) }))} />
                      )}
                      {game.key === 'route' && (
                        <RouteOrderGame onComplete={(s) => setBest((b) => ({ ...b, route: Math.max(b.route ?? 0, s) }))} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="achievements" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="medal"
            title={t('achievements.title')}
            subtitle={t('achievements.subtitle')}
            description={t('achievements.desc')}
          />

          {hydrated && (
            <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 mb-10 text-center">
              <Tile label={t('community.statsHallsLocal')} value={String(state.halls.length)} />
              <Tile label={t('community.statsBadgesLocal')} value={`${unlocked.length}/${BADGES.length}`} />
              <Tile label={t('play.played', { count: count('quiz-5') })} value={String(state.events['quiz-5'] ?? 0)} />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {BADGES.map((badge) => {
              const isUnlocked = unlocked.includes(badge.id);
              const percent = percentFor(badge);
              return (
                <div
                  key={badge.id}
                  className={`card-cultural p-5 text-center ${isUnlocked ? '' : 'opacity-70'}`}
                >
                  <div className={`flex justify-center mb-3 ${isUnlocked ? 'text-purple-600' : 'text-gray-400'}`}>
                    <Icon name={isUnlocked ? 'medal' : 'archive'} size={44} />
                  </div>
                  <div className="font-bold text-sm mb-1">{t(badge.titleKey)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t(badge.descKey)}</div>
                  {isUnlocked ? (
                    <span className="text-xs text-green-600 font-medium">{t('achievements.unlocked')}</span>
                  ) : (
                    <div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{percent}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="community" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="share"
            title={t('community.title')}
            subtitle={t('community.subtitle')}
            description={t('community.desc')}
          />

          <div className="mt-12">
            <CommunityWall />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 font-medium">
            ← {t('back')}
          </Link>
        </div>
      </section>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg py-4 shadow-sm">
      <div className="text-2xl font-bold text-purple-600">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex justify-center mb-4 text-purple-600">
        <Icon name={icon} size={60} label={title} />
      </div>
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-purple-600 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
