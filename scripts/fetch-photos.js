/**
 * 文化题材真实照片抓取
 * Fetch real photographs of cultural subjects from Wikimedia Commons
 *
 * 说明：
 * - Wikimedia Commons 的收录政策要求所有文件必须为自由许可（CC / 公有领域），
 *   因此这些图片可合法用于展示，只需保留署名。
 * - 同时抓取「上传者 / 文件名 / 原始页面链接」写入 data/photo-attribution.json，
 *   供站内「图片来源」页展示。
 * - 用 curl 而非 Node https：本机环境下 Node 的 TLS 连接不稳定（ECONNRESET）。
 *
 * 运行：node scripts/fetch-photos.js [题材key]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'photos');
const ATTR = path.join(ROOT, 'data', 'photo-attribution.json');
const UA = 'GuangxiAseanCulturalExhibition/1.0 (educational project; contact@example.org)';

const SUBJECTS = {
  'guilin-landscape': {
    queries: ['Li River Guilin karst landscape', 'Guilin karst mountains river', 'Yangshuo Li River scenery'],
    ratio: 16 / 9,
    note: '桂林山水 / 漓江',
  },
  'huashan-rock-art': {
    queries: ['Zuojiang Huashan Rock Art', 'Huashan rock paintings Guangxi', 'Ningming rock art'],
    ratio: 1,
    note: '左江花山岩画',
  },
  'bronze-drum': {
    queries: ['bronze drum Guangxi museum', 'Dong Son bronze drum', 'Chinese bronze drum'],
    ratio: 1,
    note: '铜鼓',
  },
  'zhuangjin-brocade': {
    queries: ['Zhuang brocade Guangxi', 'Zhuangjin textile', 'Zhuang ethnic weaving'],
    ratio: 1,
    note: '壮锦',
  },
  'stilt-house': {
    queries: ['Dong village stilt houses Guangxi', 'Miao stilt house China', 'Ganlan stilt building'],
    ratio: 1,
    note: '干栏式建筑',
  },
  'embroidery-ball': {
    queries: ['embroidered ball silk handicraft China', 'Chinese silk ball ornament embroidery',
              'handmade silk ball Chinese craft', 'Chinese knot ball silk'],
    ratio: 1,
    note: '绣球',
  },
  'rice-terraces': {
    queries: ['Longsheng rice terraces', 'Longji terraces Guangxi', 'rice terraces Guangxi China'],
    ratio: 16 / 9,
    note: '龙脊梯田',
  },
  'ink-painting': {
    queries: ['Chinese landscape painting ink', 'Shan shui painting mountains', 'Chinese ink wash landscape'],
    ratio: 16 / 9,
    note: '中国水墨山水画',
  },
  'silk-road-sea': {
    queries: ['Chinese junk ship sailing', 'Chinese sailing ship sea', 'Beihai Guangxi coast'],
    ratio: 16 / 9,
    note: '海上丝绸之路 / 帆船',
  },
  'guangxi-city': {
    queries: ['Guangxi Museum Nanning building', 'Nanning Guangxi street', 'Guangxi Zhuang Autonomous Region scenery'],
    ratio: 16 / 9,
    note: '广西',
  },
  'asean-culture': {
    queries: ['Angkor Wat Cambodia temple', 'Borobudur temple Indonesia', 'ASEAN traditional performance'],
    ratio: 16 / 9,
    note: '东盟文化遗产',
  },
  'archives': {
    queries: ['Dunhuang manuscript', 'Chinese rare book library collection',
              'Chinese ancient book pages Ming', 'Chinese archive documents museum'],
    ratio: 16 / 9,
    note: '古籍档案',
  },
  'festival': {
    queries: ['Chinese ethnic festival Guangxi', 'Chinese lantern festival celebration', 'Chinese folk performance'],
    ratio: 16 / 9,
    note: '民族节庆',
  },
};

/** 用 curl 取文本 */
function curlText(url) {
  try {
    return execFileSync('curl', ['-sL', '--max-time', '40', '-A', UA, url], {
      maxBuffer: 32 * 1024 * 1024, encoding: 'buffer',
    }).toString('utf8');
  } catch { return ''; }
}

/** 用 curl 下载文件，返回字节数（0 表示失败） */
function curlFile(url, dest) {
  try {
    execFileSync('curl', ['-sL', '--max-time', '90', '-A', UA, '-o', dest, url], {
      maxBuffer: 8 * 1024 * 1024,
    });
    if (!fs.existsSync(dest)) return 0;
    const n = fs.statSync(dest).size;
    // 校验确实是图片（不是错误页）
    const head = fs.readFileSync(dest).subarray(0, 4);
    const isJpg = head[0] === 0xff && head[1] === 0xd8;
    const isPng = head[0] === 0x89 && head[1] === 0x50;
    if (!isJpg && !isPng) { fs.unlinkSync(dest); return 0; }
    return n;
  } catch { return 0; }
}

function search(query, limit = 12) {
  const t = curlText(`https://api.wikimedia.org/core/v1/commons/search/page?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!t) return [];
  try {
    return (JSON.parse(t).pages || []).filter((p) => p.title.startsWith('File:'));
  } catch { return []; }
}

function fileInfo(title) {
  const t = curlText(`https://api.wikimedia.org/core/v1/commons/file/${encodeURIComponent(title)}`);
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

async function pickAndDownload(key, spec) {
  const target = spec.ratio;
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const q of spec.queries) {
    const results = search(q);
    if (!results.length) continue;

    const cands = [];
    for (const r of results.slice(0, 10)) {
      const nm = r.title.toLowerCase();
      if (/\.(svg|gif|tif|tiff|pdf|webm|ogv|djvu|xcf)$/.test(nm)) continue;
      if (/logo|icon|\bmap\b|diagram|coat_of_arms|flag|symbol|chart|graph/.test(nm)) continue;

      const info = fileInfo(r.title);
      if (!info) continue;
      const o = info.original || {};
      const ow = o.width || 0, oh = o.height || 0;
      if (ow < 800 || oh < 560) continue;

      const ar = ow / oh;
      const arPenalty = Math.abs(Math.log(ar / target));
      if (arPenalty > 0.75) continue;
      const resScore = Math.min(1, (ow * oh) / (2400 * 1600));
      cands.push({ r, info, ow, oh, ar, score: resScore - arPenalty });
    }

    if (!cands.length) continue;
    cands.sort((a, b) => b.score - a.score);

    for (const c of cands.slice(0, 3)) {
      const o = c.info.original || {};
      const wantW = target >= 1.4 ? 2000 : 1400;
      let url = (c.info.thumbnail && c.info.thumbnail.url) || o.url;
      const m = (o.url || '').match(/\/commons\/(.\/..)\/([^/]+)$/);
      if (m) {
        let fn = decodeURIComponent(m[2]);
        url = `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${wantW}px-${fn}`;
        if (!/\.(jpe?g|png)$/i.test(fn)) url += '.jpg';
      }
      if (!url) continue;

      const ext = /\.png$/i.test(url.split('?')[0]) ? 'png' : 'jpg';
      const dest = path.join(OUT_DIR, `${key}.${ext}`);
      const bytes = curlFile(url, dest);
      if (bytes < 15000) {
        // 缩略图失败则退回原图
        if (o.url) {
          const b2 = curlFile(o.url, dest);
          if (b2 >= 15000) {
            return rec(key, spec, q, c, dest, b2, ext);
          }
        }
        continue;
      }
      return rec(key, spec, q, c, dest, bytes, ext);
    }
  }
  return null;
}

function rec(key, spec, q, c, dest, bytes, ext) {
  return {
    key,
    note: spec.note,
    query: q,
    fileTitle: c.r.title,
    sourcePage: `https://commons.wikimedia.org/wiki/${encodeURIComponent(c.r.title)}`,
    uploader: (c.info.latest && c.info.latest.user && c.info.latest.user.name) || 'unknown',
    originalWidth: c.ow,
    originalHeight: c.oh,
    aspectRatio: Math.round(c.ar * 100) / 100,
    bytes,
    file: `photos/${key}.${ext}`,
  };
}

(async () => {
  const only = process.argv[2];
  const keys = only ? [only] : Object.keys(SUBJECTS);
  const attributions = fs.existsSync(ATTR) ? JSON.parse(fs.readFileSync(ATTR, 'utf8')) : [];

  for (const key of keys) {
    const spec = SUBJECTS[key];
    if (!spec) continue;
    process.stdout.write(`  ${key.padEnd(20)} `);
    const r = await pickAndDownload(key, spec);
    if (r) {
      const i = attributions.findIndex((a) => a.key === key);
      if (i >= 0) attributions[i] = r; else attributions.push(r);
      console.log(`✓ ${(r.bytes / 1024).toFixed(0)}KB  ${r.originalWidth}x${r.originalHeight} (ar ${r.aspectRatio})  by ${r.uploader}`);
    } else {
      console.log('✗ 未找到');
    }
  }

  fs.mkdirSync(path.dirname(ATTR), { recursive: true });
  fs.writeFileSync(ATTR, JSON.stringify(attributions, null, 2), 'utf8');
  console.log(`\n署名信息 → data/photo-attribution.json（${attributions.length} 条）`);
})();
