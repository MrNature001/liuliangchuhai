/**
 * 国旗 SVG 生成器（东盟十国）
 * 用矢量绘制，替代 emoji 国旗（Windows 上 emoji 国旗不显示，会退化成字母代码）。
 * 输出到 public/images/icons/flags/
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'images', 'icons', 'flags');
const W = 90, H = 60;

const flags = {
  // 泰国：五横条 红白蓝白红
  thailand: `
    <rect width="${W}" height="${H}" fill="#A51931"/>
    <rect y="10" width="${W}" height="10" fill="#F4F5F8"/>
    <rect y="20" width="${W}" height="20" fill="#2D2A4A"/>
    <rect y="40" width="${W}" height="10" fill="#F4F5F8"/>`,

  // 越南：红底黄星
  vietnam: `
    <rect width="${W}" height="${H}" fill="#DA251D"/>
    <path d="M45 15 L50.3 30.6 L66.6 30.6 L53.5 40.2 L58.6 55.8 L45 46.2 L31.4 55.8 L36.5 40.2 L23.4 30.6 L39.7 30.6 Z" fill="#FFFF00"/>`,

  // 印尼：上红下白
  indonesia: `
    <rect width="${W}" height="30" fill="#FF0000"/>
    <rect y="30" width="${W}" height="30" fill="#FFFFFF"/>`,

  // 马来西亚：14 道条纹 + 蓝底黄星月
  malaysia: `
    <rect width="${W}" height="${H}" fill="#FFFFFF"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect y="${i * 8.57}" width="${W}" height="4.29" fill="#CC0001"/>`).join('')}
    <rect width="45" height="34.3" fill="#010066"/>
    <circle cx="22" cy="17" r="9" fill="#FFCC00"/>
    <circle cx="26" cy="17" r="8" fill="#010066"/>
    <path d="M34 17 L38 14 L36.5 18 L40 20 L36 20.5 L36 24 L34 21 L31 23 L32.5 19.5 L30 17.5 Z" fill="#FFCC00"/>`,

  // 新加坡：上红下白 + 星月
  singapore: `
    <rect width="${W}" height="30" fill="#EF3340"/>
    <rect y="30" width="${W}" height="30" fill="#FFFFFF"/>
    <circle cx="24" cy="15" r="9" fill="#FFFFFF"/>
    <circle cx="28" cy="15" r="8" fill="#EF3340"/>
    <circle cx="36" cy="8" r="1.8" fill="#FFFFFF"/>
    <circle cx="41" cy="12" r="1.8" fill="#FFFFFF"/>
    <circle cx="41" cy="18" r="1.8" fill="#FFFFFF"/>
    <circle cx="36" cy="22" r="1.8" fill="#FFFFFF"/>
    <circle cx="31" cy="18" r="1.8" fill="#FFFFFF"/>`,

  // 菲律宾：左白三角 + 右上下蓝红
  philippines: `
    <rect width="${W}" height="30" fill="#0038A8"/>
    <rect y="30" width="${W}" height="30" fill="#CE1126"/>
    <path d="M0 0 L38 30 L0 60 Z" fill="#FFFFFF"/>
    <circle cx="13" cy="30" r="4" fill="#FCD116"/>`,

  // 柬埔寨：蓝红蓝 + 吴哥窟白塔
  cambodia: `
    <rect width="${W}" height="${H}" fill="#032EA1"/>
    <rect y="15" width="${W}" height="30" fill="#E00025"/>
    <g fill="#FFFFFF">
      <rect x="42" y="24" width="6" height="12"/>
      <path d="M42 24 L45 18 L48 24 Z"/>
      <rect x="36" y="28" width="4" height="8"/>
      <path d="M36 28 L38 23 L40 28 Z"/>
      <rect x="50" y="28" width="4" height="8"/>
      <path d="M50 28 L52 23 L54 28 Z"/>
    </g>`,

  // 老挝：红蓝红 + 白圆
  laos: `
    <rect width="${W}" height="${H}" fill="#CE1126"/>
    <rect y="15" width="${W}" height="30" fill="#002868"/>
    <circle cx="45" cy="30" r="11" fill="#FFFFFF"/>`,

  // 缅甸：黄绿红三横 + 白星
  myanmar: `
    <rect width="${W}" height="20" fill="#FECB00"/>
    <rect y="20" width="${W}" height="20" fill="#34B233"/>
    <rect y="40" width="${W}" height="20" fill="#EA2839"/>
    <path d="M45 12 L48.5 23 L60 23 L50.7 29.7 L54.2 40.7 L45 34 L35.8 40.7 L39.3 29.7 L30 23 L41.5 23 Z" fill="#FFFFFF"/>`,

  // 文莱：黄底 + 黑白斜条 + 红徽
  brunei: `
    <rect width="${W}" height="${H}" fill="#F7E017"/>
    <path d="M0 12 L${W} 30 L${W} 40 L0 22 Z" fill="#FFFFFF"/>
    <path d="M0 20 L${W} 38 L${W} 46 L0 28 Z" fill="#000000"/>
    <g fill="#CF1126">
      <path d="M45 22 L52 30 L45 38 L38 30 Z"/>
      <rect x="30" y="28" width="30" height="4"/>
    </g>`,
};

fs.mkdirSync(OUT, { recursive: true });

for (const [name, body] of Object.entries(flags)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  ${body.trim()}
  <rect width="${W}" height="${H}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
</svg>`;
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg, 'utf8');
  console.log(`  ✓ flags/${name}.svg`);
}

console.log(`\n✅ 生成 ${Object.keys(flags).length} 面国旗 -> public/images/icons/flags/`);
