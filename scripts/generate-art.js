/**
 * 文化主视觉生成器 v2
 * Cultural key-visual generator
 *
 * 设计原则（针对"AI 感"的成因逐条处理）：
 *  1. 不用 SVG 滤镜做材质 —— 部分渲染器不支持，改用逐点逐线手绘纹理
 *  2. 山形逐座随机、互相重叠，绝不出现等距重复图形（最明显的算法痕迹）
 *  3. 空气透视：远山淡、近山浓，制造纵深
 *  4. 山体加"皴法"笔触，模拟真实水墨的笔痕
 *  5. 配色取传统颜料（墨/朱砂/藤黄/石青/石绿/赭石），不用蓝紫渐变等科技风
 *  6. 构图偏置 + 大量留白，不居中对称
 *
 * 运行：node scripts/generate-art.js
 */

const fs = require('fs');
const path = require('path');
const L = require('./art-lib');
const { makeRng, P, speckle, paper, inkGrad, karstPeak, peakLayer,
        cunStrokes, mist, mistGrad, waterLines, seal } = L;

const OUT = path.join(__dirname, '..', 'public', 'images');

/* ═══════════════════════════════════════════════════════════
   通用：一套峰林场景（远/中/近三层 + 云雾 + 水面）
   ═══════════════════════════════════════════════════════════ */
function karstScene(w, h, opt = {}) {
  const horizon = opt.horizon ?? h * 0.72;
  const seed = opt.seed ?? 100;
  const showWater = opt.water !== false;

  const far  = peakLayer(seed + 1, 7, horizon, h * 0.13, h * 0.26, w * 0.13, w * 0.22, -w * 0.08, w * 1.08);
  const mid  = peakLayer(seed + 2, 6, horizon, h * 0.20, h * 0.36, w * 0.15, w * 0.24, -w * 0.06, w * 1.06);
  const near = peakLayer(seed + 3, 5, horizon, h * 0.26, h * 0.46, w * 0.17, w * 0.27, -w * 0.04, w * 0.94);

  const farD  = far.map((p) => p.d).join(' ');
  const midD  = mid.map((p) => p.d).join(' ');
  const nearD = near.map((p) => p.d).join(' ');

  const rn = makeRng(seed + 9);

  return `
  <defs>
    ${inkGrad('kFar',  P.inkFaint, P.paper, 0.55, 0.06)}
    ${inkGrad('kMid',  P.inkLight, P.paper, 0.80, 0.10)}
    ${inkGrad('kNear', P.inkSoft,  P.inkMid, 0.92, 0.30)}
    ${mistGrad('mst', P.paper, 0.94)}
    <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${P.paper3}" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${P.paper}" stop-opacity="0.98"/>
    </linearGradient>
    <clipPath id="cFar"><path d="${farD}"/></clipPath>
    <clipPath id="cMid"><path d="${midD}"/></clipPath>
    <clipPath id="cNear"><path d="${nearD}"/></clipPath>
    ${showWater ? `<clipPath id="cWat"><rect x="0" y="${horizon}" width="${w}" height="${h - horizon}"/></clipPath>` : ''}
  </defs>

  ${paper(w, h, seed, opt.base || P.paper)}

  ${opt.sun !== false ? `
  <circle cx="${(w * (opt.sunX ?? 0.76)).toFixed(0)}" cy="${(h * (opt.sunY ?? 0.20)).toFixed(0)}" r="${(h * 0.11).toFixed(0)}" fill="${P.cinnabar}" opacity="0.055"/>
  <circle cx="${(w * (opt.sunX ?? 0.76)).toFixed(0)}" cy="${(h * (opt.sunY ?? 0.20)).toFixed(0)}" r="${(h * 0.11).toFixed(0)}" fill="none" stroke="${P.cinnabar}" stroke-width="2.2" opacity="0.34"/>` : ''}

  <!-- 远景 -->
  <g opacity="0.72"><path d="${farD}" fill="url(#kFar)"/>${cunStrokes(rn, 'cFar', w, h, far, P.inkLight, 90)}</g>
  ${mist(w, horizon - h * 0.30, h * 0.30, 'mst', 0.92)}

  <!-- 中景 -->
  <g opacity="0.88"><path d="${midD}" fill="url(#kMid)"/>${cunStrokes(rn, 'cMid', w, h, mid, P.inkSoft, 170)}</g>
  ${mist(w, horizon - h * 0.22, h * 0.26, 'mst', 0.78)}

  <!-- 近景 -->
  <path d="${nearD}" fill="url(#kNear)"/>
  ${cunStrokes(rn, 'cNear', w, h, near, P.ink, 250)}

  ${showWater ? `
  <rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#wat)"/>
  <g clip-path="url(#cWat)" opacity="0.13" transform="translate(0 ${(horizon * 2).toFixed(0)}) scale(1 -1)">
    <path d="${nearD}" fill="${P.inkMid}"/>
  </g>
  <g>${waterLines(rn, w, horizon + 10, h - 8, 26, P.inkLight, 0.30)}</g>` : ''}

  ${opt.deco || ''}`;
}

/* ═══════════════════════════════════════════════════════════
   1. 桂林山水
   ═══════════════════════════════════════════════════════════ */
function guilinInk(w = 1600, h = 900) {
  const r = makeRng(4242);
  const horizon = h * 0.74;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${karstScene(w, h, { seed: 700, horizon, sunX: 0.80, sunY: 0.17, deco: `
    <!-- 竹筏渔翁 -->
    <g transform="translate(${(w * 0.27).toFixed(0)} ${(horizon + h * 0.10).toFixed(0)})" opacity="0.80">
      <path d="M0,0 q34,9 68,0 q-34,7 -68,0 Z" fill="${P.ink}"/>
      <path d="M18,-3 q3,-13 0,-21" stroke="${P.ink}" stroke-width="2.6" fill="none"/>
      <circle cx="18" cy="-24" r="3" fill="${P.ink}"/>
      <path d="M40,-2 q2,-10 0,-16" stroke="${P.inkSoft}" stroke-width="2" fill="none"/>
    </g>
    <!-- 飞鸟 -->
    <g stroke="${P.inkSoft}" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round">
      <path d="M${(w * 0.60).toFixed(0)} ${(h * 0.16).toFixed(0)} q7,-6 14,0 q7,-6 14,0"/>
      <path d="M${(w * 0.67).toFixed(0)} ${(h * 0.11).toFixed(0)} q5,-4 10,0 q5,-4 10,0"/>
      <path d="M${(w * 0.56).toFixed(0)} ${(h * 0.22).toFixed(0)} q5,-4 10,0 q5,-4 10,0"/>
      <path d="M${(w * 0.72).toFixed(0)} ${(h * 0.19).toFixed(0)} q4,-3.5 8,0 q4,-3.5 8,0"/>
    </g>
    ${seal(w - 116, h - 116, 64, r)}` })}
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   2. 广西（首页主视觉）—— 峰林 + 壮锦边饰
   ═══════════════════════════════════════════════════════════ */
function guangxiHero(w = 1600, h = 900) {
  const r = makeRng(777);
  const horizon = h * 0.70;
  const bandH = 78;

  // 壮锦边饰：菱形 + 回纹 + 圆点，手工错位
  let band = '';
  const step = 52;
  for (let i = 0; i * step < w + step; i++) {
    const x = i * step + step / 2;
    const wob = (r() - 0.5) * 2.4;
    const cy = bandH * 0.5 + wob;
    const d = bandH * 0.30;
    band += `<path d="M${x},${cy - d} L${x + d * 0.86},${cy} L${x},${cy + d} L${x - d * 0.86},${cy} Z"
      fill="none" stroke="${P.gamboge}" stroke-width="1.9" opacity="0.80"/>`;
    band += `<path d="M${x},${cy - d * 0.44} L${x + d * 0.38},${cy} L${x},${cy + d * 0.44} L${x - d * 0.38},${cy} Z"
      fill="${P.cinnabar}" opacity="0.70"/>`;
    band += `<circle cx="${x + step / 2}" cy="${cy}" r="2.9" fill="${P.malachite}" opacity="0.60"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${karstScene(w, h, {
    seed: 2100, horizon, sunX: 0.79, sunY: 0.19, base: P.paper2,
    deco: seal(w - 118, h - 118, 66, r),
  })}

  <!-- 顶部壮锦边饰 -->
  <rect x="0" y="0" width="${w}" height="${bandH}" fill="${P.ink}" opacity="0.94"/>
  <g>${band}</g>
  <rect x="0" y="${bandH}" width="${w}" height="3" fill="${P.cinnabar}" opacity="0.88"/>
  <rect x="0" y="${bandH + 3}" width="${w}" height="1.6" fill="${P.gamboge}" opacity="0.55"/>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   3. 左江花山岩画 —— 石灰岩崖壁 + 朱砂蛙形人
   ═══════════════════════════════════════════════════════════ */
function huashan(size = 900) {
  const r = makeRng(2024);

  // 崖壁岩层：水平层理 + 垂直裂隙
  let strata = '';
  for (let i = 0; i < 30; i++) {
    const y = (i / 30) * size + (r() - 0.5) * 16;
    const op = 0.04 + r() * 0.09;
    const amp = (r() - 0.5) * 30;
    strata += `<path d="M0,${y.toFixed(0)} Q${(size * 0.3).toFixed(0)},${(y + amp).toFixed(0)} ${(size * 0.65).toFixed(0)},${(y - amp * 0.6).toFixed(0)} T${size},${(y + amp * 0.4).toFixed(0)}"
      stroke="${P.ink}" stroke-width="${(0.6 + r() * 1.8).toFixed(1)}" fill="none" opacity="${op.toFixed(3)}"/>`;
  }
  let cracks = '';
  for (let i = 0; i < 12; i++) {
    const x = r() * size;
    let d = `M${x.toFixed(0)},0`;
    let cx = x;
    for (let k = 0; k < 7; k++) {
      cx += (r() - 0.5) * 34;
      d += ` L${cx.toFixed(0)},${(((k + 1) / 7) * size).toFixed(0)}`;
    }
    cracks += `<path d="${d}" stroke="${P.ink}" stroke-width="${(0.7 + r() * 1.3).toFixed(1)}" fill="none" opacity="${(0.05 + r() * 0.10).toFixed(3)}"/>`;
  }

  /**
   * 蛙形人 —— 花山岩画标志性形象
   * 真实特征：圆头、蹲踞、双臂上举且肘部弯曲、指掌张开、躯干短粗
   * 用实心剪影（岩画是平涂色块，不是线条画）
   */
  const frogMan = (x, y, s, op) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <circle cx="0" cy="-46" r="12.5"/>
    <path d="M-15,-33 L15,-33 L18,-2 L-18,-2 Z"/>
    <path d="M-18,-29 Q-40,-44 -44,-60 L-35,-63 Q-28,-46 -12,-38 Z"/>
    <path d="M18,-29 Q40,-44 44,-60 L35,-63 Q28,-46 12,-38 Z"/>
    <path d="M-44,-60 l-9,-9 M-40,-64 l-4,-11 M-34,-66 l2,-11"/>
    <path d="M44,-60 l9,-9 M40,-64 l4,-11 M34,-66 l-2,-11"/>
    <path d="M-17,-2 Q-34,22 -36,38 L-23,40 Q-19,20 -6,3 Z"/>
    <path d="M17,-2 Q34,22 36,38 L23,40 Q19,20 6,3 Z"/>
  </g>`;

  /** 侧身小人与铜鼓纹 */
  const small = (x, y, s, op) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <circle cx="0" cy="-27" r="8"/>
    <path d="M-9,-19 L9,-19 L11,0 L-11,0 Z"/>
    <path d="M-9,-16 Q-22,-26 -25,-36 L-19,-38 Q-15,-28 -6,-23 Z"/>
    <path d="M9,-16 Q22,-26 25,-36 L19,-38 Q15,-28 6,-23 Z"/>
    <path d="M-10,0 Q-18,14 -19,24 L-12,25 Q-10,14 -3,1 Z"/>
    <path d="M10,0 Q18,14 19,24 L12,25 Q10,14 3,1 Z"/>
  </g>`;

  const sun = (x, y, s, op) => {
    let rays = '';
    for (let i = 0; i < 10; i++) {
      const a = (i * 36 * Math.PI) / 180;
      rays += `<line x1="${(x + Math.cos(a) * 21 * s).toFixed(1)}" y1="${(y + Math.sin(a) * 21 * s).toFixed(1)}"
        x2="${(x + Math.cos(a) * 36 * s).toFixed(1)}" y2="${(y + Math.sin(a) * 36 * s).toFixed(1)}"
        stroke="${P.cinnabar}" stroke-width="${(2.6 * s).toFixed(1)}" opacity="${op}"/>`;
    }
    return `<circle cx="${x}" cy="${y}" r="${18 * s}" fill="none" stroke="${P.cinnabar}" stroke-width="${3 * s}" opacity="${op}"/>
            <circle cx="${x}" cy="${y}" r="${8.5 * s}" fill="${P.cinnabar}" opacity="${(op * 0.85).toFixed(2)}"/>${rays}`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="cliff" x1="0.1" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#CDC3A9"/>
      <stop offset="45%" stop-color="#B5AA8E"/>
      <stop offset="100%" stop-color="#948A72"/>
    </linearGradient>
    <linearGradient id="cliffShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.26"/>
      <stop offset="52%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.24"/>
    </linearGradient>
  </defs>

  <rect width="${size}" height="${size}" fill="url(#cliff)"/>
  <g>${strata}</g>
  <g>${cracks}</g>
  <rect width="${size}" height="${size}" fill="url(#cliffShade)"/>
  ${speckle(r, size, size, 2600, P.ink, 1.7, 0.13)}
  ${speckle(r, size, size, 900, P.ochre, 1.3, 0.16)}

  ${sun(size * 0.17, size * 0.19, 1.55, 0.72)}
  ${frogMan(size * 0.31, size * 0.50, 1.42, 0.86)}
  ${frogMan(size * 0.48, size * 0.42, 1.12, 0.78)}
  ${frogMan(size * 0.64, size * 0.54, 1.32, 0.83)}
  ${frogMan(size * 0.80, size * 0.45, 0.98, 0.70)}
  ${small(size * 0.19, size * 0.76, 1.5, 0.68)}
  ${small(size * 0.40, size * 0.83, 1.2, 0.60)}
  ${small(size * 0.73, size * 0.80, 1.35, 0.66)}
  ${small(size * 0.89, size * 0.72, 1.0, 0.53)}

  <!-- 风化：局部浅色覆盖，让岩画不像是刚画上去的 -->
  <g opacity="0.16">
    ${speckle(r, size, size, 420, '#D8CFB8', 5.5, 0.55)}
  </g>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   4. 铜鼓
   ═══════════════════════════════════════════════════════════ */
function bronzeDrum(size = 900) {
  const c = size / 2;
  const R = c * 0.92;
  const r = makeRng(909);

  function fretRing(radius, count, w, stroke, op = 0.6) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = (i * 2 * Math.PI) / count;
      const x = c + Math.cos(a) * radius;
      const y = c + Math.sin(a) * radius;
      const deg = (a * 180) / Math.PI;
      s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})">
        <path d="M${-w / 2},${w / 2} L${-w / 2},${-w / 2} L${w / 2},${-w / 2} L${w / 2},${w / 2} L${-w / 6},${w / 2} L${-w / 6},${-w / 6} L${w / 6},${-w / 6}"
          fill="none" stroke="${stroke}" stroke-width="1.5" opacity="${op}"/></g>`;
    }
    return s;
  }
  function birdRing(radius, count, s0, stroke) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const a = (i * 2 * Math.PI) / count + 0.2;
      const x = c + Math.cos(a) * radius;
      const y = c + Math.sin(a) * radius;
      const deg = (a * 180) / Math.PI + 90;
      s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${s0})"
        fill="none" stroke="${stroke}" stroke-width="1.9" opacity="0.48" stroke-linecap="round">
        <path d="M-14,3 q14,-10 28,-1"/><path d="M-2,-1 q-3,-12 7,-15 q10,3 7,15"/><path d="M7,-16 q8,-4 12,3"/></g>`;
    }
    return s;
  }

  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r0 = R * 0.20, r1 = R * 0.34;
    rays += `<path d="M${(c + Math.cos(a - 0.055) * r0).toFixed(1)},${(c + Math.sin(a - 0.055) * r0).toFixed(1)}
      L${(c + Math.cos(a) * r1).toFixed(1)},${(c + Math.sin(a) * r1).toFixed(1)}
      L${(c + Math.cos(a + 0.055) * r0).toFixed(1)},${(c + Math.sin(a + 0.055) * r0).toFixed(1)} Z"
      fill="${P.gamboge}" opacity="0.78"/>`;
  }

  let patina = '';
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * R * 0.95;
    const x = c + Math.cos(a) * rad, y = c + Math.sin(a) * rad;
    const rr = 3 + r() * 17;
    patina += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rr.toFixed(0)}" ry="${(rr * (0.45 + r() * 0.6)).toFixed(0)}" fill="${P.patina}" opacity="${(0.05 + r() * 0.15).toFixed(2)}"/>`;
  }
  // 铸造砂眼与磨损划痕
  const wear = speckle(r, size, size, 1400, '#2E2416', 1.5, 0.20);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="drumFace" cx="36%" cy="30%">
      <stop offset="0%" stop-color="#A88C5C"/>
      <stop offset="36%" stop-color="#7E6844"/>
      <stop offset="70%" stop-color="#5C4930"/>
      <stop offset="100%" stop-color="#3B2C1B"/>
    </radialGradient>
    <radialGradient id="drumDisc" cx="50%" cy="50%">
      <stop offset="84%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
    </radialGradient>
    <clipPath id="drumClip"><circle cx="${c}" cy="${c}" r="${R}"/></clipPath>
  </defs>

  ${paper(size, size, 909)}

  <circle cx="${c + 7}" cy="${c + 12}" r="${R}" fill="#000" opacity="0.17"/>
  <circle cx="${c}" cy="${c}" r="${R}" fill="url(#drumFace)"/>

  <g clip-path="url(#drumClip)">
    <g fill="none" stroke="#C9A96A" opacity="0.46">
      <circle cx="${c}" cy="${c}" r="${R * 0.955}" stroke-width="3.4"/>
      <circle cx="${c}" cy="${c}" r="${R * 0.90}" stroke-width="1.5"/>
      <circle cx="${c}" cy="${c}" r="${R * 0.735}" stroke-width="1.5"/>
      <circle cx="${c}" cy="${c}" r="${R * 0.545}" stroke-width="1.5"/>
      <circle cx="${c}" cy="${c}" r="${R * 0.405}" stroke-width="1.3"/>
    </g>
    ${fretRing(R * 0.815, 46, R * 0.085, '#DCC07E')}
    ${birdRing(R * 0.635, 15, R / 300, '#DCC07E')}
    ${fretRing(R * 0.30, 22, R * 0.07, '#DCC07E')}
    ${rays}
    <circle cx="${c}" cy="${c}" r="${R * 0.155}" fill="#CBA964" opacity="0.55"/>
    <circle cx="${c}" cy="${c}" r="${R * 0.155}" fill="none" stroke="#E4CE94" stroke-width="2" opacity="0.68"/>
    <circle cx="${c}" cy="${c}" r="${R * 0.062}" fill="#E4CE94" opacity="0.78"/>
    <g>${patina}</g>
    <g>${wear}</g>
    <circle cx="${c}" cy="${c}" r="${R}" fill="url(#drumDisc)"/>
  </g>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   5. 壮锦（菱形 / 回纹 / 水波）
   ═══════════════════════════════════════════════════════════ */
function zhuangjin(kind, size = 900) {
  const r = makeRng(kind === 'diamond' ? 11 : kind === 'fret' ? 22 : 33);
  const bg = kind === 'diamond' ? '#8E2B22' : kind === 'fret' ? '#22303F' : '#1F3A33';
  const fg = kind === 'diamond' ? P.gamboge : kind === 'fret' ? '#D8BC78' : '#CFE0C8';

  let motif = '';
  if (kind === 'diamond') {
    const step = size / 4;
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        const cx = gx * step + step / 2;
        const cy = gy * step + step / 2;
        const d = step * 0.40;
        const jit = (r() - 0.5) * 3;
        motif += `<path d="M${cx},${cy - d} L${cx + d},${cy} L${cx},${cy + d} L${cx - d},${cy} Z"
          fill="none" stroke="${fg}" stroke-width="3.4" opacity="0.9" transform="rotate(${jit.toFixed(1)} ${cx} ${cy})"/>`;
        motif += `<path d="M${cx},${cy - d * 0.52} L${cx + d * 0.52},${cy} L${cx},${cy + d * 0.52} L${cx - d * 0.52},${cy} Z" fill="${fg}" opacity="0.72"/>`;
        motif += `<circle cx="${cx}" cy="${cy}" r="${d * 0.13}" fill="${bg}"/>`;
        for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          motif += `<path d="M${cx + ox * step * 0.42},${cy + oy * step * 0.42} l${ox * 12},0 l0,${oy * 12}"
            fill="none" stroke="${fg}" stroke-width="2" opacity="0.45"/>`;
        }
      }
    }
  } else if (kind === 'fret') {
    const step = size / 8;
    for (let gy = 0; gy < 8; gy++) {
      for (let gx = 0; gx < 8; gx++) {
        const x = gx * step + step * 0.12;
        const y = gy * step + step * 0.12;
        const s = step * 0.76;
        const flip = (gx + gy) % 2 === 0 ? 1 : -1;
        motif += `<g transform="translate(${x} ${y}) scale(${flip} 1)">
          <path d="M0,${s} L0,0 L${s},0 L${s},${s} L${s * 0.3},${s} L${s * 0.3},${s * 0.3} L${s * 0.7},${s * 0.3} L${s * 0.7},${s * 0.7}"
            fill="none" stroke="${fg}" stroke-width="2.6" opacity="0.80" stroke-linecap="square"/></g>`;
      }
    }
  } else {
    for (let band = 0; band < 9; band++) {
      const y = (band + 0.5) * (size / 9);
      const amp = 11 + r() * 5;
      let d = `M0,${y}`;
      for (let x = 0; x <= size; x += size / 9) d += ` q${(size / 18).toFixed(0)},${(-amp).toFixed(0)} ${(size / 9).toFixed(0)},0`;
      motif += `<path d="${d}" fill="none" stroke="${fg}" stroke-width="${band % 2 ? 2.2 : 3.4}" opacity="0.78"/>`;
      for (let x = size / 18; x < size; x += size / 9) {
        motif += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.4" fill="${fg}" opacity="0.58"/>`;
      }
    }
  }

  // 经纬线：织物最本质的特征
  let weave = '';
  const n = 54;
  for (let i = 0; i < n; i++) {
    weave += `<line x1="${((i * size) / n).toFixed(1)}" y1="0" x2="${((i * size) / n).toFixed(1)}" y2="${size}" stroke="#FFFFFF" stroke-width="1.1" opacity="0.052"/>`;
    weave += `<line x1="0" y1="${((i * size) / n).toFixed(1)}" x2="${size}" y2="${((i * size) / n).toFixed(1)}" stroke="#000000" stroke-width="1.1" opacity="0.072"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="zjG${kind}" x1="0" y1="0" x2="0.62" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.24"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <g>${motif}</g>
  <g>${weave}</g>
  <!-- 丝线光泽不均：随机浅色斑 -->
  <g>${speckle(r, size, size, 900, '#FFFFFF', 2.6, 0.09)}</g>
  <g>${speckle(r, size, size, 700, '#000000', 2.2, 0.11)}</g>
  <rect width="${size}" height="${size}" fill="url(#zjG${kind})"/>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   6. 干栏式建筑
   ═══════════════════════════════════════════════════════════ */
function stiltHouse(size = 900) {
  const r = makeRng(606);
  const S = size;
  // 屋脊与檐口
  const ridgeY = S * 0.30;
  const eaveY = S * 0.425;
  const eaveL = S * 0.16, eaveR = S * 0.84;
  const ridgeL = S * 0.335, ridgeR = S * 0.665;
  // 檐口线：中间低、两角翘起（中国屋顶特征）
  const eaveCurve = `M${eaveL},${eaveY - S * 0.022} Q${S * 0.5},${eaveY + S * 0.028} ${eaveR},${eaveY - S * 0.022}`;

  // 背景远山
  const back = peakLayer(707, 4, S * 0.80, S * 0.09, S * 0.20, S * 0.13, S * 0.21, -S * 0.06, S * 1.06);

  // 竹丛
  let bamboo = '';
  for (let i = 0; i < 8; i++) {
    const x = S * (0.035 + i * 0.030) + (r() - 0.5) * 16;
    const hgt = S * (0.17 + r() * 0.15);
    const y0 = S * 0.865;
    bamboo += `<g opacity="${(0.34 + r() * 0.28).toFixed(2)}">
      <line x1="${x.toFixed(0)}" y1="${y0}" x2="${(x + (r() - 0.5) * 20).toFixed(0)}" y2="${(y0 - hgt).toFixed(0)}" stroke="${P.inkMid}" stroke-width="${(2.2 + r() * 1.5).toFixed(1)}"/>
      ${Array.from({ length: 5 }, (_, k) => {
        const yy = y0 - hgt * (0.30 + k * 0.17);
        const sgn = k % 2 ? 1 : -1;
        return `<path d="M${x.toFixed(0)},${yy.toFixed(0)} q${(sgn * 24).toFixed(0)},${(-16 - r() * 12).toFixed(0)} ${(sgn * 42).toFixed(0)},${(-4 - r() * 9).toFixed(0)}" fill="none" stroke="${P.inkMid}" stroke-width="1.9"/>`;
      }).join('')}
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    ${inkGrad('shFar', P.inkFaint, P.paper, 0.5, 0.05)}
    ${mistGrad('shMist', P.paper, 0.9)}
    <linearGradient id="roofFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4E463C"/>
      <stop offset="100%" stop-color="#6E6355"/>
    </linearGradient>
    <linearGradient id="roofSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#332C25"/>
      <stop offset="100%" stop-color="#4A4137"/>
    </linearGradient>
    <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B08558"/>
      <stop offset="100%" stop-color="#6E4E31"/>
    </linearGradient>
    <clipPath id="cRoof"><path d="M${eaveL},${eaveY} L${ridgeL},${ridgeY} L${ridgeR},${ridgeY} L${eaveR},${eaveY} Q${S * 0.5},${eaveY + S * 0.028} ${eaveL},${eaveY} Z"/></clipPath>
  </defs>

  ${paper(S, S, 606)}
  <g opacity="0.30"><path d="${back.map((p) => p.d).join(' ')}" fill="url(#shFar)"/></g>
  ${mist(S, S * 0.58, S * 0.24, 'shMist', 0.85)}
  ${bamboo}

  <!-- 底层架空柱 -->
  <g stroke="url(#woodG)" stroke-width="${(S * 0.013).toFixed(1)}" stroke-linecap="round">
    <line x1="${S * 0.29}" y1="${S * 0.62}" x2="${S * 0.29}" y2="${S * 0.865}"/>
    <line x1="${S * 0.42}" y1="${S * 0.62}" x2="${S * 0.42}" y2="${S * 0.865}"/>
    <line x1="${S * 0.58}" y1="${S * 0.62}" x2="${S * 0.58}" y2="${S * 0.865}"/>
    <line x1="${S * 0.71}" y1="${S * 0.62}" x2="${S * 0.71}" y2="${S * 0.865}"/>
  </g>
  <!-- 楼板 -->
  <rect x="${S * 0.255}" y="${S * 0.575}" width="${S * 0.49}" height="${S * 0.045}" fill="#7A5535"/>
  <rect x="${S * 0.255}" y="${S * 0.575}" width="${S * 0.49}" height="${S * 0.008}" fill="#9A7350" opacity="0.7"/>
  <!-- 墙体 -->
  <rect x="${S * 0.28}" y="${S * 0.415}" width="${S * 0.44}" height="${S * 0.165}" fill="#C9B28C"/>
  <rect x="${S * 0.28}" y="${S * 0.415}" width="${S * 0.44}" height="${S * 0.165}" fill="none" stroke="#6E4E31" stroke-width="2.6"/>
  <!-- 木构架 -->
  <g stroke="#6E4E31" stroke-width="1.6" opacity="0.5">
    <line x1="${S * 0.335}" y1="${S * 0.415}" x2="${S * 0.335}" y2="${S * 0.58}"/>
    <line x1="${S * 0.665}" y1="${S * 0.415}" x2="${S * 0.665}" y2="${S * 0.58}"/>
    <line x1="${S * 0.28}" y1="${S * 0.50}" x2="${S * 0.72}" y2="${S * 0.50}"/>
  </g>
  <!-- 窗 -->
  <rect x="${S * 0.355}" y="${S * 0.455}" width="${S * 0.10}" height="${S * 0.085}" fill="#463726"/>
  <rect x="${S * 0.545}" y="${S * 0.455}" width="${S * 0.10}" height="${S * 0.085}" fill="#463726"/>
  <g stroke="#C9B28C" stroke-width="2.4">
    <line x1="${S * 0.405}" y1="${S * 0.455}" x2="${S * 0.405}" y2="${S * 0.54}"/>
    <line x1="${S * 0.595}" y1="${S * 0.455}" x2="${S * 0.595}" y2="${S * 0.54}"/>
  </g>

  <!-- 屋顶：出檐深远 + 两角起翘 -->
  <path d="M${eaveL},${eaveY} L${ridgeL},${ridgeY} L${ridgeR},${ridgeY} L${eaveR},${eaveY} Q${S * 0.5},${eaveY + S * 0.028} ${eaveL},${eaveY} Z" fill="url(#roofFront)"/>
  <g clip-path="url(#cRoof)">
    ${Array.from({ length: 26 }, (_, i) => {
      const t = i / 25;
      const x = eaveL + (eaveR - eaveL) * t;
      return `<line x1="${x.toFixed(0)}" y1="${ridgeY}" x2="${x.toFixed(0)}" y2="${(eaveY + S * 0.03).toFixed(0)}" stroke="#2C261F" stroke-width="1.3" opacity="0.30"/>`;
    }).join('')}
  </g>
  <!-- 屋脊 -->
  <path d="M${ridgeL},${ridgeY} L${ridgeR},${ridgeY}" stroke="#2E2822" stroke-width="${(S * 0.014).toFixed(1)}" stroke-linecap="round"/>
  <path d="M${ridgeL - S * 0.012},${ridgeY + S * 0.004} q${S * 0.012},${-S * 0.02} ${S * 0.024},0" fill="none" stroke="#2E2822" stroke-width="3"/>
  <path d="M${ridgeR - S * 0.012},${ridgeY + S * 0.004} q${S * 0.012},${-S * 0.02} ${S * 0.024},0" fill="none" stroke="#2E2822" stroke-width="3"/>
  <!-- 檐口翘角 -->
  <path d="M${eaveL},${eaveY - S * 0.022} q${-S * 0.052},${-S * 0.012} ${-S * 0.072},${-S * 0.052}" fill="none" stroke="#3A342C" stroke-width="${(S * 0.011).toFixed(1)}" stroke-linecap="round"/>
  <path d="M${eaveR},${eaveY - S * 0.022} q${S * 0.052},${-S * 0.012} ${S * 0.072},${-S * 0.052}" fill="none" stroke="#3A342C" stroke-width="${(S * 0.011).toFixed(1)}" stroke-linecap="round"/>
  <!-- 檐口阴影 -->
  <path d="M${eaveL},${eaveY - S * 0.022} Q${S * 0.5},${eaveY + S * 0.028} ${eaveR},${eaveY - S * 0.022}" fill="none" stroke="#2E2822" stroke-width="2.4" opacity="0.55"/>

  <!-- 楼梯 -->
  <g stroke="#8A6240" stroke-width="${(S * 0.008).toFixed(1)}" stroke-linecap="round">
    <line x1="${S * 0.735}" y1="${S * 0.615}" x2="${S * 0.825}" y2="${S * 0.862}"/>
    <line x1="${S * 0.788}" y1="${S * 0.615}" x2="${S * 0.878}" y2="${S * 0.862}"/>
  </g>
  <g stroke="#8A6240" stroke-width="3.4">
    ${Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      const y = S * (0.615 + 0.247 * t);
      const x1 = S * (0.735 + 0.09 * t);
      return `<line x1="${x1.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x1 + S * 0.053).toFixed(0)}" y2="${y.toFixed(0)}"/>`;
    }).join('')}
  </g>

  <!-- 地面 -->
  <path d="M0,${S * 0.865} Q${S * 0.5},${S * 0.848} ${S},${S * 0.868} L${S},${S} L0,${S} Z" fill="#7E8A6E" opacity="0.45"/>
  <g>${speckle(r, S, S, 500, P.malachite, 3.2, 0.14)}</g>
  <g stroke="${P.inkMid}" stroke-width="1.1" opacity="0.16">
    ${Array.from({ length: 20 }, () => {
      const x = r() * S, y = S * (0.875 + r() * 0.12);
      return `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x + 8 + r() * 26).toFixed(0)}" y2="${(y - 5 - r() * 9).toFixed(0)}"/>`;
    }).join('')}
  </g>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   7. 绣球 —— 深红/玫红/金 丝绸（不是彩虹色）
   ═══════════════════════════════════════════════════════════ */
function embroideryBall(size = 900) {
  const c = size / 2;
  const R = size * 0.30;
  const r = makeRng(505);
  // 真实壮绣球配色：朱红 / 玫红 / 桃红 / 金，不用绿蓝等冷色
  const cols = [P.silkRed, P.silkRose, P.silkGold, '#8E2B22', '#C9767E', '#B0842A',
                P.silkRed, P.silkRose, P.silkGold, '#8E2B22', '#C9767E', '#B0842A'];

  let petals = '';
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 * Math.PI) / 180;
    const a1 = ((i + 1) * 30 * Math.PI) / 180;
    const am = (a0 + a1) / 2;
    const bulge = 1.13 + (r() - 0.5) * 0.035;
    const f = (n) => n.toFixed(1);
    petals += `<path d="M${f(c)},${f(c)}
      L${f(c + Math.cos(a0) * R)},${f(c + Math.sin(a0) * R)}
      Q${f(c + Math.cos(am) * R * bulge)},${f(c + Math.sin(am) * R * bulge)}
       ${f(c + Math.cos(a1) * R)},${f(c + Math.sin(a1) * R)} Z"
      fill="${cols[i]}" opacity="0.95"/>`;
    // 瓣内丝线
    for (let k = 1; k <= 4; k++) {
      const t = k / 5;
      petals += `<path d="M${f(c + Math.cos(a0) * R * t)},${f(c + Math.sin(a0) * R * t)}
        Q${f(c + Math.cos(am) * R * bulge * t * 1.02)},${f(c + Math.sin(am) * R * bulge * t * 1.02)}
         ${f(c + Math.cos(a1) * R * t)},${f(c + Math.sin(a1) * R * t)}"
        fill="none" stroke="#FFFFFF" stroke-width="0.8" opacity="0.16"/>`;
    }
    // 瓣间金线（刺绣的分瓣线）
    petals += `<line x1="${f(c)}" y1="${f(c)}" x2="${f(c + Math.cos(a0) * R)}" y2="${f(c + Math.sin(a0) * R)}"
      stroke="${P.gamboge}" stroke-width="1.6" opacity="0.50"/>`;
    // 瓣尖金边
    petals += `<path d="M${f(c + Math.cos(a0) * R * 0.85)},${f(c + Math.sin(a0) * R * 0.85)}
      Q${f(c + Math.cos(am) * R * bulge * 0.93)},${f(c + Math.sin(am) * R * bulge * 0.93)}
       ${f(c + Math.cos(a1) * R * 0.85)},${f(c + Math.sin(a1) * R * 0.85)}"
      fill="none" stroke="${P.gamboge}" stroke-width="1.2" opacity="0.35"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="silkShade" cx="34%" cy="28%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.46"/>
      <stop offset="42%" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.36"/>
    </radialGradient>
    <linearGradient id="tasselG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${P.gamboge}"/>
      <stop offset="100%" stop-color="#8E6E12"/>
    </linearGradient>
    <clipPath id="ballClip"><circle cx="${c}" cy="${c}" r="${R * 1.02}"/></clipPath>
  </defs>

  ${paper(size, size, 505)}
  <circle cx="${c + 10}" cy="${c + 16}" r="${R * 1.02}" fill="#000" opacity="0.14"/>

  <g>${petals}</g>
  <g clip-path="url(#ballClip)">
    <!-- 丝绸经纬 -->
    ${(() => {
      let w = '';
      const n = 40;
      for (let i = 0; i < n; i++) {
        const x = c - R + (i * 2 * R) / n;
        w += `<line x1="${x.toFixed(1)}" y1="${(c - R).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(c + R).toFixed(1)}" stroke="#FFFFFF" stroke-width="0.8" opacity="0.055"/>`;
      }
      return w;
    })()}
    <circle cx="${c}" cy="${c}" r="${R * 1.02}" fill="url(#silkShade)"/>
  </g>
  <circle cx="${c}" cy="${c}" r="${R * 1.02}" fill="none" stroke="#7A1E16" stroke-width="2.2" opacity="0.5"/>

  <!-- 中心金扣 -->
  <circle cx="${c}" cy="${c}" r="${R * 0.17}" fill="${P.gamboge}"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.17}" fill="none" stroke="#8B6F14" stroke-width="2"/>
  <circle cx="${c}" cy="${c}" r="${R * 0.095}" fill="${P.silkRed}" opacity="0.65"/>

  <!-- 流苏 -->
  <g transform="translate(${c} ${c + R * 0.99})">
    <path d="M0,0 q-15,32 -3,58" fill="none" stroke="url(#tasselG)" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M0,0 q17,30 5,55" fill="none" stroke="${P.silkRose}" stroke-width="6.5" stroke-linecap="round"/>
    ${Array.from({ length: 13 }, (_, i) => {
      const x = -17 + i * 2.8;
      return `<line x1="${x.toFixed(1)}" y1="54" x2="${(x + (i - 6) * 0.85).toFixed(1)}" y2="${(84 + ((i * 7) % 11)).toFixed(1)}" stroke="${i % 2 ? P.gamboge : P.silkRose}" stroke-width="1.8" opacity="0.72"/>`;
    }).join('')}
  </g>
</svg>`;
}

/* ═══════════════════════════════════════════════════════════
   8. 丝路新章 / 数字遗产 / 互动体验
   ═══════════════════════════════════════════════════════════ */
function exchangeHero(w = 1600, h = 900) {
  const r = makeRng(1313);
  const horizon = h * 0.63;

  const ship = (x, y, s, op) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">
    <path d="M-48,0 q48,14 96,0 q-48,10 -96,0 Z" fill="${P.ink}"/>
    <line x1="0" y1="-5" x2="0" y2="-76" stroke="${P.ink}" stroke-width="3.2"/>
    <path d="M5,-74 L5,-16 Q44,-36 5,-74 Z" fill="${P.inkSoft}" opacity="0.86"/>
    <path d="M-5,-70 L-5,-22 Q-36,-38 -5,-70 Z" fill="${P.inkSoft}" opacity="0.60"/>
    <path d="M-5,-22 q-18,3 -30,0" stroke="${P.inkMid}" stroke-width="1.8" fill="none"/>
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    ${inkGrad('exFar', P.inkFaint, P.paper, 0.5, 0.05)}
    <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${P.azurite}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${P.azurite}" stop-opacity="0.07"/>
    </linearGradient>
  </defs>
  ${paper(w, h, 1313, P.paper2)}

  <g opacity="0.32"><path d="${peakLayer(99, 5, horizon - 6, h * 0.07, h * 0.16, w * 0.15, w * 0.25, -w * 0.06, w * 0.58).map((p) => p.d).join(' ')}" fill="url(#exFar)"/></g>
  <circle cx="${w * 0.79}" cy="${h * 0.21}" r="${h * 0.10}" fill="${P.cinnabar}" opacity="0.055"/>
  <circle cx="${w * 0.79}" cy="${h * 0.21}" r="${h * 0.10}" fill="none" stroke="${P.cinnabar}" stroke-width="2.2" opacity="0.36"/>

  <rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#seaG)"/>
  <g>${waterLines(r, w, horizon + 8, h - 6, 34, P.azurite, 0.34)}</g>

  <!-- 航线 -->
  <g fill="none" stroke="${P.cinnabar}" stroke-width="2" opacity="0.5" stroke-dasharray="12 10">
    <path d="M${w * 0.09},${h * 0.81} Q${w * 0.40},${h * 0.54} ${w * 0.60},${h * 0.73}"/>
    <path d="M${w * 0.60},${h * 0.73} Q${w * 0.79},${h * 0.61} ${w * 0.92},${h * 0.79}"/>
  </g>
  <g fill="${P.cinnabar}" opacity="0.7">
    <circle cx="${w * 0.09}" cy="${h * 0.81}" r="5.5"/>
    <circle cx="${w * 0.60}" cy="${h * 0.73}" r="6.5"/>
    <circle cx="${w * 0.92}" cy="${h * 0.79}" r="5.5"/>
  </g>
  ${ship(w * 0.28, h * 0.79, 1.2, 0.84)}
  ${ship(w * 0.73, h * 0.88, 0.8, 0.52)}
  ${seal(w - 112, h - 112, 62, r)}
</svg>`;
}

function archiveHero(w = 1600, h = 900) {
  const r = makeRng(1444);
  // 卷轴 + 拓片叠放，做出档案库的层次
  const scroll = (x, y, sw, sh, rot, op, fill) => `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${op}">
    <rect x="${-sw / 2}" y="${-sh / 2}" width="${sw}" height="${sh}" fill="${fill}" stroke="${P.inkLight}" stroke-width="1.3"/>
    <rect x="${-sw / 2}" y="${-sh / 2}" width="${sw}" height="${sh}" fill="none" stroke="${P.ochre}" stroke-width="2.2" opacity="0.5"/>
    ${Array.from({ length: 8 }, (_, k) =>
      `<line x1="${(-sw / 2 + sw * 0.14).toFixed(0)}" y1="${(-sh / 2 + sh * (0.14 + k * 0.095)).toFixed(0)}" x2="${(sw / 2 - sw * 0.14 + (r() - 0.5) * 14).toFixed(0)}" y2="${(-sh / 2 + sh * (0.14 + k * 0.095)).toFixed(0)}" stroke="${P.inkMid}" stroke-width="1.4" opacity="${(0.2 + r() * 0.28).toFixed(2)}"/>`).join('')}
    ${speckle(r, sw, sh, 130, P.ochre, 1.4, 0.16).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${(parseFloat(v) - sh / 2).toFixed(1)}"`).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${(parseFloat(v) - sw / 2).toFixed(1)}"`)}
  </g>`;
  // 卷轴两端木轴
  const roller = (x, y, sh, rot, op) => `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${op}">
    <rect x="-7" y="${-sh / 2}" width="14" height="${sh}" rx="7" fill="#7A5535"/>
    <rect x="-7" y="${-sh / 2}" width="5" height="${sh}" rx="2.5" fill="#A87C52" opacity="0.65"/>
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="arVig" cx="50%" cy="46%">
      <stop offset="0%" stop-color="${P.paper2}" stop-opacity="0"/>
      <stop offset="70%" stop-color="${P.paper2}" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="${P.paper2}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  ${paper(w, h, 1444, '#E9E1CD')}

  <!-- 架格横线 -->
  <g stroke="${P.ochre}" stroke-width="3" opacity="0.16">
    <line x1="0" y1="${h * 0.36}" x2="${w}" y2="${h * 0.355}"/>
    <line x1="0" y1="${h * 0.79}" x2="${w}" y2="${h * 0.785}"/>
  </g>

  <!-- 后排 -->
  ${scroll(w * 0.20, h * 0.46, 168, 232, -7, 0.62, '#DFD5BC')}
  ${scroll(w * 0.38, h * 0.44, 168, 232, 4, 0.66, '#E4DAC2')}
  ${scroll(w * 0.56, h * 0.47, 168, 232, -4, 0.60, '#DBD1B8')}
  ${scroll(w * 0.74, h * 0.45, 168, 232, 6, 0.64, '#E1D7BE')}
  <!-- 前排（更清晰） -->
  ${scroll(w * 0.29, h * 0.60, 182, 250, 3, 0.88, '#EDE4CE')}
  ${scroll(w * 0.51, h * 0.62, 182, 250, -3, 0.90, '#F0E7D2')}
  ${scroll(w * 0.72, h * 0.59, 182, 250, 5, 0.86, '#EAE1CB')}
  <!-- 木轴 -->
  ${roller(w * 0.29 - 91, h * 0.60, 250, 3, 0.85)}
  ${roller(w * 0.51 + 91, h * 0.62, 250, -3, 0.85)}
  ${roller(w * 0.72 - 91, h * 0.59, 250, 5, 0.82)}

  <rect width="${w}" height="${h}" fill="url(#arVig)"/>
  ${seal(w - 110, h - 110, 60, r)}
</svg>`;
}

function interactiveHero(w = 1600, h = 900) {
  const r = makeRng(1555);
  const cx = w * 0.5, cy = h * 0.52;
  const R = h * 0.20;

  // 背景壮锦菱形网格（若隐若现，不抢主体）
  let grid = '';
  const step = 150;
  for (let gy = 0; gy * step < h + step; gy++) {
    for (let gx = 0; gx * step < w + step; gx++) {
      const x = gx * step + (gy % 2 ? step / 2 : 0);
      const y = gy * step;
      grid += `<path d="M${x},${y - 46} L${x + 46},${y} L${x},${y + 46} L${x - 46},${y} Z"
        fill="none" stroke="${P.inkLight}" stroke-width="1.6" opacity="0.16"/>`;
    }
  }

  // 绣球主体
  const cols = [P.silkRed, P.silkRose, P.silkGold, '#8E2B22', '#C9767E', '#B0842A'];
  let petals = '';
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 * Math.PI) / 180;
    const a1 = ((i + 1) * 30 * Math.PI) / 180;
    const am = (a0 + a1) / 2;
    const f = (n) => n.toFixed(1);
    petals += `<path d="M0,0 L${f(Math.cos(a0) * R)},${f(Math.sin(a0) * R)}
      Q${f(Math.cos(am) * R * 1.13)},${f(Math.sin(am) * R * 1.13)} ${f(Math.cos(a1) * R)},${f(Math.sin(a1) * R)} Z"
      fill="${cols[i % 6]}" opacity="0.95"/>`;
    petals += `<line x1="0" y1="0" x2="${f(Math.cos(a0) * R)}" y2="${f(Math.sin(a0) * R)}" stroke="${P.gamboge}" stroke-width="1.6" opacity="0.5"/>`;
  }
  let rays = '';
  for (let i = 0; i < 32; i++) {
    const a = (i * 11.25 * Math.PI) / 180;
    rays += `<line x1="${(Math.cos(a) * R * 1.20).toFixed(0)}" y1="${(Math.sin(a) * R * 1.20).toFixed(0)}"
      x2="${(Math.cos(a) * (R * (1.34 + (i % 3) * 0.10))).toFixed(0)}" y2="${(Math.sin(a) * (R * (1.34 + (i % 3) * 0.10))).toFixed(0)}"
      stroke="${P.gamboge}" stroke-width="2.6" opacity="0.34"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="inVig" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${P.paper}" stop-opacity="0"/>
      <stop offset="62%" stop-color="${P.paper}" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="${P.paper}" stop-opacity="0.97"/>
    </radialGradient>
    <radialGradient id="inSilk" cx="36%" cy="30%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.42"/>
      <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.34"/>
    </radialGradient>
  </defs>
  ${paper(w, h, 1555)}
  <g>${grid}</g>

  <g transform="translate(${cx} ${cy})">
    ${rays}
    <circle cx="10" cy="14" r="${R * 1.02}" fill="#000" opacity="0.13"/>
    <g>${petals}</g>
    <circle r="${R * 1.02}" fill="url(#inSilk)"/>
    <circle r="${R * 1.02}" fill="none" stroke="#7A1E16" stroke-width="2" opacity="0.5"/>
    <circle r="${R * 0.17}" fill="${P.gamboge}"/>
    <circle r="${R * 0.095}" fill="${P.silkRed}" opacity="0.6"/>
  </g>

  <rect width="${w}" height="${h}" fill="url(#inVig)"/>
</svg>`;
}

/* ── 写出 ───────────────────────────────────────────────── */
function write(rel, content) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log(`  ✓ ${rel}  (${(content.length / 1024).toFixed(1)} KB)`);
}

console.log('生成文化主视觉 v2…\n英雄图：');
write('hero/guangxi.svg', guangxiHero());
write('hero/guilin.svg', guilinInk());
write('hero/exchange.svg', exchangeHero());
write('hero/archive.svg', archiveHero());
write('hero/interactive.svg', interactiveHero());

console.log('\n文化元素图：');
write('culture/guilin-landscape.svg', guilinInk());
write('culture/huashan-rock-art.svg', huashan());
write('culture/bronze-drum.svg', bronzeDrum());
write('culture/zhuangjin-diamond.svg', zhuangjin('diamond'));
write('culture/zhuangjin-fret.svg', zhuangjin('fret'));
write('culture/zhuangjin-wave.svg', zhuangjin('wave'));
write('culture/stilt-house.svg', stiltHouse());
write('culture/embroidery-ball.svg', embroideryBall());

console.log('\n✅ 完成');
