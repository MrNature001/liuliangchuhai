/**
 * 文化图标组件
 * Cultural Icon Component
 *
 * 用真实图片资源替代 emoji。
 * 图标来源：public/images/icons/ui/*.svg（由 scripts/generate-images.js 生成）
 *
 * 用法：
 *   <Icon name="museum" size={32} />
 *   <Icon name="drum" size="1.5rem" className="text-zhuang-gold" />
 */

import type { CSSProperties } from 'react';

export type IconName =
  | 'museum' | 'mountain' | 'globe' | 'handshake' | 'archive' | 'gamepad'
  | 'play' | 'search' | 'share' | 'medal' | 'camera' | 'music' | 'lantern' | 'drum';

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  /** 无障碍标签，不传则视为装饰性图标（aria-hidden） */
  label?: string;
}

const SIZE_MAP: Record<IconName, string> = {
  museum: 'images/icons/ui/museum.svg',
  mountain: 'images/icons/ui/mountain.svg',
  globe: 'images/icons/ui/globe.svg',
  handshake: 'images/icons/ui/handshake.svg',
  archive: 'images/icons/ui/archive.svg',
  gamepad: 'images/icons/ui/gamepad.svg',
  play: 'images/icons/ui/play.svg',
  search: 'images/icons/ui/search.svg',
  share: 'images/icons/ui/share.svg',
  medal: 'images/icons/ui/medal.svg',
  camera: 'images/icons/ui/camera.svg',
  music: 'images/icons/ui/music.svg',
  lantern: 'images/icons/ui/lantern.svg',
  drum: 'images/icons/ui/drum.svg',
};

export default function Icon({ name, size = 24, className = '', style, label }: IconProps) {
  const px = typeof size === 'number' ? `${size}px` : size;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/${SIZE_MAP[name]}`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, display: 'inline-block', verticalAlign: 'middle', ...style }}
      draggable={false}
    />
  );
}

/**
 * 文化元素图案组件
 * 展示壮锦 / 铜鼓 / 岩画等实际文化图样
 */
export type CultureImageName =
  | 'zhuangjin-diamond' | 'zhuangjin-wave' | 'zhuangjin-fret'
  | 'bronze-drum' | 'huashan-rock-art' | 'stilt-house'
  | 'embroidery-ball' | 'guilin-landscape'
  | 'ink-painting' | 'rice-terraces' | 'festival'
  | 'asean-culture' | 'silk-road-sea' | 'guangxi-city' | 'archives'
  | 'five-color-rice';

export function CultureImage({
  name,
  className = '',
  style,
  label,
}: {
  name: CultureImageName;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/culture/${name}.jpg`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={className}
      // flex 容器里 img 作为 flex item 会被压缩，显式禁止收缩
      style={{ display: 'block', flexShrink: 0, ...style }}
      draggable={false}
    />
  );
}

/** 东盟国家图标 */
export function AseanIcon({ country, size = 64, className = '' }: { country: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/icons/asean/${country}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: 'inline-block' }}
      draggable={false}
    />
  );
}

/**
 * 国旗组件
 * 用本地 SVG 替代 emoji 国旗（Windows 下 emoji 国旗无法正常渲染）
 */
export function Flag({
  country,
  width = 28,
  className = '',
  style,
}: {
  country: string;
  width?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/icons/flags/${country}.svg`}
      alt=""
      aria-hidden
      className={className}
      style={{
        width,
        height: Math.round((width * 2) / 3),
        objectFit: 'cover',
        borderRadius: 2,
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      draggable={false}
    />
  );
}

/**
 * 东盟题材实景照片
 * ASEAN subject photo
 *
 * 图片位于 public/images/asean/<key>.jpg
 * 涵盖：泰国（大皇宫/泼水节/泰拳）、越南（奥黛/水上木偶/春节）、
 * 印尼（婆罗浮屠/蜡染/皮影）以及其余七国的地标。
 */
export function AseanPhoto({
  name,
  className = '',
  style,
  label,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/asean/${name}.jpg`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ display: 'block', ...style }}
      draggable={false}
    />
  );
}

/** Hero 大图 */
export function HeroImage({ name, className = '', style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/hero/${name}.jpg`}
      alt=""
      aria-hidden
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...style }}
      draggable={false}
    />
  );
}
