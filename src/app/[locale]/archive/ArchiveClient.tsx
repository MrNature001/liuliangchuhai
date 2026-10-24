'use client';

/**
 * 数字遗产展厅主体
 * Digital Heritage hall (client)
 *
 * 之前的版本：搜索结果用随机数编造、3D 查看器是张静态图、
 * 影像库与多媒体库只是占位卡片。现在改为真实的数据档案：
 * 关键词检索、类别/年代筛选、可旋转的三维示意模型、收藏到本机。
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Icon, { CultureImage, HeroImage, type IconName } from '@/components/ui/Icon';
import { Dialog, Toast } from '@/components/ui/Dialog';
import { useLocale, useT } from '@/i18n/client';
import { useLocalStorage, STORAGE_PREFIX } from '@/lib/hooks/useLocalStorage';
import { useProgress } from '@/lib/hooks/useProgress';
import type { ArtifactCategory, ArtifactEra } from '@/lib/data/artifacts';
import DrumModel, { type DrumModelHandle } from './DrumModel';

export interface ArchiveArtifact {
  id: string;
  category: ArtifactCategory;
  era: ArtifactEra;
  image: string;
  has3d?: boolean;
  playPath?: string;
  displayName: string;
  displayOrigin: string;
  displayPeriod: string;
  displayDesc: string;
  displayCaption: string;
  displayMaterial: string;
  displaySize?: string;
  categoryLabel: string;
  /** 便于检索的原始中文/英文名 */
  searchText: string;
}

const ERA_ORDER: ArtifactEra[] = ['prehistoric', 'han-tang', 'song-ming', 'qing-modern', 'contemporary'];

export default function ArchiveClient({
  artifacts,
  categories,
  eraLabels,
}: {
  artifacts: ArchiveArtifact[];
  categories: { key: ArtifactCategory; label: string }[];
  eraLabels: { key: ArtifactEra; label: string }[];
}) {
  const { t } = useT('archive');
  const locale = useLocale();
  const { record } = useProgress();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ArtifactCategory | 'all'>('all');
  const [era, setEra] = useState<ArtifactEra | 'all'>('all');
  const [sort, setSort] = useState<'name' | 'era' | 'category'>('era');
  const [detail, setDetail] = useState<ArchiveArtifact | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { value: favorites, setValue: setFavorites } = useLocalStorage<string[]>(
    `${STORAGE_PREFIX}favorites`,
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = artifacts.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (era !== 'all' && a.era !== era) return false;
      if (!q) return true;
      return (
        a.searchText.toLowerCase().includes(q) ||
        a.displayName.toLowerCase().includes(q) ||
        a.displayDesc.toLowerCase().includes(q) ||
        a.displayOrigin.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q)
      );
    });

    const sorted = [...list];
    if (sort === 'name') sorted.sort((a, b) => a.displayName.localeCompare(b.displayName, locale));
    else if (sort === 'category') sorted.sort((a, b) => a.category.localeCompare(b.category));
    else sorted.sort((a, b) => ERA_ORDER.indexOf(a.era) - ERA_ORDER.indexOf(b.era));
    return sorted;
  }, [artifacts, category, era, query, sort, locale]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      if (!has) record('artifact-favorite');
      return next;
    });
  };

  const model = artifacts.find((a) => a.has3d);

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[52vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage name="archive" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75" />

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">{t('hero.title')}</h1>
          <p className="text-xl md:text-2xl mb-2 opacity-90 animate-slide-up animation-delay-200">
            {t('hero.titleEn')}
          </p>
          <p className="text-base md:text-lg max-w-3xl mx-auto animate-slide-up animation-delay-300">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* 统计条 */}
      <div className="bg-amber-50 dark:bg-gray-800 border-b border-amber-100 dark:border-gray-700">
        <div className="container-custom py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{artifacts.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('archive.statsTotal')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{categories.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('archive.statsCategories')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {artifacts.filter((a) => a.has3d).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{t('archive.stats3d')}</div>
          </div>
        </div>
      </div>

      {/* 文物档案：检索 + 筛选 */}
      <section id="artifacts" className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto mb-10">
            <label htmlFor="archive-search" className="sr-only">
              {t('artifacts.searchPlaceholder')}
            </label>
            <div className="flex gap-3">
              <input
                id="archive-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('artifacts.searchPlaceholder')}
                className="flex-1 px-5 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-amber-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                  setEra('all');
                }}
                className="px-5 rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-medium hover:border-amber-600 transition-colors"
              >
                {t('archive.clear')}
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t('archive.filters.label')}
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  aria-pressed={category === 'all'}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    category === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white'
                  }`}
                >
                  {t('archive.filters.all')}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    aria-pressed={category === c.key}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      category === c.key
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                {t('archive.eras.label')}
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEra('all')}
                  aria-pressed={era === 'all'}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    era === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white'
                  }`}
                >
                  {t('archive.filters.all')}
                </button>
                {eraLabels.map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    onClick={() => setEra(e.key)}
                    aria-pressed={era === e.key}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      era === e.key
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
              <label htmlFor="archive-sort" className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {t('archive.sort.label')}
              </label>
              <select
                id="archive-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="px-3 py-1.5 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shrink-0"
              >
                <option value="era">{t('archive.sort.era')}</option>
                <option value="name">{t('archive.sort.name')}</option>
                <option value="category">{t('archive.sort.category')}</option>
              </select>
              <span aria-live="polite" className="text-gray-500 dark:text-gray-400">
                {t('archive.count', { count: filtered.length })}
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-16">{t('archive.empty')}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((a) => (
                <li key={a.id} className="artifact-card !p-0 overflow-hidden flex flex-col">
                  <button
                    type="button"
                    onClick={() => setDetail(a)}
                    className="text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
                    aria-label={`${a.displayName} — ${t('archive.detail')}`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <CultureImage
                        name={a.image as never}
                        label={a.displayCaption}
                        className="artifact-image absolute inset-0 w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                        {a.categoryLabel}
                      </span>
                      {a.has3d && (
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          3D
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-1 text-gray-900 dark:text-white">{a.displayName}</h3>
                      <p className="text-xs text-gray-500 mb-2">{a.displayPeriod}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{a.displayDesc}</p>
                    </div>
                  </button>
                  <div className="mt-auto px-4 pb-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(a.id)}
                      aria-pressed={favorites.includes(a.id)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        favorites.includes(a.id)
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {favorites.includes(a.id) ? t('archive.favorited') : t('archive.favorite')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetail(a)}
                      className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline"
                    >
                      {t('archive.detail')} →
                    </button>
                    {a.playPath && (
                      <Link
                        href={`/${locale}${a.playPath}`}
                        className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-800 hover:bg-pink-200 font-medium"
                      >
                        {t('archive.playGame')}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 text-center">{t('archive.sourceNote')}</p>
        </div>
      </section>

      {/* 三维模型 */}
      <section id="3d-models" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="camera"
            title={t('models.title')}
            subtitle={t('models.subtitle')}
            description={t('archive.modelNote')}
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 relative">
              <div className="h-[420px]">
                <DrumModelMount label={t('models.drumLabel')} hint={t('models.drumHint')} onToast={setToast} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              {model && (
                <>
                  <div className="card-cultural p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{model.displayName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{model.displayCaption}</p>
                    <dl className="space-y-2 text-sm">
                      <Fact label={t('archive.period')} value={model.displayPeriod} />
                      <Fact label={t('archive.material')} value={model.displayMaterial} />
                      <Fact label={t('archive.origin')} value={model.displayOrigin} />
                      {model.displaySize && <Fact label={t('archive.size')} value={model.displaySize} />}
                    </dl>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetail(model)}
                    className="btn-embroidery w-full py-3"
                  >
                    {t('archive.detail')} →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 详情对话框 */}
      <Dialog
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.displayName ?? ''}
        footer={
          detail ? (
            <>
              <button type="button" onClick={() => toggleFavorite(detail.id)} className="btn-embroidery px-5 py-2">
                {favorites.includes(detail.id) ? t('archive.favorited') : t('archive.favorite')}
              </button>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600"
              >
                {t('archive.close')}
              </button>
            </>
          ) : null
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <CultureImage
                name={detail.image as never}
                label={detail.displayCaption}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{detail.displayCaption}</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{detail.displayDesc}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Fact label={t('archive.period')} value={detail.displayPeriod} />
              <Fact label={t('archive.material')} value={detail.displayMaterial} />
              <Fact label={t('archive.origin')} value={detail.displayOrigin} />
              <Fact label={t('archive.filters.label')} value={detail.categoryLabel} />
              {detail.displaySize && <Fact label={t('archive.size')} value={detail.displaySize} />}
            </dl>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('archive.favoriteHint')}</p>
          </div>
        )}
      </Dialog>

      {/* 返回 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium">
            ← {t('back')}
          </Link>
        </div>
      </section>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="font-medium text-right text-gray-800 dark:text-gray-200">{value}</dd>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, description }: {
  icon: IconName;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex justify-center mb-4 text-amber-600">
        <Icon name={icon} size={56} label={title} />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

/**
 * 模型挂载器：负责把模型句柄接到控制条上，并在 WebGL 不可用时降级为静态图。
 */
function DrumModelMount({ label, hint, onToast }: { label: string; hint: string; onToast: (m: string) => void }) {
  const { t } = useT('archive');
  const handleRef = useRef<DrumModelHandle | null>(null);
  const [spinning, setSpinning] = useState(true);

  const onReady = useCallback((h: DrumModelHandle) => {
    handleRef.current = h;
  }, []);

  const snapshot = () => {
    const data = handleRef.current?.snapshot();
    if (!data) return;
    const a = document.createElement('a');
    a.href = data;
    a.download = 'bronze-drum.png';
    a.click();
    onToast(t('archive.modelSnapshotDone'));
  };

  return (
    <div className="relative h-full">
      <DrumModel label={label} hint={hint} onReady={onReady} />

      {/* 键盘可达的控制条 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2">
        <CtrlButton onClick={() => handleRef.current?.rotateBy(-Math.PI / 4)} label={t('archive.modelRotateLeft')}>
          ← 左转
        </CtrlButton>
        <CtrlButton onClick={() => handleRef.current?.rotateBy(Math.PI / 4)} label={t('archive.modelRotateRight')}>
          右转 →
        </CtrlButton>
        <CtrlButton onClick={() => handleRef.current?.zoomBy(-0.6)} label={t('archive.modelZoomIn')}>
          +
        </CtrlButton>
        <CtrlButton onClick={() => handleRef.current?.zoomBy(0.6)} label={t('archive.modelZoomOut')}>
          −
        </CtrlButton>
        <CtrlButton
          onClick={() => {
            handleRef.current?.toggleSpin();
            setSpinning((s) => !s);
          }}
          label={spinning ? t('archive.modelSpin') : t('archive.modelResume')}
        >
          {spinning ? '❙❙' : '▶'}
        </CtrlButton>
        <CtrlButton onClick={() => handleRef.current?.reset()} label={t('archive.modelReset')}>
          ⟲
        </CtrlButton>
        <CtrlButton onClick={snapshot} label={t('archive.modelSnapshot')}>
          ⤓
        </CtrlButton>
      </div>
    </div>
  );
}

function CtrlButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="min-w-[3.25rem] h-10 px-3 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}
