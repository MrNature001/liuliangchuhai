'use client';

/**
 * 花山岩画细节查看器
 * Rock-art detail viewer
 *
 * 原先这里是一块写着「岩画 3D 互动展示 / 点击查看详细内容」的深色方块，
 * 点了没有任何反应，也没有 3D 内容 —— 属于假功能。
 * 现在改为真实可用的细节查看：点开后可放大、缩小、拖动画面，
 * 并给出岩画的尺寸与拍摄说明。没有 3D 就不宣称 3D。
 */

import { useRef, useState } from 'react';
import { useT } from '@/i18n/client';
import { Dialog } from '@/components/ui/Dialog';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function RockArtViewer() {
  const { t } = useT('guangxi');
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoom = (delta: number) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((s + delta).toFixed(2))));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="aspect-video w-full rounded-lg overflow-hidden relative group text-left"
        aria-label={t('huashan.openViewer')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/culture/huashan-rock-art.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute bottom-0 inset-x-0 p-5 text-white block">
          <span className="block text-xl font-bold mb-1">{t('huashan.viewerTitle')}</span>
          <span className="block text-sm opacity-85">{t('huashan.viewerHint')}</span>
        </span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('huashan.viewerTitle')}
        footer={
          <>
            <button
              type="button"
              onClick={() => zoom(-0.5)}
              disabled={scale <= MIN_SCALE}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
            >
              − {t('huashan.zoomOut')}
            </button>
            <button
              type="button"
              onClick={() => zoom(0.5)}
              disabled={scale >= MAX_SCALE}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
            >
              + {t('huashan.zoomIn')}
            </button>
            <button type="button" onClick={reset} className="btn-embroidery px-4 py-2 text-sm">
              {t('huashan.resetView')}
            </button>
          </>
        }
      >
        <div
          className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-900 select-none"
          style={{ cursor: scale > 1 ? 'grab' : 'default' }}
          onPointerDown={(e) => {
            if (scale === 1) return;
            dragging.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            setOffset({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
          }}
          onPointerUp={(e) => {
            dragging.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/culture/huashan-rock-art.jpg"
            alt={t('huashan.viewerTitle')}
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-150"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {t('huashan.viewerNote', { scale: scale.toFixed(1) })}
        </p>
      </Dialog>
    </>
  );
}
