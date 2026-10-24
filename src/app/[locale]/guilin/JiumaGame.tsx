'use client';

/**
 * 九马画山 · 观察游戏
 * Nine Horses hill — spotting game
 *
 * 玩法：峰林崖壁间藏着「九匹马」，点击画面任意位置标记你看到的位置，
 * 每找到一处就点亮一格。找满九格即完成——寓意「看出九马者功成名就」。
 * 位置不随机：九匹马的判定点是固定的若干区域，点得越接近越容易命中，
 * 因此这是一个真的观察游戏，而不是点九下的过场动画。
 */

import { useRef, useState } from 'react';
import { useT } from '@/i18n/client';
import { Toast } from '@/components/ui/Dialog';

/** 九个「马」的判定位置（百分比坐标 + 容差） */
const HORSES = [
  { x: 18, y: 30 }, { x: 34, y: 22 }, { x: 52, y: 26 },
  { x: 68, y: 34 }, { x: 24, y: 55 }, { x: 43, y: 62 },
  { x: 60, y: 58 }, { x: 76, y: 66 }, { x: 86, y: 44 },
];
const TOLERANCE = 16;

export default function JiumaGame() {
  const { t } = useT('guilin');
  const areaRef = useRef<HTMLButtonElement>(null);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const done = found.length === HORSES.length;

  const click = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (done) return;
    const el = areaRef.current ?? e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;

    let hit = -1;
    let best = Infinity;
    HORSES.forEach((h, i) => {
      if (found.includes(i)) return;
      const d = Math.hypot(h.x - x, h.y - y);
      if (d < best) { best = d; hit = i; }
    });

    if (hit >= 0 && best <= TOLERANCE) {
      setFound((prev) => [...prev, hit]);
      setToast(t('jiuma.hit', { n: found.length + 1 }));
    } else {
      setMisses((m) => m + 1);
      setToast(t('jiuma.miss'));
    }
  };

  const reset = () => {
    setFound([]);
    setMisses(0);
    setToast(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm">
        <p className="font-medium text-ink-cyan">
          {t('jiuma.progress', { found: found.length, total: HORSES.length })}
        </p>
        <button type="button" onClick={reset} className="px-4 py-1.5 rounded-full border border-ink-cyan/40 text-xs">
          {t('jiuma.restart')}
        </button>
      </div>

      <button
        type="button"
        ref={areaRef}
        onClick={click}
        aria-label={t('jiuma.areaLabel')}
        className="relative block w-full aspect-[16/9] rounded-lg overflow-hidden bg-ink-gray-dark cursor-crosshair group"
      >
        {/* 崖壁实拍：与展厅同源的桂林峰林照片，用滤镜压成岩壁质感 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/culture/guilin-jiuma.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover contrast-110 saturate-90" />
        <span className="absolute inset-0 bg-ink-black/25" />

        {HORSES.map((h, i) =>
          found.includes(i) ? (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-400 text-ink-black text-xs font-bold grid place-items-center shadow"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {i + 1}
            </span>
          ) : null
        )}

        {done && (
          <span className="absolute inset-0 grid place-items-center bg-black/55 text-white text-center px-6">
            <span>
              <span className="block text-2xl font-bold mb-2">{t('jiuma.done')}</span>
              <span className="block text-sm opacity-85">{t('jiuma.doneHint', { misses })}</span>
            </span>
          </span>
        )}
      </button>

      <p className="mt-3 text-sm text-ink-cyan/80 min-h-[1.25rem]" aria-live="polite">
        {toast ?? t('jiuma.hint')}
      </p>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
