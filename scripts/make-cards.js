/**
 * 图版卡生成（照片缺失或不可靠时的替代方案）
 * Generate designed placeholder cards
 *
 * 【为什么需要这个】
 * 抓取实景照片时发现：部分文化题材在 Wikimedia Commons 上找不到可靠对应的照片，
 * 自动抓取会抓到语义不符的图（如「龙脊梯田」抓到村寨屋顶、「干栏式建筑」抓到人物）。
 * 经判断，**放一张错误的照片比不放照片更糟** —— 那是事实性错误，
 * 对文化展陈尤其不可接受。
 *
 * 因此对这些题材改用「图版卡」：品牌色底 + 该题材的矢量图形 + 纹样装饰。
 * 这是博物馆常用的图版处理方式，视觉统一、不误导观众，
 * 且日后拿到可靠照片可直接替换同名文件。
 *
 * 运行：node scripts/make-cards.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const L = require('./art-lib');
const { makeRng, P, speckle } = L;

const OUT = path.join(__dirname, '..', 'public', 'images', 'culture');
const HERO = path.join(__dirname, '..', 'public', 'images', 'hero');

/* ── 各题材的矢量图形（简洁、可辨识、不做伪写实） ───────────── */

/** 铜鼓：俯视，同心弦纹 + 太阳芒纹 + 鼓面蛙饰 */
function motifDrum(cx, cy, R, ink, accent) {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r0 = R * 0.20, r1 = R * 0.36;
    rays += `<path d="M${(cx + Math.cos(a - 0.06) * r0).toFixed(1)},${(cy + Math.sin(a - 0.06) * r0).toFixed(1)}
      L${(cx + Math.cos(a) * r1).toFixed(1)},${(cy + Math.sin(a) * r1).toFixed(1)}
      L${(cx + Math.cos(a + 0.06) * r0).toFixed(1)},${(cy + Math.sin(a + 0.06) * r0).toFixed(1)} Z" fill="${accent}"/>`;
  }
  let fret = '';
  for (let i = 0; i < 40; i++) {
    const a = (i * 9 * Math.PI) / 180;
    const w = R * 0.08;
    fret += `<g transform="translate(${(cx + Math.cos(a) * R * 0.80).toFixed(1)} ${(cy + Math.sin(a) * R * 0.80).toFixed(1)}) rotate(${(a * 180 / Math.PI).toFixed(1)})">
      <path d="M${-w/2},${w/2} L${-w/2},${-w/2} L${w/2},${-w/2} L${w/2},${w/2} L${-w/6},${w/2} L${-w/6},${-w/6} L${w/6},${-w/6}"
        fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.55"/></g>`;
  }
  // 鼓面蛙饰（铜鼓标志性特征）
  const frog = (fx, fy, s) => `<g transform="translate(${fx} ${fy}) scale(${s})" fill="${ink}" opacity="0.8">
    <path d="M-9,2 q9,-7 18,0 q-9,5 -18,0 Z"/>
    <circle cx="-5" cy="-3" r="2.6"/><circle cx="4" cy="-3" r="2.6"/>
    <path d="M-7,2 l-4,4 M7,2 l4,4"/></g>`;

  return `
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${ink}" stroke-width="3.4" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.90}" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.62}" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.40}" fill="none" stroke="${ink}" stroke-width="1.6" opacity="0.6"/>
    ${fret}
    ${rays}
    <circle cx="${cx}" cy="${cy}" r="${R * 0.15}" fill="${accent}"/>
    ${frog(cx - R * 0.44, cy + R * 0.30, R / 34)}
    ${frog(cx + R * 0.30, cy + R * 0.46, R / 34)}
    ${frog(cx + R * 0.02, cy - R * 0.50, R / 34)}
    ${frog(cx - R * 0.50, cy - R * 0.22, R / 34)}`;
}

/** 梯田：层叠梯级（横向田埂 + 竖向挡墙，模拟俯视梯田） */
function motifTerrace(cx, cy, R, ink, accent) {
  let s = '';
  const rows = 9;
  const topY = cy - R * 0.78;
  const botY = cy + R * 0.78;
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const y = topY + (botY - topY) * t;
    // 越靠下越宽（近大远小）
    const w = R * (0.65 + 1.05 * t);
    const seg = 5;
    const stepW = w / seg;
    let d = `M${(cx - w / 2).toFixed(1)},${y.toFixed(1)}`;
    for (let k = 0; k < seg; k++) {
      const bow = (k % 2 ? 1 : -1) * (3 + i * 1.4);
      d += ` q${(stepW / 2).toFixed(1)},${bow.toFixed(1)} ${stepW.toFixed(1)},0`;
    }
    // 田埂（横线）
    s += `<path d="${d}" fill="none" stroke="${i % 2 === 0 ? accent : ink}"
      stroke-width="${i % 2 === 0 ? 3.2 : 1.8}" opacity="${i % 2 === 0 ? 0.9 : 0.55}"/>`;
    // 梯级挡墙（竖短线，连接上下两级）
    if (i < rows - 1) {
      const y2 = topY + (botY - topY) * ((i + 1) / (rows - 1));
      const w2 = R * (0.65 + 1.05 * ((i + 1) / (rows - 1)));
      const n = 4 + i;
      for (let k = 0; k <= n; k++) {
        const x1 = cx - w / 2 + (w * k) / n;
        const x2 = cx - w2 / 2 + (w2 * k) / n;
        s += `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
          stroke="${ink}" stroke-width="1.1" opacity="0.30"/>`;
      }
    }
  }
  return s;
}

/** 干栏式建筑：架空立柱 + 翘角屋顶 */
function motifStilt(cx, cy, R, ink, accent) {
  const w = R * 1.5, h = R * 0.9;
  const left = cx - w / 2, right = cx + w / 2;
  const eaveY = cy + h * 0.10;
  const ridgeY = cy - h * 0.55;
  const floorY = cy + h * 0.34;
  const groundY = cy + h * 0.78;
  return `
    <!-- 立柱 -->
    <g stroke="${ink}" stroke-width="${R * 0.045}" stroke-linecap="round" opacity="0.85">
      <line x1="${left + w*0.16}" y1="${floorY}" x2="${left + w*0.16}" y2="${groundY}"/>
      <line x1="${left + w*0.40}" y1="${floorY}" x2="${left + w*0.40}" y2="${groundY}"/>
      <line x1="${left + w*0.60}" y1="${floorY}" x2="${left + w*0.60}" y2="${groundY}"/>
      <line x1="${left + w*0.84}" y1="${floorY}" x2="${left + w*0.84}" y2="${groundY}"/>
    </g>
    <!-- 楼板 -->
    <rect x="${left + w*0.08}" y="${floorY - R*0.05}" width="${w*0.84}" height="${R*0.055}" fill="${ink}" opacity="0.85"/>
    <!-- 墙体 -->
    <rect x="${left + w*0.14}" y="${ridgeY + h*0.62}" width="${w*0.72}" height="${floorY - ridgeY - h*0.62 - R*0.05}"
      fill="none" stroke="${ink}" stroke-width="${R*0.045}"/>
    <!-- 窗 -->
    <rect x="${left + w*0.28}" y="${ridgeY + h*0.78}" width="${w*0.16}" height="${h*0.16}" fill="${ink}" opacity="0.7"/>
    <rect x="${left + w*0.58}" y="${ridgeY + h*0.78}" width="${w*0.16}" height="${h*0.16}" fill="${ink}" opacity="0.7"/>
    <!-- 屋顶（出檐 + 两角起翘） -->
    <path d="M${left},${eaveY} L${left + w*0.26},${ridgeY} L${right - w*0.26},${ridgeY} L${right},${eaveY}"
      fill="none" stroke="${accent}" stroke-width="${R*0.075}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M${left},${eaveY} q${-w*0.06},${-h*0.06} ${-w*0.10},${-h*0.20}"
      fill="none" stroke="${accent}" stroke-width="${R*0.06}" stroke-linecap="round"/>
    <path d="M${right},${eaveY} q${w*0.06},${-h*0.06} ${w*0.10},${-h*0.20}"
      fill="none" stroke="${accent}" stroke-width="${R*0.06}" stroke-linecap="round"/>
    <path d="M${left + w*0.26},${ridgeY} L${right - w*0.26},${ridgeY}"
      stroke="${accent}" stroke-width="${R*0.075}" stroke-linecap="round"/>
    <!-- 地面 -->
    <path d="M${cx - R*1.2},${groundY} q${R*1.2},${R*0.06} ${R*2.4},0" fill="none" stroke="${ink}" stroke-width="${R*0.04}" opacity="0.5"/>`;
}

/** 绣球：十二瓣 + 流苏 */
function motifBall(cx, cy, R, ink, accent) {
  const cols = ['#B02A22', '#D2564A', '#C9A227', '#8E2B22', '#C9767E', '#B0842A',
                '#B02A22', '#D2564A', '#C9A227', '#8E2B22', '#C9767E', '#B0842A'];
  let p = '';
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 * Math.PI) / 180, a1 = ((i + 1) * 30 * Math.PI) / 180;
    const am = (a0 + a1) / 2;
    const f = (n) => n.toFixed(1);
    p += `<path d="M${f(cx)},${f(cy)} L${f(cx + Math.cos(a0) * R)},${f(cy + Math.sin(a0) * R)}
      Q${f(cx + Math.cos(am) * R * 1.13)},${f(cy + Math.sin(am) * R * 1.13)}
       ${f(cx + Math.cos(a1) * R)},${f(cy + Math.sin(a1) * R)} Z"
      fill="${cols[i]}" opacity="0.94"/>`;
    p += `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx + Math.cos(a0) * R)}" y2="${f(cy + Math.sin(a0) * R)}"
      stroke="${accent}" stroke-width="1.4" opacity="0.5"/>`;
  }
  return `${p}
    <circle cx="${cx}" cy="${cy}" r="${R * 1.02}" fill="none" stroke="${ink}" stroke-width="${R*0.05}" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.17}" fill="${accent}"/>
    <g transform="translate(${cx} ${cy + R * 1.0})" stroke="${accent}" stroke-width="${R*0.05}" stroke-linecap="round">
      <path d="M0,0 q${-R*0.10},${R*0.24} ${-R*0.02},${R*0.42}" fill="none"/>
      <path d="M0,0 q${R*0.11},${R*0.22} ${R*0.03},${R*0.40}" fill="none"/>
      ${Array.from({ length: 9 }, (_, i) => {
        const x = -R * 0.11 + i * (R * 0.026);
        return `<line x1="${x.toFixed(1)}" y1="${(R*0.40).toFixed(1)}" x2="${(x + (i - 4) * 1.6).toFixed(1)}" y2="${(R*0.62 + ((i*7)%9)).toFixed(1)}" stroke-width="${R*0.018}" opacity="0.8"/>`;
      }).join('')}
    </g>`;
}

/** 壮锦纹样：菱形骨架 + 回纹 + 波浪（三种） */
function motifPattern(kind, size, ink, accent, bg) {
  const r = makeRng(kind === 'diamond' ? 11 : kind === 'fret' ? 22 : 33);
  let m = '';
  if (kind === 'diamond') {
    const step = size / 4;
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 4; gx++) {
      const cx = gx * step + step / 2, cy = gy * step + step / 2, d = step * 0.40;
      const jit = (r() - 0.5) * 3;
      m += `<path d="M${cx},${cy - d} L${cx + d},${cy} L${cx},${cy + d} L${cx - d},${cy} Z" fill="none" stroke="${accent}" stroke-width="3.4" opacity="0.92" transform="rotate(${jit.toFixed(1)} ${cx} ${cy})"/>`;
      m += `<path d="M${cx},${cy - d*0.52} L${cx + d*0.52},${cy} L${cx},${cy + d*0.52} L${cx - d*0.52},${cy} Z" fill="${accent}" opacity="0.72"/>`;
      m += `<circle cx="${cx}" cy="${cy}" r="${d*0.13}" fill="${bg}"/>`;
      for (const [ox, oy] of [[-1,-1],[1,-1],[-1,1],[1,1]])
        m += `<path d="M${cx+ox*step*0.42},${cy+oy*step*0.42} l${ox*12},0 l0,${oy*12}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>`;
    }
  } else if (kind === 'fret') {
    const step = size / 8;
    for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 8; gx++) {
      const x = gx * step + step * 0.12, y = gy * step + step * 0.12, s = step * 0.76;
      const flip = (gx + gy) % 2 === 0 ? 1 : -1;
      m += `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M0,${s} L0,0 L${s},0 L${s},${s} L${s*0.3},${s} L${s*0.3},${s*0.3} L${s*0.7},${s*0.3} L${s*0.7},${s*0.7}" fill="none" stroke="${accent}" stroke-width="2.6" opacity="0.82" stroke-linecap="square"/></g>`;
    }
  } else {
    for (let band = 0; band < 9; band++) {
      const y = (band + 0.5) * (size / 9);
      const amp = 11 + r() * 5;
      let d = `M0,${y}`;
      for (let x = 0; x <= size; x += size / 9) d += ` q${(size/18).toFixed(0)},${(-amp).toFixed(0)} ${(size/9).toFixed(0)},0`;
      m += `<path d="${d}" fill="none" stroke="${accent}" stroke-width="${band % 2 ? 2.2 : 3.4}" opacity="0.8"/>`;
      for (let x = size / 18; x < size; x += size / 9)
        m += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3.4" fill="${accent}" opacity="0.6"/>`;
    }
  }
  return m;
}

/* ── 图版卡组装 ─────────────────────────────────────────────── */
function card({ size = 900, bg, ink, accent, motif, label, seed = 7 }) {
  const r = makeRng(seed);
  const cx = size / 2, cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.10"/>
      <stop offset="52%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.20"/>
    </linearGradient>
  </defs>

  <rect width="${size}" height="${size}" fill="${bg}"/>
  <!-- 织物经纬／材质底纹 -->
  <g opacity="0.5">
    ${(() => {
      let w = '';
      const n = 48;
      for (let i = 0; i < n; i++) {
        w += `<line x1="${((i*size)/n).toFixed(1)}" y1="0" x2="${((i*size)/n).toFixed(1)}" y2="${size}" stroke="#FFFFFF" stroke-width="1" opacity="0.05"/>`;
        w += `<line x1="0" y1="${((i*size)/n).toFixed(1)}" x2="${size}" y2="${((i*size)/n).toFixed(1)}" stroke="#000000" stroke-width="1" opacity="0.07"/>`;
      }
      return w;
    })()}
  </g>

  <!-- 四角回纹装饰 -->
  <g fill="none" stroke="${accent}" stroke-width="2" opacity="0.35">
    ${[[1,1],[1,-1],[-1,1],[-1,-1]].map(([sx, sy]) => {
      const x = sx > 0 ? 44 : size - 44, y = sy > 0 ? 44 : size - 44;
      return `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">
        <path d="M0,26 L0,0 L26,0" /><path d="M8,20 L8,8 L20,8"/></g>`;
    }).join('')}
  </g>

  ${motif(cx, cy, size * 0.30, ink, accent)}

  <!-- 题材名 -->
  <text x="${cx}" y="${size - 96}" text-anchor="middle"
    font-family="'Songti SC','SimSun',serif" font-size="52" font-weight="700"
    fill="${ink}" letter-spacing="6">${label}</text>
  <line x1="${cx - 70}" y1="${size - 68}" x2="${cx + 70}" y2="${size - 68}"
    stroke="${accent}" stroke-width="2.5" opacity="0.7"/>

  <!-- 纸面颗粒 -->
  <g opacity="0.5">${speckle(r, size, size, 900, '#000000', 1.6, 0.09)}</g>
  <rect width="${size}" height="${size}" fill="url(#sheen)"/>
</svg>`;
}

/* ── 输出 ─────────────────────────────────────────────────── */
const CARDS = [
  { key: 'bronze-drum', label: '铜鼓', motif: motifDrum,
    bg: '#3A3126', ink: '#D8BE84', accent: '#C9A227', seed: 3 },
  { key: 'rice-terraces', label: '龙脊梯田', motif: motifTerrace,
    bg: '#2C3A2E', ink: '#CFE0C0', accent: '#C9A227', seed: 5 },
  { key: 'stilt-house', label: '干栏式建筑', motif: motifStilt,
    bg: '#3B3228', ink: '#E0CFAE', accent: '#C9764A', seed: 8 },
  { key: 'embroidery-ball', label: '绣球', motif: motifBall,
    bg: '#F2EADA', ink: '#8E2B22', accent: '#C9A227', seed: 11 },
  { key: 'zhuangjin-diamond', label: '壮锦 · 菱形纹', motif: (cx, cy, R, ink, acc) => motifPattern('diamond', 900, ink, acc, '#8E2B22'),
    bg: '#8E2B22', ink: '#F2E0B0', accent: '#E8C86A', seed: 13, pattern: true },
  { key: 'zhuangjin-fret', label: '壮锦 · 回纹', motif: (cx, cy, R, ink, acc) => motifPattern('fret', 900, ink, acc, '#22303F'),
    bg: '#22303F', ink: '#D8BC78', accent: '#D8BC78', seed: 17, pattern: true },
  { key: 'zhuangjin-wave', label: '壮锦 · 波浪纹', motif: (cx, cy, R, ink, acc) => motifPattern('wave', 900, ink, acc, '#1F3A33'),
    bg: '#1F3A33', ink: '#CFE0C8', accent: '#CFE0C8', seed: 19, pattern: true },
];

(async () => {
  console.log('生成图版卡：\n');
  for (const c of CARDS) {
    const svg = c.pattern
      // 纹样卡：图案铺满 + 底部标签条
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">
  <rect width="900" height="900" fill="${c.bg}"/>
  ${c.motif(450, 450, 300, c.ink, c.accent)}
  <rect x="0" y="792" width="900" height="108" fill="${c.bg}" opacity="0.94"/>
  <rect x="0" y="792" width="900" height="3" fill="${c.accent}" opacity="0.8"/>
  <text x="450" y="866" text-anchor="middle" font-family="'Songti SC','SimSun',serif"
    font-size="46" font-weight="700" fill="${c.ink}" letter-spacing="4">${c.label}</text>
</svg>`
      : card({ bg: c.bg, ink: c.ink, accent: c.accent, motif: c.motif, label: c.label, seed: c.seed });

    await sharp(Buffer.from(svg)).resize(900, 900).jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT, `${c.key}.jpg`));
    await sharp(Buffer.from(svg)).resize(400, 400).jpeg({ quality: 78, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT, `${c.key}-thumb.jpg`));
    console.log(`  ✓ ${c.key}.jpg   「${c.label}」`);
  }
  console.log(`\n✅ 图版卡 ${CARDS.length} 张`);
})();
