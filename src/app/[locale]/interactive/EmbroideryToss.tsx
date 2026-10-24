'use client';

/**
 * 抛绣球：投掷逻辑
 * Embroidered-ball toss
 *
 * 30 秒内尽可能多次投掷；点击落点离圆心越近得分越高。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/client';
import { useProgress } from '@/lib/hooks/useProgress';

const ROUND_SECONDS = 30;
const RINGS = [
  { radius: 12, points: 10 },
  { radius: 22, points: 6 },
  { radius: 32, points: 3 },
  { radius: 42, points: 1 },
];

interface Shot {
  id: number;
  x: number;
  y: number;
  points: number;
}

export default function EmbroideryToss({ onComplete }: { onComplete?: (score: number) => void }) {
  const { t } = useT('interactive');
  const { record } = useProgress();

  // 面板一打开就进入「待投」状态：遮罩只负责说明，不再需要第二次点击
  const [running, setRunning] = useState(true);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [last, setLast] = useState<{ text: string; ok: boolean } | null>(null);
  const shotId = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    if (remaining <= 0) {
      setRunning(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, remaining]);

  const start = useCallback(() => {
    setRunning(true);
    setRemaining(ROUND_SECONDS);
    setScore(0);
    setShots([]);
    setLast(null);
  }, []);

  const throwAt = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!running) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const dist = Math.hypot(x - 50, y - 50);

    const ring = RINGS.find((r) => dist <= r.radius);
    const points = ring?.points ?? 0;

    shotId.current += 1;
    setShots((prev) => [...prev.slice(-8), { id: shotId.current, x, y, points }]);
    setScore((s) => s + points);
    setLast(
      points > 0
        ? { text: t('embroidery.hit', { points }), ok: true }
        : { text: t('embroidery.miss'), ok: false }
    );
  };

  // 结算：只记录一次
  useEffect(() => {
    if (running || remaining !== 0 || shots.length === 0) return;
    record('embroidery-50', score);
    onComplete?.(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const rounds = Math.max(0, Math.ceil(shots.length / 3));

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label={t('play.score')} value={String(score)} tone="text-pink-600" />
        <Stat label={t('play.time')} value={`00:${String(remaining).padStart(2, '0')}`} tone="text-indigo-600" />
        <Stat label={t('play.played', { count: shots.length })} value={String(shots.length)} tone="text-purple-600" />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={throwAt}
          disabled={!running}
          aria-label={t('embroidery.aimLabel')}
          className="relative block w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden disabled:cursor-not-allowed"
        >
          {/* 竹圈 */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-700/70 w-[84%] h-[84%]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-700/50 w-[64%] h-[64%]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-700/40 w-[44%] h-[44%]" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-pink-500/70 w-[24%] h-[24%]" />

          {/* 落点 */}
          {shots.map((s) => (
            <span
              key={s.id}
              className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                s.points > 0 ? 'bg-pink-600' : 'bg-gray-500/70'
              }`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            />
          ))}

          {!running && (
            <button
              type="button"
              onClick={start}
              className="absolute inset-0 grid place-items-center bg-black/45 hover:bg-black/35 transition-colors"
            >
              <span className="text-center text-white px-4">
                <span className="block text-xl font-bold mb-1">
                  {remaining === 0 ? t('embroidery.end', { score }) : t('embroidery.aim')}
                </span>
                <span className="inline-block btn-embroidery px-6 py-2 mt-3">
                  {remaining === 0 ? t('embroidery.tryAgain') : t('play.enter')}
                </span>
              </span>
            </button>
          )}
        </button>

        {running && (
          <button type="button" onClick={start} className="mt-3 text-sm text-gray-600 dark:text-gray-400 underline">
            {t('play.restart')}
          </button>
        )}
      </div>

      <p
        className={`mt-3 text-sm min-h-[1.25rem] ${last?.ok ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}
        aria-live="polite"
      >
        {last?.text}
      </p>

      {rounds > 0 && (
        <p className="text-xs text-gray-500">
          {t('play.personalBest', { score: Math.max(score, 0) })}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
