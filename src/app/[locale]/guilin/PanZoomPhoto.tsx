'use client';

/**
 * 实景照片查看器（可拖动 / 可缩放）
 * Pan & zoom photo viewer
 *
 * 之前这两块写的是「360° 全景」「WebGL 漫游」，但实际只是一张静态照片，
 * 点了也没有任何反应。没有全景素材就不宣称全景：这里如实做成
 * 「实景照片 · 可拖动缩放」，交互是真的，文案也与能力一致。
 */

import { useRef, useState } from 'react';

const MIN = 1;
const MAX = 4;

export default function PanZoomPhoto({
  src,
  alt,
  title,
  hint,
  className = '',
  aspect = 'aspect-video',
}: {
  src: string;
  alt: string;
  title: string;
  hint: string;
  className?: string;
  aspect?: string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const clampScale = (n: number) => Math.min(MAX, Math.max(MIN, Number(n.toFixed(2))));

  const zoom = (delta: number) => {
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === MIN) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const reset = () => {
    setScale(MIN);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <figure className={`relative overflow-hidden rounded-lg bg-gray-900 ${aspect} ${className}`}>
      <div
        className="absolute inset-0 touch-none"
        style={{ cursor: scale > MIN ? 'grab' : 'default' }}
        onPointerDown={(e) => {
          if (scale === MIN) return;
          drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
        }}
        onPointerUp={(e) => {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-150"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

      <figcaption className="absolute bottom-0 inset-x-0 p-5 md:p-6 text-white pointer-events-none">
        <p className="text-xl md:text-2xl font-bold mb-1">{title}</p>
        <p className="text-sm opacity-85">{hint}</p>
      </figcaption>

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          type="button"
          onClick={() => zoom(-0.5)}
          disabled={scale <= MIN}
          aria-label="缩小"
          className="w-9 h-9 rounded-full bg-black/45 text-white text-lg hover:bg-black/65 disabled:opacity-35"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => zoom(0.5)}
          disabled={scale >= MAX}
          aria-label="放大"
          className="w-9 h-9 rounded-full bg-black/45 text-white text-lg hover:bg-black/65 disabled:opacity-35"
        >
          +
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="还原"
          className="w-9 h-9 rounded-full bg-black/45 text-white text-sm hover:bg-black/65"
        >
          ⟲
        </button>
      </div>
    </figure>
  );
}
