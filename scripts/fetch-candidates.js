/**
 * 候选图下载（人工挑选用）
 * Fetch multiple candidates per subject for manual visual review
 *
 * 【为什么需要人工挑选】
 * 此前用「自动选第一张」的方式抓图，结果 16 张里 7 张与题材不符
 * （如「龙脊梯田」抓到村寨屋顶、「干栏式建筑」抓到抱孩子的人）。
 * 根因是只按文件名关键词匹配，未校验图片实际内容。
 * 图片素材必须肉眼确认 —— 本脚本负责下载候选，由人挑选。
 *
 * 用法：
 *   node scripts/fetch-candidates.js <题材key>
 *   node scripts/fetch-candidates.js --list        列出全部题材
 *   node scripts/fetch-candidates.js --sheet <key> 把该题材候选拼成预览图
 * 输出：_cand/<题材key>/1.jpg 2.jpg ...
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_cand');
const UA = 'GuangxiAseanCulturalExhibition/1.0 (educational project; contact@example.org)';
const WANT_W = 1280; // Wikimedia 只接受特定缩略宽度（500 / 1280 实测可用）

/**
 * 题材清单
 * queries 按优先级排列；want 说明"什么样的图才算对"，供挑选时对照。
 */
const SUBJECTS = {
  /* ── 东盟：泰国 ── */
  'thailand-grand-palace': {
    group: '泰国',
    queries: ['Grand Palace Bangkok', 'Wat Phra Kaew Bangkok', 'Grand Palace Bangkok throne hall', 'Emerald Buddha Temple Bangkok'],
    want: '曼谷大皇宫/玉佛寺建筑，金顶或全景；不要室内佛像特写',
  },
  'thailand-songkran': {
    group: '泰国',
    queries: ['Songkran festival Thailand', 'Songkran water festival Chiang Mai', 'Thai New Year water splashing'],
    want: '泼水节现场，有水花与人群；不要只在室内',
  },
  'thailand-muaythai': {
    group: '泰国',
    queries: ['Muay Thai fight', 'Muay Thai boxing ring Thailand', 'Thai boxer wai kru'],
    want: '泰拳比赛或训练场面；不要拳套静物',
  },
  /* ── 东盟：越南 ── */
  'vietnam-aodai': {
    group: '越南',
    queries: ['Ao dai Vietnamese dress', 'Vietnamese woman ao dai', 'Ao dai school Vietnam'],
    want: '穿奥黛的人物，能看清服饰形制',
  },
  'vietnam-water-puppetry': {
    group: '越南',
    queries: ['Water puppetry Vietnam', 'Múa rối nước', 'Thang Long water puppet theatre'],
    want: '水上木偶戏演出场景（水面、木偶、观众席）',
  },
  'vietnam-tet': {
    group: '越南',
    queries: ['Tet Vietnamese New Year', 'Vietnamese New Year celebration', 'Hoa mai Tet Vietnam'],
    want: '越南春节场景（桃花、年粽、街市）',
  },
  /* ── 东盟：印尼 ── */
  'indonesia-borobudur': {
    group: '印尼',
    queries: ['Borobudur temple', 'Borobudur stupas sunrise', 'Borobudur aerial'],
    want: '婆罗浮屠全景或佛塔群',
  },
  'indonesia-batik': {
    group: '印尼',
    queries: ['Batik Indonesia textile', 'Indonesian batik pattern', 'Batik making Indonesia'],
    want: '蜡染织物纹样或制作过程',
  },
  'indonesia-wayang': {
    group: '印尼',
    queries: ['Wayang kulit puppet', 'Javanese shadow puppet', 'Wayang performance Indonesia'],
    want: '皮影偶或皮影戏演出',
  },
  /* ── 东盟：其他国家地标 ── */
  'malaysia': {
    group: '其他七国',
    queries: ['Petronas Towers Kuala Lumpur', 'Malaysia Petronas Towers night', 'Kuala Lumpur skyline'],
    want: '吉隆坡双峰塔或城市天际线',
  },
  'singapore': {
    group: '其他七国',
    queries: ['Merlion Singapore', 'Marina Bay Sands Singapore', 'Singapore skyline'],
    want: '鱼尾狮或滨海湾地标',
  },
  'philippines': {
    group: '其他七国',
    queries: ['Banaue rice terraces Philippines', 'Ifugao rice terraces', 'Philippines landscape landmark'],
    want: '菲律宾地标（原住民梯田优先）',
  },
  'cambodia': {
    group: '其他七国',
    queries: ['Angkor Wat Cambodia', 'Angkor Wat sunrise reflection', 'Bayon temple Cambodia'],
    want: '吴哥窟全景或塔群',
  },
  'laos': {
    group: '其他七国',
    queries: ['Luang Prabang Laos temple', 'Pha That Luang Vientiane', 'Laos Buddhist temple'],
    want: '琅勃拉邦或佛塔建筑',
  },
  'myanmar': {
    group: '其他七国',
    queries: ['Shwedagon Pagoda Yangon', 'Bagan temples Myanmar', 'Myanmar pagoda'],
    want: '仰光大金塔或蒲甘塔林',
  },
  'brunei': {
    group: '其他七国',
    queries: ['Sultan Omar Ali Saifuddien Mosque', 'Brunei mosque', 'Kampong Ayer Brunei'],
    want: '文莱清真寺或水上村落',
  },
  /* ── 广西：丝路海洋主题（供替换当前的船模照）── */
  'sea-harbour': {
    group: '丝路',
    queries: ['Chinese junk ship Hong Kong harbour', 'Chinese junk boat sailing',
              'Beihai Guangxi port', 'Guangxi coast sea', 'Sea port China container ship',
              'sampan Chinese boat sea'],
    want: '中式帆船或港口海景；不要欧洲帆船、不要船模、不要卫星图',
  },
  /* ── 广西：替换自绘图版的题材 ── */
  'guilin-scenery': {
    group: '广西',
    queries: ['Li River Guilin blue sky', 'Yangshuo Li River karst boat', 'Xingping Li River scenery',
              'Guilin karst mountains river cruise', 'Li River Guilin sunny'],
    want: '天气好的漓江山水（蓝天、清水、峰林）；不要阴天灰蒙蒙的',
  },
  'bronze-drum-real': {
    group: '广西',
    queries: ['bronze drum museum complete', 'Dong Son bronze drum whole', 'bronze drum Guangxi Museum collection',
              'Chinese bronze drum artifact', 'Heger type bronze drum'],
    want: '完整的铜鼓本体（能看出鼓形与鼓面），不要只有局部特写',
  },
  'stilt-architecture': {
    group: '广西',
    queries: ['Zhaoxing Dong village', 'Dong village Guangxi wooden houses', 'Miao village stilt houses China',
              'Chengyang bridge Dong village', 'wooden stilt houses village China'],
    want: '成片或整栋的干栏式木构建筑；不要人物特写',
  },
  'embroidery-ball-real': {
    group: '广西',
    queries: ['embroidered silk ball Chinese handicraft', 'Zhuang embroidery ball Guangxi',
              'Chinese silk ball ornament', 'xiuqiu embroidery ball'],
    want: '绣球实物（球形、彩色、带流苏）',
  },
  'zhuangjin-textile': {
    group: '广西',
    // 注意：英文组合词（Zhuang brocade textile 等）在 Commons 上基本无结果，
    // 中文「壮锦」与 'brocade Guangxi' 才有效
    queries: ['壮锦', 'brocade Guangxi', 'Chinese brocade', '毛南锦', '壮锦机'],
    want: '壮锦/毛南锦织物纹样，或织锦机；不要书页扫描件',
  },
};

/* ── curl 封装（本机 Node https 不稳，实测 curl 可靠） ── */
function curlText(url, timeout = 40) {
  try {
    return execFileSync('curl', ['-sL', '--max-time', String(timeout), '-A', UA, url], {
      maxBuffer: 32 * 1024 * 1024, encoding: 'buffer',
    }).toString('utf8');
  } catch { return ''; }
}
function curlFile(url, dest, timeout = 90) {
  try {
    execFileSync('curl', ['-sL', '--max-time', String(timeout), '-A', UA, '-o', dest, url], { maxBuffer: 8 * 1024 * 1024 });
    if (!fs.existsSync(dest)) return 0;
    const n = fs.statSync(dest).size;
    const h = fs.readFileSync(dest).subarray(0, 4);
    const ok = (h[0] === 0xff && h[1] === 0xd8) || (h[0] === 0x89 && h[1] === 0x50);
    if (!ok) { fs.unlinkSync(dest); return 0; }
    return n;
  } catch { return 0; }
}
function search(q, limit = 10) {
  const t = curlText(`https://api.wikimedia.org/core/v1/commons/search/page?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!t) return [];
  try { return (JSON.parse(t).pages || []).filter((p) => p.title.startsWith('File:')); } catch { return []; }
}
function fileInfo(title) {
  const t = curlText(`https://api.wikimedia.org/core/v1/commons/file/${encodeURIComponent(title)}`);
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

async function fetchCandidates(key, spec) {
  const dir = path.join(OUT, key);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const seen = new Set();
  const picked = [];

  for (const q of spec.queries) {
    if (picked.length >= 8) break;
    for (const r of search(q)) {
      if (picked.length >= 8) break;
      const nm = r.title.toLowerCase();
      if (seen.has(nm)) continue;
      if (/\.(svg|gif|tif|tiff|pdf|webm|ogv|djvu|xcf|ogg|mp3)$/.test(nm)) continue;
      if (/logo|icon|\bmap\b|diagram|coat_of_arms|flag|symbol|chart|graph|postage|stamp|banknote|coin/.test(nm)) continue;
      seen.add(nm);

      const info = fileInfo(r.title);
      if (!info) continue;
      const o = info.original || {};
      const ow = o.width || 0, oh = o.height || 0;
      if (ow < 900 || oh < 600) continue;
      if (ow / oh < 0.5 || ow / oh > 2.6) continue;   // 排除极端比例

      const m = (o.url || '').match(/\/commons\/(.\/..)\/([^/]+)$/);
      if (!m) continue;
      const fn = decodeURIComponent(m[2]);
      const url = `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${WANT_W}px-${fn}` +
                  (/\.(jpe?g|png)$/i.test(fn) ? '' : '.jpg');

      const idx = picked.length + 1;
      const dest = path.join(dir, `${idx}.jpg`);
      const bytes = curlFile(url, dest);
      if (bytes < 20000) {
        // 缩略失败则退回原图
        const b2 = curlFile(o.url, dest, 120);
        if (b2 < 20000) continue;
      }
      picked.push({
        idx, file: `${idx}.jpg`, title: r.title.replace('File:', ''),
        uploader: (info.latest?.user?.name) || '?', w: ow, h: oh,
      });
      process.stdout.write(`    [${idx}] ${r.title.replace('File:', '').slice(0, 58)}\n`);
    }
  }

  fs.writeFileSync(path.join(dir, '_meta.json'), JSON.stringify({ key, want: spec.want, items: picked }, null, 2), 'utf8');
  return picked.length;
}

/* ── CLI ── */
(async () => {
  const arg = process.argv[2];

  if (!arg || arg === '--list') {
    const groups = {};
    for (const [k, v] of Object.entries(SUBJECTS)) (groups[v.group] ||= []).push(k);
    console.log('可用题材：\n');
    for (const [g, ks] of Object.entries(groups)) {
      console.log(`  ${g}`);
      ks.forEach((k) => console.log(`    ${k}`));
    }
    return;
  }

  if (arg === '--all') {
    const keys = Object.keys(SUBJECTS);
    for (const k of keys) {
      const spec = SUBJECTS[k];
      console.log(`\n【${spec.group}】${k}`);
      console.log(`  要求：${spec.want}`);
      const n = await fetchCandidates(k, spec);
      console.log(`  → ${n} 张候选`);
    }
    return;
  }

  const spec = SUBJECTS[arg];
  if (!spec) { console.error(`未知题材: ${arg}（用 --list 查看）`); process.exit(1); }
  console.log(`【${spec.group}】${arg}`);
  console.log(`要求：${spec.want}\n`);
  const n = await fetchCandidates(arg, spec);
  console.log(`\n共 ${n} 张候选 → _cand/${arg}/`);
})();
