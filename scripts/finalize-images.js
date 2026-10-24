/**
 * 素材定稿：把抓到的照片处理成站点实际使用的文件名
 * Finalize image assets (photo-based subjects only)
 *
 * 站点用图分三类：
 *   culture/<key>.jpg       卡片封面（1:1，900px）—— 展厅卡片、文物卡
 *   hero/<key>.jpg          英雄图（16:9，1600x900）—— 各页面顶部大图
 *   culture/<key>-thumb.jpg 缩略图（400px）
 *
 * ⚠️ 本文件【只处理内容经人工核验可靠的题材】。
 * 「铜鼓」「龙脊梯田」「干栏式建筑」「绣球」和三种「壮锦纹样」，
 * 抓到的照片与题材不符（详见 make-cards.js 顶部说明），
 * 已改为本站自绘的图版卡，由 make-cards.js 生成 —— **不要在这里覆盖它们**。
 *
 * 正确的执行顺序：
 *   fetch-photos.js  →  finalize-images.js  →  make-cards.js（必须最后）
 *
 * 运行：node scripts/finalize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PHOTOS = path.join(ROOT, 'public', 'images', 'photos');
const CULTURE = path.join(ROOT, 'public', 'images', 'culture');
const HERO = path.join(ROOT, 'public', 'images', 'hero');

/** 文化元素图：仅限照片内容可靠的题材 */
const CULTURE_MAP = [
  { out: 'huashan-rock-art', src: 'huashan-rock-art' },
  { out: 'guilin-landscape', src: 'guilin-landscape' },
  { out: 'ink-painting',     src: 'ink-painting' },
  { out: 'festival',         src: 'festival' },
  { out: 'asean-culture',    src: 'asean-culture' },
  { out: 'silk-road-sea',    src: 'silk-road-sea' },
  { out: 'guangxi-city',     src: 'guangxi-city' },
  { out: 'archives',         src: 'archives' },
];

/** 英雄图：输出名 → 源照片 */
const HERO_MAP = [
  { out: 'guangxi',     src: 'guilin-landscape' },  // 喀斯特峰林是广西最标志性的形象
  { out: 'guilin',      src: 'guilin-landscape' },
  { out: 'asean',       src: 'asean-culture' },     // 吴哥窟等东盟文化遗产
  { out: 'exchange',    src: 'silk-road-sea' },
  { out: 'archive',     src: 'ink-painting' },
  { out: 'interactive', src: 'festival' },
];

function findSrc(key) {
  for (const ext of ['jpg', 'jpeg', 'png']) {
    const p = path.join(PHOTOS, `${key}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

(async () => {
  fs.mkdirSync(CULTURE, { recursive: true });
  fs.mkdirSync(HERO, { recursive: true });
  let n = 0;

  console.log('文化元素图（照片题材）：');
  for (const m of CULTURE_MAP) {
    const src = findSrc(m.src);
    if (!src) { console.log(`  ✗ ${m.out}（缺源图 ${m.src}）`); continue; }
    await sharp(src, { failOn: 'none' }).rotate()
      .resize(900, 900, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(CULTURE, `${m.out}.jpg`));
    await sharp(src, { failOn: 'none' }).rotate()
      .resize(400, 400, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 76, progressive: true, mozjpeg: true })
      .toFile(path.join(CULTURE, `${m.out}-thumb.jpg`));
    console.log(`  ✓ ${m.out}.jpg`);
    n++;
  }

  console.log('\n英雄图：');
  for (const m of HERO_MAP) {
    const src = findSrc(m.src);
    if (!src) { console.log(`  ✗ ${m.out}（缺源图 ${m.src}）`); continue; }
    await sharp(src, { failOn: 'none' }).rotate()
      .resize(1600, 900, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toFile(path.join(HERO, `${m.out}.jpg`));
    const kb = (fs.statSync(path.join(HERO, `${m.out}.jpg`)).size / 1024).toFixed(0);
    console.log(`  ✓ ${m.out}.jpg  (${kb}KB)`);
    n++;
  }

  console.log(`\n✅ 定稿 ${n} 个文件`);
  console.log('   注意：图版卡（铜鼓/梯田/干栏建筑/绣球/壮锦纹样）由 make-cards.js 生成，本文件未触碰。');
})();
