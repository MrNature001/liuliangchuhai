/**
 * 东盟题材照片后处理：裁切 / 缩放 / 压缩
 * 原始图从 Commons 下载时最大可达 18MB，必须处理后才适合网页使用。
 * 产出：public/images/asean/<key>.jpg   (900x900 卡片)
 *       public/images/asean/<key>-thumb.jpg (400x400)
 * 运行：node scripts/process-asean.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'images', 'asean');

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => /\.jpg$/i.test(f) && !f.includes('-thumb'));
  let totalIn = 0, totalOut = 0;
  console.log('处理东盟题材照片：\n');
  for (const f of files) {
    const key = f.replace('.jpg', '');
    const src = path.join(DIR, f);
    const sizeIn = fs.statSync(src).size;
    totalIn += sizeIn;

    // 先写到临时文件，避免 sharp 「读同一文件又写同一文件」
    const tmp = path.join(DIR, `_tmp_${key}.jpg`);
    await sharp(src, { failOn: 'none' }).rotate()
      .resize(900, 900, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, src);

    await sharp(src, { failOn: 'none' })
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 76, progressive: true, mozjpeg: true })
      .toFile(path.join(DIR, `${key}-thumb.jpg`));

    const sizeOut = fs.statSync(src).size;
    totalOut += sizeOut;
    console.log(`  ${key.padEnd(26)} ${(sizeIn/1048576).toFixed(1)}MB → ${(sizeOut/1024).toFixed(0)}KB`);
  }
  console.log(`\n合计 ${(totalIn/1048576).toFixed(0)}MB → ${(totalOut/1024).toFixed(0)}KB`);
})();
