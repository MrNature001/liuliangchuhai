/**
 * 文化主视觉绘制库
 * Cultural art primitives
 *
 * 【重要设计决定】不使用 SVG 滤镜（feTurbulence / feDisplacementMap）做材质。
 * 原因：部分 SVG 渲染器（如 sharp 依赖的 librsvg）不支持这些滤镜，
 * 导致纹理在某些环境下完全消失。改为**逐点/逐线手工绘制**的纹理，
 * 在任何渲染器（浏览器、服务端转图、导出工具）下表现一致。
 */

/* ── 可复现随机数 ─────────────────────────────────────────── */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── 传统颜料色板 ─────────────────────────────────────────── */
const P = {
  paper: '#EFE8D8',
  paper2: '#E6DDC8',
  paper3: '#DCD2BA',
  ink: '#262320',        // 暖墨（不用纯黑，纯黑会显得像数字生成）
  inkSoft: '#3C3833',
  inkMid: '#5A554C',
  inkLight: '#847E71',
  inkFaint: '#AFA897',
  cinnabar: '#A8352A',
  cinnabarLt: '#C05A44',
  gamboge: '#C9A227',
  gambogeDk: '#9A7A14',
  azurite: '#3A5566',
  malachite: '#46603F',
  ochre: '#8A5A3C',
  bronze: '#7A6440',
  bronzeLt: '#C4A464',
  patina: '#5E7A6B',
  silkRed: '#9E2B22',
  silkRose: '#BE5A66',
  silkGold: '#C9A227',
};

/* ── 纹理：散点（替代 feTurbulence 的纸纹/颗粒） ───────────── */
function speckle(rng, w, h, count, color, maxR = 1.5, maxOp = 0.14) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 0.35 + rng() * maxR;
    const o = (0.25 + rng() * 0.75) * maxOp;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${o.toFixed(3)}"/>`;
  }
  return s;
}

/** 纸纤维：极细短斜线 */
function fibres(rng, w, h, count, color, maxOp = 0.07) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = 6 + rng() * 26;
    const ang = -0.5 + rng() * 0.35;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + Math.cos(ang) * len).toFixed(1)}" y2="${(y + Math.sin(ang) * len).toFixed(1)}" stroke="${color}" stroke-width="${(0.4 + rng() * 0.7).toFixed(2)}" opacity="${(rng() * maxOp).toFixed(3)}"/>`;
  }
  return s;
}

/** 宣纸底 */
function paper(w, h, seed = 1, base = P.paper) {
  const r = makeRng(seed);
  return `
  <rect width="${w}" height="${h}" fill="${base}"/>
  ${speckle(r, w, h, Math.round((w * h) / 2600), P.ochre, 1.9, 0.13)}
  ${speckle(r, w, h, Math.round((w * h) / 4200), P.ink, 1.2, 0.09)}
  ${fibres(r, w, h, Math.round((w * h) / 5200), P.inkMid, 0.05)}`;
}

/* ── 墨色渐变 ─────────────────────────────────────────────── */
function inkGrad(id, from, to, fromOp = 0.92, toOp = 0.16) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${from}" stop-opacity="${fromOp}"/>
    <stop offset="62%" stop-color="${from}" stop-opacity="${(fromOp * 0.8).toFixed(2)}"/>
    <stop offset="100%" stop-color="${to}" stop-opacity="${toOp}"/>
  </linearGradient>`;
}

/**
 * 喀斯特峰林单峰
 * 真实特征：拔地而起、山体陡峭、顶部浑圆、高低错落、互相重叠
 * 顶部宽度加大 → 浑圆；两侧控制点靠上 → 陡峭
 */
function karstPeak(r, cx, baseY, w, h) {
  const l = cx - w / 2;
  const rt = cx + w / 2;
  const topY = baseY - h;
  const lean = (r() - 0.5) * w * 0.14;
  const tc = cx + lean;
  const f = (n) => n.toFixed(1);
  // 陡峭的侧壁
  const lcx = l + w * (0.06 + r() * 0.08);
  const rcx = rt - w * (0.06 + r() * 0.08);
  const lcy = baseY - h * (0.58 + r() * 0.16);
  const rcy = baseY - h * (0.58 + r() * 0.16);
  // 浑圆的顶部
  const tw = w * (0.26 + r() * 0.14);
  const tdy = h * (0.05 + r() * 0.06);
  return `M${f(l)},${baseY} C${f(lcx)},${f(lcy)} ${f(tc - tw)},${f(topY - tdy)} ${f(tc)},${f(topY)}`
       + ` C${f(tc + tw)},${f(topY - tdy)} ${f(rcx)},${f(rcy)} ${f(rt)},${baseY} Z`;
}

/** 一层峰林的合并路径 + 各峰独立路径（用于分别上色） */
function peakLayer(seed, count, yBase, minH, maxH, minW, maxW, x0, x1) {
  const r = makeRng(seed);
  const peaks = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const cx = x0 + (x1 - x0) * t + (r() - 0.5) * (x1 - x0) * 0.09;
    const h = minH + r() * (maxH - minH);
    const w = minW + r() * (maxW - minW);
    peaks.push({ d: karstPeak(r, cx, yBase, w, h), cx, h, w });
  }
  return peaks;
}

/**
 * 山体笔触：在 clipPath 内画竖向皴法（类似国画披麻皴）
 * 这是"不像 AI"的关键 —— 真实水墨山体一定有不均匀的笔痕
 */
function cunStrokes(rng, clipId, w, h, peaks, color, count = 220) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const p = peaks[Math.floor(rng() * peaks.length)];
    if (!p) continue;
    const rel = (rng() - 0.5) * 0.8;
    const x = p.cx + rel * p.w * 0.5;
    const topY = h - p.h;
    const y0 = topY + p.h * (0.06 + rng() * 0.6);
    const len = p.h * (0.08 + rng() * 0.26);
    const dx = (rng() - 0.5) * 12;
    s += `<path d="M${x.toFixed(1)},${y0.toFixed(1)} q${(dx * 0.4).toFixed(1)},${(len * 0.5).toFixed(1)} ${dx.toFixed(1)},${len.toFixed(1)}"
      stroke="${color}" stroke-width="${(0.7 + rng() * 1.5).toFixed(2)}" fill="none" opacity="${(0.05 + rng() * 0.14).toFixed(3)}"/>`;
  }
  return `<g clip-path="url(#${clipId})">${s}</g>`;
}

/** 云雾横带 */
function mist(w, y, h, id, opacity = 0.9) {
  return `<rect x="0" y="${y}" width="${w}" height="${h}" fill="url(#${id})" opacity="${opacity}"/>`;
}

function mistGrad(id, color, peak = 0.9) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
    <stop offset="42%" stop-color="${color}" stop-opacity="${peak}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>`;
}

/** 水面波纹 */
function waterLines(rng, w, y0, y1, count, color, maxOp = 0.3) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = y0 + (y1 - y0) * t;
    const wd = w * (0.06 + rng() * 0.24);
    const x = rng() * (w - wd);
    s += `<path d="M${x.toFixed(0)},${y.toFixed(0)} q${(wd / 2).toFixed(0)},${(1.5 + rng() * 4).toFixed(1)} ${wd.toFixed(0)},0"
      stroke="${color}" stroke-width="${(0.7 + rng() * 1.1).toFixed(2)}" fill="none" opacity="${(0.3 + rng() * 0.7) * maxOp > 1 ? 1 : ((0.3 + rng() * 0.7) * maxOp).toFixed(2)}"/>`;
  }
  return s;
}

/** 朱砂印章 */
function seal(x, y, size, rng) {
  const s = size;
  let glyph = '';
  // 随机但可复现的印文笔画
  glyph += `<path d="M${s * 0.22} ${s * 0.24} H${s * 0.78}" stroke="${P.paper}" stroke-width="${s * 0.055}"/>`;
  glyph += `<path d="M${s * 0.22} ${s * 0.24} V${s * 0.76}" stroke="${P.paper}" stroke-width="${s * 0.055}"/>`;
  glyph += `<path d="M${s * 0.78} ${s * 0.24} V${s * 0.76}" stroke="${P.paper}" stroke-width="${s * 0.055}"/>`;
  glyph += `<path d="M${s * 0.22} ${s * 0.76} H${s * 0.78}" stroke="${P.paper}" stroke-width="${s * 0.055}"/>`;
  glyph += `<path d="M${s * 0.5} ${s * 0.30} V${s * 0.70}" stroke="${P.paper}" stroke-width="${s * 0.055}"/>`;
  glyph += `<path d="M${s * 0.32} ${s * 0.44} H${s * 0.68}" stroke="${P.paper}" stroke-width="${s * 0.05}"/>`;
  glyph += `<path d="M${s * 0.32} ${s * 0.58} H${s * 0.68}" stroke="${P.paper}" stroke-width="${s * 0.05}"/>`;
  return `<g transform="translate(${x} ${y})" opacity="0.9">
    <rect width="${s}" height="${s}" rx="${s * 0.05}" fill="${P.cinnabar}"/>
    ${glyph}
    ${speckle(rng, s, s, 26, '#000000', 1.1, 0.20)}
  </g>`;
}

module.exports = {
  makeRng, P, speckle, fibres, paper, inkGrad, karstPeak, peakLayer,
  cunStrokes, mist, mistGrad, waterLines, seal,
};
