/**
 * 文化图片资源生成器
 * Cultural Image Asset Generator
 *
 * 生成广西-东盟文化展所需的全部图片素材（SVG 矢量图，可无损缩放）。
 * 运行：node scripts/generate-images.js
 *
 * 设计说明：
 * - 全部为手绘 SVG 矢量图形，非 AI 生成图，无外部依赖
 * - 采用壮锦配色体系（红 #D73C2C / 蓝 #1E5BA8 / 黑 #1A1A1A / 金 #D4AF37）
 * - 输出到 public/images/{hero,culture,icons}/
 */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'images');

const C = {
  red: '#D73C2C',
  blue: '#1E5BA8',
  black: '#1A1A1A',
  gold: '#D4AF37',
  green: '#2E8B57',
  ink: '#2B2B2B',
  paper: '#F5F1E8',
  cyan: '#7FCDCD',
};

const files = {};

/* ============================================================
   1. 壮锦几何纹样（菱形 / 回纹 / 波浪纹）
   ============================================================ */
function zhuangjinDiamond(w = 400, h = 400) {
  let s = '';
  // 菱形网格
  for (let y = 0; y < h + 60; y += 60) {
    for (let x = 0; x < w + 60; x += 60) {
      const cx = x + (Math.floor(y / 60) % 2 ? 30 : 0);
      s += `<path d="M${cx} ${y - 26} L${cx + 26} ${y} L${cx} ${y + 26} L${cx - 26} ${y} Z"
             fill="none" stroke="${C.gold}" stroke-width="2.5" opacity="0.9"/>`;
      s += `<path d="M${cx} ${y - 13} L${cx + 13} ${y} L${cx} ${y + 13} L${cx - 13} ${y} Z"
             fill="${C.red}" opacity="0.75"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${C.black}"/>
  ${s}
</svg>`;
}

function zhuangjinWave(w = 400, h = 400) {
  let s = '';
  for (let band = 0; band < 8; band++) {
    const y0 = band * 50 + 25;
    let d = `M0 ${y0}`;
    for (let x = 0; x <= w; x += 50) {
      d += ` q25 -22 50 0`;
    }
    s += `<path d="${d}" fill="none" stroke="${band % 2 ? C.cyan : C.gold}"
           stroke-width="${band % 2 ? 3 : 2}" opacity="0.85"/>`;
  }
  // 波浪之间的圆点
  for (let y = 25; y < h; y += 50) {
    for (let x = 25; x < w; x += 50) {
      s += `<circle cx="${x}" cy="${y}" r="4" fill="${C.green}" opacity="0.8"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${C.blue}"/>
  ${s}
</svg>`;
}

function zhuangjinFret(w = 400, h = 400) {
  // 回纹（雷纹）方形螺旋
  const unit = (x, y, size, color) => {
    const s = size;
    return `<path d="M${x} ${y + s} L${x} ${y} L${x + s} ${y} L${x + s} ${y + s} L${x + s * 0.3} ${y + s} L${x + s * 0.3} ${y + s * 0.3} L${x + s * 0.7} ${y + s * 0.3} L${x + s * 0.7} ${y + s * 0.7}"
             fill="none" stroke="${color}" stroke-width="3" stroke-linecap="square"/>`;
  };
  let s = '';
  for (let y = 20; y < h; y += 110) {
    for (let x = 20; x < w; x += 110) {
      s += unit(x, y, 70, (x / 110 + y / 110) % 2 ? C.gold : C.red);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${C.black}"/>
  ${s}
</svg>`;
}

/* ============================================================
   2. 铜鼓（俯视）纹样
   ============================================================ */
function bronzeDrum(size = 500) {
  const c = size / 2;
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * 360) / 16;
    rays += `<path d="M${c} ${c} L${c + Math.cos((a * Math.PI) / 180) * c * 0.28} ${c + Math.sin((a * Math.PI) / 180) * c * 0.28}"
              stroke="${C.gold}" stroke-width="4" transform="rotate(${a} ${c} ${c})"/>`;
  }
  let dots = '';
  for (let ring = 0; ring < 2; ring++) {
    const r = c * (0.55 + ring * 0.16);
    const n = 12 + ring * 8;
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n + ring * 0.2;
      dots += `<circle cx="${c + Math.cos(a) * r}" cy="${c + Math.sin(a) * r}" r="${4 - ring}" fill="${C.gold}" opacity="0.9"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${c}" cy="${c}" r="${c - 4}" fill="#3D2F1F"/>
  <circle cx="${c}" cy="${c}" r="${c - 4}" fill="none" stroke="${C.gold}" stroke-width="5"/>
  <circle cx="${c}" cy="${c}" r="${c * 0.82}" fill="none" stroke="${C.gold}" stroke-width="3" opacity="0.8"/>
  <circle cx="${c}" cy="${c}" r="${c * 0.42}" fill="none" stroke="${C.gold}" stroke-width="3" opacity="0.8"/>
  <circle cx="${c}" cy="${c}" r="${c * 0.28}" fill="${C.gold}" opacity="0.25"/>
  ${rays}
  ${dots}
  <circle cx="${c}" cy="${c}" r="${c * 0.12}" fill="${C.gold}"/>
</svg>`;
}

/* ============================================================
   3. 花山岩画（蛙形人 + 日芒纹）
   ============================================================ */
function huashanRockArt(w = 700, h = 420) {
  // 蛙形人：蹲踞姿态，双臂上举
  const frogMan = (x, y, scale, color) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}">
    <circle cx="0" cy="-46" r="11"/>
    <path d="M-13 -33 L13 -33 L16 -4 L-16 -4 Z"/>
    <path d="M-16 -30 L-42 -52 L-36 -60 L-14 -42 Z"/>
    <path d="M16 -30 L42 -52 L36 -60 L14 -42 Z"/>
    <path d="M-15 -4 L-32 30 L-20 34 L-4 2 Z"/>
    <path d="M15 -4 L32 30 L20 34 L4 2 Z"/>
  </g>`;

  const sun = (x, y, r) => {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * 360) / 12;
      rays += `<line x1="${x}" y1="${y}" x2="${x + Math.cos((a * Math.PI) / 180) * r * 1.7}" y2="${y + Math.sin((a * Math.PI) / 180) * r * 1.7}" stroke="${C.red}" stroke-width="4"/>`;
    }
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.red}" stroke-width="5"/>${rays}`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#C9BFA8"/>
  <rect width="${w}" height="${h}" fill="url(#rockGrad)" opacity="0.5"/>
  <defs>
    <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8DFC8"/>
      <stop offset="100%" stop-color="#A89878"/>
    </linearGradient>
  </defs>
  ${sun(120, 90, 34)}
  ${frogMan(300, 260, 1.6, C.red)}
  ${frogMan(430, 280, 1.2, C.red)}
  ${frogMan(540, 250, 1.5, C.red)}
  ${frogMan(200, 300, 1.0, C.red)}
  ${frogMan(620, 320, 0.9, C.red)}
</svg>`;
}

/* ============================================================
   4. 干栏式建筑（吊脚楼）
   ============================================================ */
function stiltHouse(w = 520, h = 420) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#BFD9E8"/>
      <stop offset="100%" stop-color="#E8E2D0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <!-- 远山 -->
  <path d="M0 250 L90 170 L170 230 L260 150 L350 220 L440 165 L520 240 L520 420 L0 420 Z" fill="#8FA88F" opacity="0.5"/>
  <!-- 支柱 -->
  <g stroke="#6B4A2F" stroke-width="9" stroke-linecap="round">
    <line x1="120" y1="300" x2="120" y2="400"/>
    <line x1="200" y1="300" x2="200" y2="400"/>
    <line x1="300" y1="300" x2="300" y2="400"/>
    <line x1="380" y1="300" x2="380" y2="400"/>
  </g>
  <!-- 楼板 -->
  <rect x="90" y="285" width="330" height="18" fill="#8B5E3C"/>
  <!-- 墙体 -->
  <rect x="110" y="200" width="290" height="85" fill="#D9C7A8"/>
  <rect x="110" y="200" width="290" height="85" fill="none" stroke="#7A5A3A" stroke-width="3"/>
  <!-- 窗 -->
  <rect x="175" y="225" width="55" height="42" fill="#5A4A38"/>
  <rect x="280" y="225" width="55" height="42" fill="#5A4A38"/>
  <line x1="202" y1="225" x2="202" y2="267" stroke="#D9C7A8" stroke-width="3"/>
  <line x1="307" y1="225" x2="307" y2="267" stroke="#D9C7A8" stroke-width="3"/>
  <!-- 翘角屋顶 -->
  <path d="M70 200 Q255 120 440 200 L410 200 Q255 145 100 200 Z" fill="#4A3A2A"/>
  <path d="M60 205 Q255 128 450 205 Q255 145 60 205 Z" fill="#5C4834"/>
  <path d="M62 202 Q255 132 448 202" fill="none" stroke="#3A2C1E" stroke-width="4"/>
  <!-- 屋檐翘角 -->
  <path d="M60 205 Q44 196 34 180" fill="none" stroke="#4A3A2A" stroke-width="6" stroke-linecap="round"/>
  <path d="M450 205 Q466 196 476 180" fill="none" stroke="#4A3A2A" stroke-width="6" stroke-linecap="round"/>
  <!-- 楼梯 -->
  <g stroke="#8B5E3C" stroke-width="6">
    <line x1="400" y1="300" x2="450" y2="395"/>
    <line x1="430" y1="300" x2="480" y2="395"/>
  </g>
  <g stroke="#8B5E3C" stroke-width="4">
    <line x1="404" y1="318" x2="434" y2="318"/>
    <line x1="411" y1="340" x2="441" y2="340"/>
    <line x1="418" y1="362" x2="448" y2="362"/>
    <line x1="425" y1="384" x2="455" y2="384"/>
  </g>
  <!-- 地面 -->
  <rect x="0" y="400" width="${w}" height="20" fill="#7A8B6A"/>
</svg>`;
}

/* ============================================================
   5. 绣球（三月三）
   ============================================================ */
function embroideryBall(size = 320) {
  const c = size / 2;
  const r = c * 0.62;
  // 12 片花瓣式球面
  let petals = '';
  const colors = [C.red, '#F2A0B5', C.gold, C.green, '#6FB3E0', '#E86FA0'];
  for (let i = 0; i < 12; i++) {
    const a0 = (i * 30 * Math.PI) / 180;
    const a1 = ((i + 1) * 30 * Math.PI) / 180;
    const am = (a0 + a1) / 2;
    petals += `<path d="M${c} ${c}
      L${c + Math.cos(a0) * r} ${c + Math.sin(a0) * r}
      Q${c + Math.cos(am) * r * 1.18} ${c + Math.sin(am) * r * 1.18} ${c + Math.cos(a1) * r} ${c + Math.sin(a1) * r} Z"
      fill="${colors[i % colors.length]}" stroke="#8B1A1A" stroke-width="1.5" opacity="0.95"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${c}" cy="${c}" r="${r}" fill="#B01E1E"/>
  ${petals}
  <circle cx="${c}" cy="${c}" r="${r * 0.16}" fill="${C.gold}" stroke="#8B1A1A" stroke-width="2"/>
  <!-- 飘带 -->
  <path d="M${c} ${c + r} q-20 40 -6 74" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>
  <path d="M${c} ${c + r} q22 38 10 70" fill="none" stroke="#F2A0B5" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}

/* ============================================================
   6. 桂林山水（水墨风）
   ============================================================ */
function guilinLandscape(w = 900, h = 480) {
  // 喀斯特峰林：圆润的山峰轮廓
  const peak = (x, baseY, pw, ph, color, op) =>
    `<path d="M${x - pw} ${baseY} Q${x - pw * 0.45} ${baseY - ph * 0.85} ${x} ${baseY - ph}
     Q${x + pw * 0.45} ${baseY - ph * 0.85} ${x + pw} ${baseY} Z" fill="${color}" opacity="${op}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F5EF"/>
      <stop offset="55%" stop-color="#E4E9E4"/>
      <stop offset="100%" stop-color="#CFD8D2"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#mist)"/>

  <!-- 远山（淡） -->
  <g filter="url(#soft)" opacity="0.35">
    ${peak(150, 330, 105, 165, '#8A9A96', 1)}
    ${peak(360, 330, 130, 205, '#7E8F8B', 1)}
    ${peak(600, 330, 110, 175, '#8A9A96', 1)}
    ${peak(800, 330, 95, 145, '#95A5A1', 1)}
  </g>

  <!-- 中山 -->
  <g opacity="0.55">
    ${peak(80, 350, 90, 130, '#6E7F7B', 1)}
    ${peak(255, 350, 115, 175, '#61726E', 1)}
    ${peak(470, 350, 100, 150, '#6E7F7B', 1)}
    ${peak(690, 350, 125, 190, '#61726E', 1)}
    ${peak(870, 350, 85, 125, '#6E7F7B', 1)}
  </g>

  <!-- 近山（深） -->
  <g opacity="0.8">
    ${peak(170, 400, 75, 105, '#3F4E4B', 1)}
    ${peak(400, 400, 95, 135, '#374642', 1)}
    ${peak(620, 400, 80, 110, '#3F4E4B', 1)}
    ${peak(810, 400, 70, 95, '#374642', 1)}
  </g>

  <!-- 江面 -->
  <rect x="0" y="400" width="${w}" height="80" fill="#DDE6E4" opacity="0.9"/>
  <g opacity="0.35" stroke="#8FA8A4" stroke-width="2" fill="none">
    <path d="M40 418 q60 -6 120 0 t120 0"/>
    <path d="M180 440 q60 -6 120 0 t120 0"/>
    <path d="M420 428 q60 -6 120 0 t120 0"/>
    <path d="M620 452 q60 -6 120 0 t120 0"/>
  </g>

  <!-- 倒影 -->
  <g opacity="0.16" transform="translate(0 800) scale(1 -1)">
    ${peak(170, 400, 75, 105, '#3F4E4B', 1)}
    ${peak(400, 400, 95, 135, '#374642', 1)}
    ${peak(620, 400, 80, 110, '#3F4E4B', 1)}
  </g>

  <!-- 竹筏 -->
  <g transform="translate(560 425)">
    <rect x="0" y="0" width="76" height="9" rx="4" fill="#8B6B3E"/>
    <line x1="38" y1="0" x2="38" y2="-42" stroke="#6B4A2F" stroke-width="3"/>
    <circle cx="38" cy="-46" r="6" fill="#3F4E4B"/>
  </g>
</svg>`;
}

/* ============================================================
   7. 东盟各国文化图标（简化建筑剪影）
   ============================================================ */
function aseanIcons(size = 300) {
  const s = size;
  const icons = {
    thailand: `<path d="M150 60 L150 240" stroke="${C.gold}" stroke-width="6"/>
      <path d="M150 60 L120 110 L150 100 L180 110 Z" fill="${C.gold}"/>
      <path d="M150 95 L112 150 L150 138 L188 150 Z" fill="#E8C55A"/>
      <path d="M150 133 L104 195 L150 180 L196 195 Z" fill="${C.gold}"/>
      <rect x="110" y="195" width="80" height="45" fill="#C9A63F"/>`,
    vietnam: `<path d="M96 240 Q96 150 150 100 Q204 150 204 240 Z" fill="#D9C7A8"/>
      <path d="M150 100 L150 240" stroke="#8B5E3C" stroke-width="2" opacity="0.5"/>
      <path d="M96 240 L204 240" stroke="#8B5E3C" stroke-width="4"/>
      <circle cx="150" cy="152" r="14" fill="${C.red}"/>`,
    indonesia: `<path d="M150 70 L108 120 L192 120 Z" fill="#8B6B3E"/>
      <path d="M108 120 L96 168 L204 168 L192 120 Z" fill="#A8823F"/>
      <path d="M96 168 L84 216 L216 216 L204 168 Z" fill="#8B6B3E"/>
      <path d="M84 216 L150 240 L216 216 Z" fill="#6B5230"/>`,
    malaysia: `<rect x="118" y="70" width="26" height="170" fill="#4A6B8A"/>
      <rect x="156" y="70" width="26" height="170" fill="#4A6B8A"/>
      <rect x="140" y="130" width="20" height="30" fill="#2E4A63"/>
      <path d="M118 70 L131 46 L144 70 Z" fill="${C.gold}"/>
      <path d="M156 70 L169 46 L182 70 Z" fill="${C.gold}"/>`,
    singapore: `<circle cx="150" cy="130" r="42" fill="none" stroke="#C9A63F" stroke-width="7"/>
      <path d="M150 88 L150 60 M136 66 L150 60 L164 66" stroke="#C9A63F" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M108 172 L192 172 L182 240 L118 240 Z" fill="#B8963A"/>`,
    philippines: `<path d="M104 240 Q104 130 150 96 Q196 130 196 240 Z" fill="#D9C7A8"/>
      <rect x="138" y="150" width="24" height="34" fill="#5A4A38"/>
      <path d="M104 240 L196 240" stroke="#8B5E3C" stroke-width="4"/>
      <circle cx="150" cy="118" r="9" fill="#C9A63F"/>`,
    cambodia: `<path d="M100 240 L200 240 L200 190 L150 150 L100 190 Z" fill="#8B6B3E"/>
      <path d="M118 190 L182 190 L182 150 L150 122 L118 150 Z" fill="#A8823F"/>
      <path d="M132 150 L168 150 L168 118 L150 96 L132 118 Z" fill="#8B6B3E"/>
      <path d="M150 96 L150 74 L160 82" stroke="${C.gold}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    laos: `<path d="M150 70 L128 120 L172 120 Z" fill="${C.gold}"/>
      <rect x="128" y="120" width="44" height="120" fill="#C9A63F"/>
      <path d="M150 100 L150 70" stroke="#8B6B3E" stroke-width="3"/>
      <rect x="118" y="200" width="64" height="40" fill="#A8823F"/>`,
    myanmar: `<path d="M150 60 L96 200 L204 200 Z" fill="${C.gold}"/>
      <path d="M150 60 L150 200" stroke="#B8963A" stroke-width="3"/>
      <rect x="96" y="200" width="108" height="40" fill="#C9A63F"/>
      <circle cx="150" cy="66" r="10" fill="#E8C55A"/>`,
    brunei: `<ellipse cx="150" cy="140" rx="56" ry="46" fill="#C9A63F"/>
      <path d="M94 140 Q150 96 206 140" fill="none" stroke="${C.gold}" stroke-width="5"/>
      <path d="M150 94 L150 64" stroke="${C.gold}" stroke-width="5"/>
      <circle cx="150" cy="58" r="8" fill="${C.gold}"/>
      <rect x="104" y="186" width="92" height="54" fill="#A8823F"/>`,
  };
  return Object.keys(icons).map((k) => ({
    name: k,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" fill="none"/>
  ${icons[k]}
</svg>`,
  }));
}

/* ============================================================
   8. 功能图标（替代 emoji 的线性图标）
   ============================================================ */
function uiIcons(size = 96) {
  const stroke = `fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  const defs = {
    // 展馆 / 博物馆
    museum: `<path d="M12 38 L48 14 L84 38" ${stroke}/><path d="M20 42 L20 76 M40 42 L40 76 M56 42 L56 76 M76 42 L76 76" ${stroke}/><path d="M10 80 L86 80" ${stroke}/>`,
    // 山水
    mountain: `<path d="M8 76 L34 34 L50 58 L62 42 L88 76 Z" ${stroke}/><circle cx="70" cy="24" r="8" ${stroke}/>`,
    // 地球 / 东盟
    globe: `<circle cx="48" cy="48" r="34" ${stroke}/><ellipse cx="48" cy="48" rx="15" ry="34" ${stroke}/><path d="M14 48 L82 48 M20 30 L76 30 M20 66 L76 66" ${stroke}/>`,
    // 握手 / 交流
    handshake: `<path d="M10 48 L28 32 L48 48 L68 32 L86 48 L68 68 L48 54 L28 68 Z" ${stroke}/>`,
    // 档案 / 书
    archive: `<rect x="16" y="20" width="64" height="56" rx="4" ${stroke}/><path d="M16 36 L80 36 M40 36 L40 76 M36 56 L44 56" ${stroke}/>`,
    // 游戏手柄
    gamepad: `<rect x="10" y="32" width="76" height="36" rx="16" ${stroke}/><path d="M30 44 L30 56 M24 50 L36 50" ${stroke}/><circle cx="62" cy="46" r="4" fill="currentColor" stroke="none"/><circle cx="72" cy="56" r="4" fill="currentColor" stroke="none"/>`,
    // 播放
    play: `<circle cx="48" cy="48" r="34" ${stroke}/><path d="M40 34 L64 48 L40 62 Z" fill="currentColor" stroke="none"/>`,
    // 搜索
    search: `<circle cx="42" cy="42" r="24" ${stroke}/><path d="M60 60 L80 80" ${stroke}/>`,
    // 分享
    share: `<circle cx="70" cy="24" r="11" ${stroke}/><circle cx="26" cy="48" r="11" ${stroke}/><circle cx="70" cy="72" r="11" ${stroke}/><path d="M36 42 L60 30 M36 54 L60 66" ${stroke}/>`,
    // 奖章
    medal: `<circle cx="48" cy="56" r="24" ${stroke}/><path d="M34 36 L26 12 L44 20 M62 36 L70 12 L52 20" ${stroke}/>`,
    // 相机
    camera: `<rect x="12" y="30" width="72" height="48" rx="8" ${stroke}/><circle cx="48" cy="54" r="15" ${stroke}/><path d="M36 30 L42 18 L54 18 L60 30" ${stroke}/>`,
    // 音乐
    music: `<path d="M38 70 L38 26 L74 18 L74 62" ${stroke}/><circle cx="28" cy="72" r="11" ${stroke}/><circle cx="64" cy="64" r="11" ${stroke}/>`,
    // 灯笼 / 节日
    lantern: `<ellipse cx="48" cy="48" rx="26" ry="30" ${stroke}/><path d="M48 12 L48 20 M48 76 L48 86 M36 86 L60 86" ${stroke}/><path d="M22 48 L74 48" ${stroke}/>`,
    // 鼓
    drum: `<ellipse cx="48" cy="30" rx="30" ry="12" ${stroke}/><path d="M18 30 L18 66 M78 30 L78 66" ${stroke}/><ellipse cx="48" cy="66" rx="30" ry="12" ${stroke}/>`,
  };
  return Object.keys(defs).map((k) => ({
    name: k,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${size}" height="${size}" color="#1A1A1A">${defs[k]}</svg>`,
  }));
}

/* ============================================================
   9. 首页 Hero 大图
   ============================================================ */
function heroGuangxi(w = 1600, h = 900) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E5BA8"/>
      <stop offset="45%" stop-color="#3A7BBF"/>
      <stop offset="100%" stop-color="#D73C2C"/>
    </linearGradient>
    <linearGradient id="heroMist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#heroSky)"/>

  <!-- 远峰 -->
  <g opacity="0.28" fill="#0F3A6B">
    <path d="M0 620 Q140 470 280 560 Q400 460 540 570 Q680 450 820 560 Q960 470 1100 570 Q1240 480 1380 575 Q1480 500 1600 590 L1600 900 L0 900 Z"/>
  </g>
  <!-- 中峰 -->
  <g opacity="0.45" fill="#0B2E56">
    <path d="M0 700 Q120 570 240 660 Q360 560 480 670 Q600 570 720 665 Q840 575 960 670 Q1080 585 1200 675 Q1320 590 1440 680 Q1520 620 1600 690 L1600 900 L0 900 Z"/>
  </g>
  <!-- 近峰 -->
  <g opacity="0.72" fill="#07203D">
    <path d="M0 790 Q100 690 200 760 Q320 670 440 770 Q560 680 680 775 Q800 690 920 780 Q1040 700 1160 785 Q1280 705 1400 790 Q1500 730 1600 795 L1600 900 L0 900 Z"/>
  </g>

  <!-- 雾气 -->
  <rect x="0" y="560" width="${w}" height="200" fill="url(#heroMist)"/>

  <!-- 江面 -->
  <rect x="0" y="800" width="${w}" height="100" fill="#0A1A2E" opacity="0.55"/>

  <!-- 壮锦纹样装饰带（顶部） -->
  <g opacity="0.5">
    ${Array.from({ length: 40 }, (_, i) =>
      `<path d="M${i * 40 + 20} 30 L${i * 40 + 40} 52 L${i * 40 + 20} 74 L${i * 40} 52 Z" fill="none" stroke="#D4AF37" stroke-width="2"/>`
    ).join('')}
  </g>

  <!-- 日芒纹 -->
  <g transform="translate(1290 190)" opacity="0.7">
    <circle r="46" fill="none" stroke="#D4AF37" stroke-width="5"/>
    <circle r="20" fill="#D4AF37" opacity="0.5"/>
    ${Array.from({ length: 16 }, (_, i) => {
      const a = (i * 22.5 * Math.PI) / 180;
      return `<line x1="${Math.cos(a) * 54}" y1="${Math.sin(a) * 54}" x2="${Math.cos(a) * 92}" y2="${Math.sin(a) * 92}" stroke="#D4AF37" stroke-width="4"/>`;
    }).join('')}
  </g>
</svg>`;
}

/* ============================================================
   10. 文化交流 Hero
   ============================================================ */
function heroExchange(w = 1600, h = 900) {
  const nodes = [
    { x: 300, y: 320, r: 26, c: '#E86FA0' },
    { x: 520, y: 220, r: 22, c: '#6FB3E0' },
    { x: 760, y: 300, r: 30, c: '#D4AF37' },
    { x: 1000, y: 200, r: 24, c: '#7FCDCD' },
    { x: 1240, y: 320, r: 28, c: '#F2A0B5' },
    { x: 900, y: 460, r: 34, c: '#2E8B57' },
    { x: 560, y: 480, r: 20, c: '#D73C2C' },
    { x: 1300, y: 520, r: 22, c: '#6FB3E0' },
  ];
  let lines = '';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      lines += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="#FFFFFF" stroke-width="1.5" opacity="0.18"/>`;
    }
  }
  let dots = nodes
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.c}" opacity="0.55"/>
                 <circle cx="${n.x}" cy="${n.y}" r="${n.r * 1.9}" fill="none" stroke="${n.c}" stroke-width="1.5" opacity="0.3"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="exBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E5BA8"/>
      <stop offset="50%" stop-color="#6A2FA0"/>
      <stop offset="100%" stop-color="#D73C2C"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#exBg)"/>
  <g>${lines}</g>
  <g>${dots}</g>
</svg>`;
}

/* ============================================================
   11. 数字遗产 Hero
   ============================================================ */
function heroArchive(w = 1600, h = 900) {
  const cells = [];
  const cw = 150, ch = 150, gap = 24;
  const cols = Math.floor((w + gap) / (cw + gap));
  const rows = Math.floor((h + gap) / (ch + gap));
  const offX = (w - (cols * cw + (cols - 1) * gap)) / 2;
  const offY = (h - (rows * ch + (rows - 1) * gap)) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offX + c * (cw + gap);
      const y = offY + r * (ch + gap);
      const op = 0.12 + ((r + c) % 4) * 0.07;
      cells.push(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="#FFFFFF" opacity="${op}"/>`);
      cells.push(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.35"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="arBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C9A63F"/>
      <stop offset="55%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#B8762A"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#arBg)"/>
  ${cells.join('')}
</svg>`;
}

/* ============================================================
   12. 互动体验 Hero
   ============================================================ */
function heroInteractive(w = 1600, h = 900) {
  const bubbles = [];
  const cols = [C.red, C.gold, C.cyan, '#6FB3E0', C.green, '#E86FA0'];
  for (let i = 0; i < 26; i++) {
    const x = ((i * 137) % w);
    const y = ((i * 271) % h);
    const r = 14 + ((i * 53) % 46);
    const c = cols[i % cols.length];
    bubbles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${0.18 + (i % 3) * 0.09}"/>`);
    bubbles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.25"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="inBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D73C2C"/>
      <stop offset="50%" stop-color="#7A2FA0"/>
      <stop offset="100%" stop-color="#2E3F8F"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#inBg)"/>
  ${bubbles.join('')}
</svg>`;
}

/* ============================================================
   13. 人设卡片背景（16 种配色）
   ============================================================ */
function personaCard(idx, c1, c2, icon) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <linearGradient id="pc${idx}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#pc${idx})"/>
  <g opacity="0.14">
    ${Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 14 }, (_, c) =>
        `<path d="M${c * 46 + 20} ${r * 46 + 8} L${c * 46 + 40} ${r * 46 + 28} L${c * 46 + 20} ${r * 46 + 48} L${c * 46} ${r * 46 + 28} Z" fill="none" stroke="#FFFFFF" stroke-width="2"/>`
      ).join('')
    ).join('')}
  </g>
  ${icon}
</svg>`;
}

/* ============================================================
   写出全部文件
   ============================================================ */
function write(rel, content) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  files[rel] = content.length;
}

// Hero 大图
write('hero/guangxi.svg', heroGuangxi());
write('hero/exchange.svg', heroExchange());
write('hero/archive.svg', heroArchive());
write('hero/interactive.svg', heroInteractive());
write('hero/guilin.svg', guilinLandscape(1600, 900));

// 文化元素图
write('culture/zhuangjin-diamond.svg', zhuangjinDiamond());
write('culture/zhuangjin-wave.svg', zhuangjinWave());
write('culture/zhuangjin-fret.svg', zhuangjinFret());
write('culture/bronze-drum.svg', bronzeDrum());
write('culture/huashan-rock-art.svg', huashanRockArt());
write('culture/stilt-house.svg', stiltHouse());
write('culture/embroidery-ball.svg', embroideryBall());
write('culture/guilin-landscape.svg', guilinLandscape());

// 东盟国家图标
for (const { name, svg } of aseanIcons()) {
  write(`icons/asean/${name}.svg`, svg);
}

// UI 图标
for (const { name, svg } of uiIcons()) {
  write(`icons/ui/${name}.svg`, svg);
}

// 人设卡片
const personaPalettes = [
  ['#B8762A', '#8B4A1A'], ['#E86FA0', '#8B2FA0'], ['#4A4A4A', '#1A1A1A'],
  ['#3A7BBF', '#1E5BA8'], ['#2E8B57', '#1A5B3A'], ['#7FCDCD', '#2E7B8B'],
  ['#E86FA0', '#B01E1E'], ['#6A6AE8', '#3A2FA0'], ['#D4AF37', '#8B6B1A'],
  ['#E88B4A', '#B03A1A'], ['#A8823F', '#6B4A1A'], ['#E86FA0', '#B01E5B'],
  ['#3A6ABF', '#1A2F6B'], ['#4AAFCD', '#1A6B8B'], ['#4ACD8B', '#1A6B4A'],
  ['#A04AE8', '#E86FA0'],
];
personaPalettes.forEach(([c1, c2], i) => {
  write(`persona/card-${i}.svg`, personaCard(i, c1, c2, ''));
});

console.log('✅ 图片素材生成完成\n');
const groups = {};
for (const k of Object.keys(files)) {
  const g = k.split('/')[0];
  groups[g] = (groups[g] || 0) + 1;
}
for (const [g, n] of Object.entries(groups)) {
  console.log(`  ${g.padEnd(10)} ${n} 个文件`);
}
console.log(`\n  合计 ${Object.keys(files).length} 个文件`);
console.log(`  输出目录: public/images/\n`);
