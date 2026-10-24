/**
 * 照片后处理：裁切 / 缩放 / 压缩
 * Photo post-processing
 *
 * 原始照片从 Commons 下载时可达 20MB+，必须处理后才适合网页使用。
 * 产出三种规格：
 *   hero/<key>.jpg      1600x900  英雄图（16:9）
 *   card/<key>.jpg       900x900  卡片封面（1:1）
 *   thumb/<key>.jpg      400x400  缩略图
 *
 * 运行：node scripts/process-photos.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public', 'images', 'photos');
const OUT = path.join(ROOT, 'public', 'images', 'culture');
const HERO = path.join(ROOT, 'public', 'images', 'hero');

/** 需要 16:9 英雄图的题材（与首页/各展厅对应） */
const HERO_KEYS = [
  'guilin-landscape', 'ink-painting', 'silk-road-sea',
  'guangxi-city', 'asean-culture', 'archives', 'festival',
];

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error('未找到 public/images/photos，请先运行 node scripts/fetch-photos.js');
    process.exit(1);
  }

  const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f));
  if (!files.length) { console.error('photos 目录为空'); process.exit(1); }

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(HERO, { recursive: true });

  console.log('处理照片：\n');
  const manifest = [];

  for (const f of files) {
    const key = f.replace(/\.(jpe?g|png)$/i, '');
    const src = path.join(SRC, f);
    const sizeIn = fs.statSync(src).size;

    const base = sharp(src, { failOn: 'none' }).rotate(); // rotate() 依 EXIF 摆正
    const meta = await sharp(src, { failOn: 'none' }).metadata();

    // 卡片（1:1）
    await base.clone()
      .resize(900, 900, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT, `${key}.jpg`));

    // 缩略（1:1）
    await base.clone()
      .resize(400, 400, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT, `${key}-thumb.jpg`));

    // 英雄图（16:9）
    if (HERO_KEYS.includes(key)) {
      await base.clone()
        .resize(1600, 900, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 84, progressive: true, mozjpeg: true })
        .toFile(path.join(HERO, `${key}.jpg`));
    }

    const sizeOut = fs.statSync(path.join(OUT, `${key}.jpg`)).size;
    manifest.push({ key, srcW: meta.width, srcH: meta.height });
    console.log(`  ${key.padEnd(20)} ${(sizeIn / 1048576).toFixed(1)}MB → ${(sizeOut / 1024).toFixed(0)}KB  (${meta.width}x${meta.height})`);
  }

  console.log(`\n✅ 处理完成 ${files.length} 张`);
  console.log(`   卡片图 → public/images/culture/`);
  console.log(`   英雄图 → public/images/hero/  (${HERO_KEYS.length} 张)`);
})();
