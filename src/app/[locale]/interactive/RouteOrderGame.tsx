'use client';

/**
 * 丝路航线排序
 * Maritime route ordering
 *
 * 用上下箭头调整港口顺序，按「广州 → 琼州 → 占城 → 满剌加 → 古里」的地理与年代先后排列。
 */

import { useState } from 'react';
import { useT, useLocale } from '@/i18n/client';
import { useProgress } from '@/lib/hooks/useProgress';
import type { LocalizedText } from '@/lib/data/aseanCountries';
import { Toast } from '@/components/ui/Dialog';

const STOPS: { id: string; name: LocalizedText; note: LocalizedText }[] = [
  { id: 'guangzhou', name: { zh: '广州', en: 'Guangzhou' }, note: { zh: '南海航线起点', en: 'Home port of the South Sea route' } },
  { id: 'qiongzhou', name: { zh: '琼州海峡', en: 'Qiongzhou Strait' }, note: { zh: '驶出北部湾的门户', en: 'Gateway out of the Gulf of Tonkin' } },
  { id: 'champa', name: { zh: '占城', en: 'Champa' }, note: { zh: '今越南中南部', en: 'Central-southern Vietnam today' } },
  { id: 'malacca', name: { zh: '满剌加', en: 'Malacca' }, note: { zh: '扼守马六甲海峡', en: 'Holding the Strait of Malacca' } },
  { id: 'calicut', name: { zh: '古里', en: 'Calicut' }, note: { zh: '印度西海岸终点', en: 'Terminus on India’s west coast' } },
];

const SHUFFLED = ['malacca', 'guangzhou', 'calicut', 'champa', 'qiongzhou'];

export default function RouteOrderGame({ onComplete }: { onComplete?: (score: number) => void }) {
  const { t } = useT('interactive');
  const locale = useLocale();
  const { record } = useProgress();
  const L = (v: LocalizedText) => v[locale as keyof LocalizedText] ?? v.en;

  const [order, setOrder] = useState<string[]>(SHUFFLED);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setChecked(null);
  };

  const check = () => {
    const ok = order.every((id, i) => id === STOPS[i].id);
    setChecked(ok);
    if (ok) {
      record('route-complete');
      setToast(t('route.complete'));
      onComplete?.(0);
    }
  };

  return (
    <div className="card-cultural p-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('route.instruction')}</p>

      <ol className="space-y-2">
        {order.map((id, i) => {
          const stop = STOPS.find((s) => s.id === id)!;
          const state = checked === null ? '' : id === STOPS[i].id ? 'border-green-500' : 'border-red-400';
          return (
            <li key={id} className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2 ${state || 'border-gray-200 dark:border-gray-700'}`}>
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 grid place-items-center text-xs font-bold">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{L(stop.name)}</div>
                <div className="text-xs text-gray-500 truncate">{L(stop.note)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  aria-label={`${t('route.up')} ${L(stop.name)}`}
                  className="w-7 h-6 rounded border border-gray-200 dark:border-gray-600 text-xs disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1}
                  aria-label={`${t('route.down')} ${L(stop.name)}`}
                  className="w-7 h-6 rounded border border-gray-200 dark:border-gray-600 text-xs disabled:opacity-30">↓</button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex gap-2 mt-5">
        <button type="button" onClick={check} className="btn-embroidery px-5 py-2 text-sm">
          {t('route.check')}
        </button>
        <button type="button" onClick={() => { setOrder(SHUFFLED); setChecked(null); }}
          className="px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700">
          {t('route.reset')}
        </button>
      </div>

      {checked === false && (
        <p className="mt-3 text-sm text-red-600">
          {order.map((id, i) => (id === STOPS[i].id ? t('route.correct', { n: i + 1 }) : t('route.wrong', { n: i + 1 }))).join(' · ')}
        </p>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
