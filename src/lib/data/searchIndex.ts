/**
 * 站内搜索索引
 * Site-wide search index
 *
 * 纯前端实现：内容全部来自静态数据与字典，不发送任何请求，
 * 因此可离线、可静态导出，也不会把用户查询泄露给第三方。
 *
 * 设计取舍：中文不依赖分词库，改用「字二元组 + 子串」混合匹配，
 * 对短查询（2–6 字）和长查询都稳定；英文按词干截断匹配。
 */

import { ASEAN_PROFILES, ASEAN_NAMES, localized, type AseanCountryCode } from './aseanProfiles';

export interface SearchDoc {
  id: string;
  /** 站点内相对路径（不含语言前缀） */
  path: string;
  /** 所属展厅 key，用于结果分组 */
  section: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  /** 用于匹配的额外关键词（含拼音/别名/别称） */
  keywords: string[];
}

/** 展厅的展示名（与 header 字典保持一致的措辞，但搜索需要脱离 i18n 上下文） */
const SECTION_LABEL: Record<string, { zh: string; en: string }> = {
  guangxi: { zh: '壮乡之韵', en: 'Rhythm of Zhuang' },
  guilin: { zh: '山水桂林', en: 'Guilin Landscape' },
  asean: { zh: '东盟十国', en: 'ASEAN Kaleidoscope' },
  exchange: { zh: '丝路新章', en: 'New Silk Road' },
  archive: { zh: '数字遗产', en: 'Digital Heritage' },
  interactive: { zh: '互动体验', en: 'Interactive' },
  persona: { zh: '文化人设', en: 'Cultural Persona' },
  credits: { zh: '图片来源', en: 'Image Credits' },
};

/** 广西文化条目（与 guangxi / archive / guilin 展厅的章节对应） */
const GUANGXI_DOCS: SearchDoc[] = [
  {
    id: 'huashan',
    path: '/guangxi#huashan',
    section: 'guangxi',
    title: '左江花山岩画',
    titleEn: 'Zuojiang Huashan Rock Art',
    summary: '战国至东汉时期骆越人凿绘于临江峭壁上的赭红色岩画，2016 年列入世界遗产。',
    summaryEn:
      'Ochre rock paintings made by the Luo Yue people on river cliffs between the Warring States and Eastern Han, inscribed as World Heritage in 2016.',
    keywords: ['花山', '岩画', '宁明', '骆越', '世界遗产', 'huashan', 'rock art', 'luoyue'],
  },
  {
    id: 'zhuangjin',
    path: '/guangxi#zhuangjin',
    section: 'guangxi',
    title: '壮锦',
    titleEn: 'Zhuang brocade',
    summary: '以棉线为经、五色丝线为纬的提花织物，与云锦、蜀锦、宋锦并称中国四大名锦。',
    summaryEn:
      'A jacquard textile with cotton warp and five-colour silk weft, one of China’s four famous brocades.',
    keywords: ['壮锦', '织锦', '菱形纹', '几何纹', '毛南锦', 'zhuangjin', 'brocade', 'weaving'],
  },
  {
    id: 'tonggu',
    path: '/guangxi#tonggu',
    section: 'guangxi',
    title: '铜鼓',
    titleEn: 'Bronze drum',
    summary: '骆越与俚僚系统铸造的青铜礼器，鼓面太阳纹与蛙饰是权力与稻作祈年的象征。',
    summaryEn:
      'Bronze ritual drums of the Luo Yue and Li–Liao traditions; sunburst and frog ornaments signal power and prayers for rice.',
    keywords: ['铜鼓', '青铜', '太阳纹', '蛙饰', 'tonggu', 'bronze drum', 'sunburst'],
  },
  {
    id: 'ganlan',
    path: '/guangxi#architecture',
    section: 'guangxi',
    title: '干栏式建筑',
    titleEn: 'Stilt houses (ganlan)',
    summary: '底层架空、上层住人的木构建筑，适应岭南湿热多雨的气候，也是侗台语族的共同居住传统。',
    summaryEn:
      'Timber houses raised on posts with living quarters above, adapted to the humid south and shared across Kra-Dai speaking peoples.',
    keywords: ['干栏', '吊脚楼', '侗寨', '木构', 'stilt house', 'ganlan', 'dong village'],
  },
  {
    id: 'sanyuesan',
    path: '/guangxi#sanyuesan',
    section: 'guangxi',
    title: '三月三',
    titleEn: 'Sanyuesan festival',
    summary: '壮族歌节，农历三月初三赶歌圩、抛绣球、对歌、吃五色糯米饭。',
    summaryEn:
      'The Zhuang song festival on the third day of the third lunar month: song fairs, embroidered balls, antiphonal singing and five-colour rice.',
    keywords: ['三月三', '歌圩', '对歌', '五色糯米饭', '抛绣球', 'sanyuesan', 'song fair'],
  },
  {
    id: 'liusanjie',
    path: '/guangxi#liusanjie',
    section: 'guangxi',
    title: '刘三姐',
    titleEn: 'Liu Sanjie',
    summary: '壮族传说中的歌仙，以山歌与地主对唱的故事在宜州、柳州一带流传。',
    summaryEn:
      'The legendary Zhuang song goddess whose singing contests with a landlord are told around Yizhou and Liuzhou.',
    keywords: ['刘三姐', '歌仙', '山歌', '宜州', 'liu sanjie', 'folk song'],
  },
  {
    id: 'liuzhou',
    path: '/guangxi#food',
    section: 'guangxi',
    title: '广西米粉：螺蛳粉与老友粉',
    titleEn: 'Guangxi rice noodles',
    summary: '柳州螺蛳粉以酸笋与螺汤为底，南宁老友粉以酸辣豆豉炒制，是广西最具辨识度的日常饮食。',
    summaryEn:
      'Liuzhou luosifen builds on pickled bamboo and snail broth; Nanning laoyoufen is stir-fried with fermented black beans — the region’s most recognisable everyday food.',
    keywords: ['螺蛳粉', '老友粉', '米粉', '酸笋', '柳州', '南宁', 'luosifen', 'rice noodle'],
  },
];

const GUILIN_DOCS: SearchDoc[] = [
  {
    id: 'lijiang',
    path: '/guilin#lijiang',
    section: 'guilin',
    title: '漓江',
    titleEn: 'Li River',
    summary: '自桂林至阳朔八十余公里的喀斯特河段，是桂林山水的核心景观带。',
    summaryEn:
      'The karst river reach from Guilin to Yangshuo, the core landscape of Guilin.',
    keywords: ['漓江', '阳朔', '竹筏', '山水', 'li river', 'yangshuo'],
  },
  {
    id: 'karst',
    path: '/guilin#karst',
    section: 'guilin',
    title: '喀斯特峰林',
    titleEn: 'Karst peaks',
    summary: '石灰岩长期溶蚀形成的峰丛与峰林，2014 年以「中国南方喀斯特」列入世界遗产。',
    summaryEn:
      'Limestone towers and cones shaped by dissolution, inscribed in 2014 as part of South China Karst.',
    keywords: ['喀斯特', '峰林', '石灰岩', '地质', 'karst', 'limestone'],
  },
  {
    id: 'elephant',
    path: '/guilin#elephant',
    section: 'guilin',
    title: '象鼻山',
    titleEn: 'Elephant Trunk Hill',
    summary: '桂林城徽，山体伸入漓江形似大象饮水，水月洞在江面形成圆月倒影。',
    summaryEn:
      'Guilin’s city emblem: a hill reaching into the Li River like a drinking elephant, with a water-moon cave.',
    keywords: ['象鼻山', '水月洞', '桂林', 'elephant trunk hill'],
  },
  {
    id: 'jiuma',
    path: '/guilin#jiuma',
    section: 'guilin',
    title: '九马画山',
    titleEn: 'Nine Horses Mural Hill',
    summary: '漓江沿岸崖壁上的天然岩彩，被民间传说为九匹骏马，是桂林山水的诗意符号。',
    summaryEn:
      'A cliff face on the Li River whose natural markings are read as nine horses.',
    keywords: ['九马画山', '漓江', '岩壁', '九马', 'nine horses'],
  },
];

const EXCHANGE_DOCS: SearchDoc[] = [
  {
    id: 'silkroad',
    path: '/exchange#silk-road',
    section: 'exchange',
    title: '海上丝绸之路',
    titleEn: 'Maritime Silk Road',
    summary: '自合浦、徐闻出发的汉代海路，经东南亚通往印度洋，广西合浦汉墓出土舶来品即是物证。',
    summaryEn:
      'The Han-era sea route leaving from Hepu and Xuwen for the Indian Ocean; imported goods from Hepu tombs are the material evidence.',
    keywords: ['海上丝路', '合浦', '汉墓', '贸易', 'silk road', 'hepu', 'maritime'],
  },
  {
    id: 'zhuangtai',
    path: '/exchange#zhuang-tai',
    section: 'exchange',
    title: '壮族与泰族的文化同源',
    titleEn: 'Zhuang and Tai cultural kinship',
    summary: '同属侗台语族，共享稻作、干栏式居住、铜鼓与歌圩传统。',
    summaryEn:
      'Both belong to the Kra-Dai family, sharing rice farming, stilt houses, bronze drums and song-fair traditions.',
    keywords: ['泰族', '壮族', '侗台语族', '同源', 'zhuang', 'tai', 'kra-dai'],
  },
  {
    id: 'caexpo',
    path: '/exchange#caexpo',
    section: 'exchange',
    title: '中国—东盟博览会',
    titleEn: 'CAEXPO',
    summary: '2004 年起每年在南宁举办，是中国与东盟十国之间的国家级综合展会。',
    summaryEn:
      'Held annually in Nanning since 2004, the national-level comprehensive expo between China and the ten ASEAN nations.',
    keywords: ['中国东盟博览会', '东博会', '南宁', 'caexpo', 'expo'],
  },
];

const ARCHIVE_DOCS: SearchDoc[] = [
  {
    id: 'archive-artifacts',
    path: '/archive#artifacts',
    section: 'archive',
    title: '文物数字档案',
    titleEn: 'Artifact archive',
    summary: '可按材质、年代、来源检索的文物档案，附高清影像与 provenance 信息。',
    summaryEn:
      'An artifact archive searchable by material, period and provenance, with high-resolution imagery.',
    keywords: ['文物', '档案', '检索', 'artifact', 'archive', 'provenance'],
  },
  {
    id: 'archive-models',
    path: '/archive#3d-models',
    section: 'archive',
    title: '三维文物模型库',
    titleEn: '3D model library',
    summary: '可旋转、缩放、截图的铜鼓三维模型，标注尺寸与铸造工艺说明。',
    summaryEn:
      'A rotatable, zoomable bronze-drum model with dimensions and casting notes, with screenshot export.',
    keywords: ['3D', '三维', '模型', '铜鼓', 'model', 'three'],
  },
  {
    id: 'archive-api',
    path: '/archive#research',
    section: 'archive',
    title: '开放数据接口',
    titleEn: 'Open data API',
    summary: '站内提供的文献、数据集与接口说明，供研究者与开发者引用。',
    summaryEn: 'Citation-ready catalogues of papers, datasets and endpoints for researchers and developers.',
    keywords: ['开放数据', 'API', '数据集', '论文', 'open data', 'dataset'],
  },
];

const INTERACTIVE_DOCS: SearchDoc[] = [
  {
    id: 'game-embroidery',
    path: '/interactive#sanyuesan-games',
    section: 'interactive',
    title: '抛绣球',
    titleEn: 'Embroidery ball toss',
    summary: '三月三传统竞技的网页复刻：限时投掷、计分与命中率统计。',
    summaryEn: 'A browser version of the Sanyuesan tossing game with timed rounds and scoring.',
    keywords: ['抛绣球', '游戏', '三月三', 'embroidery ball', 'game'],
  },
  {
    id: 'game-quiz',
    path: '/interactive#quiz',
    section: 'interactive',
    title: '文化知识问答',
    titleEn: 'Cultural quiz',
    summary: '从题库中随机抽题，含解析与成绩记录。',
    summaryEn: 'Randomised questions with explanations and a recorded score.',
    keywords: ['问答', '知识', 'quiz', 'trivia'],
  },
  {
    id: 'game-match',
    path: '/interactive#games',
    section: 'interactive',
    title: '纹样连连看',
    titleEn: 'Motif matching',
    summary: '把壮锦、蜡染与东盟织物纹样两两配对。',
    summaryEn: 'Pair Zhuang brocade, batik and ASEAN textile motifs.',
    keywords: ['连连看', '纹样', '记忆', 'match', 'motif', 'memory'],
  },
  {
    id: 'game-arrange',
    path: '/interactive#games',
    section: 'interactive',
    title: '丝路航线拼图',
    titleEn: 'Maritime route puzzle',
    summary: '按年代与地理顺序排列海上丝路的港口节点。',
    summaryEn: 'Order the ports of the maritime silk road by period and geography.',
    keywords: ['拼图', '航线', '丝路', 'puzzle', 'route'],
  },
];

const ASEAN_DOCS: SearchDoc[] = (Object.keys(ASEAN_PROFILES) as AseanCountryCode[]).flatMap((code) => {
  const p = ASEAN_PROFILES[code];
  const name = ASEAN_NAMES[code];
  const docs: SearchDoc[] = [
    {
      id: `asean-${code}`,
      path: `/asean/${code}`,
      section: 'asean',
      title: name.zh,
      titleEn: name.en,
      summary: p.intro.zh.slice(0, 90) + '…',
      summaryEn: p.intro.en.slice(0, 140) + '…',
      keywords: [name.zh, name.en, code, p.capital.zh, p.capital.en, ...p.highlights.map((h) => h.title.zh)],
    },
  ];
  for (const h of p.highlights) {
    docs.push({
      id: `asean-${code}-${h.title.zh}`,
      path: `/asean/${code}`,
      section: 'asean',
      title: `${name.zh} · ${h.title.zh}`,
      titleEn: `${name.en} · ${h.title.en}`,
      summary: h.desc.zh,
      summaryEn: h.desc.en,
      keywords: [name.zh, name.en, h.title.zh, h.title.en],
    });
  }
  return docs;
});

export const SEARCH_DOCS: SearchDoc[] = [
  ...GUANGXI_DOCS,
  ...GUILIN_DOCS,
  ...EXCHANGE_DOCS,
  ...ARCHIVE_DOCS,
  ...INTERACTIVE_DOCS,
  ...ASEAN_DOCS,
];

export function sectionLabel(section: string, locale: string): string {
  const label = SECTION_LABEL[section];
  if (!label) return section;
  return locale === 'zh' ? label.zh : label.en;
}

/**
 * 匹配打分。
 * 命中标题权重最高，其次关键词，最后摘要；中文额外用二元组覆盖，
 * 避免「铜鼓」这类两字词在长标题里被漏掉。
 */
function scoreDoc(doc: SearchDoc, query: string, isZh: boolean): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = `${doc.title} ${doc.titleEn}`.toLowerCase();
  const keywords = doc.keywords.join(' ').toLowerCase();
  const summary = `${doc.summary} ${doc.summaryEn}`.toLowerCase();

  let score = 0;
  if (title.includes(q)) score += 12;
  if (keywords.includes(q)) score += 8;
  if (summary.includes(q)) score += 4;

  if (isZh && q.length >= 2) {
    // 二元组：把「壮族绣球」拆成 壮族/族绣/绣球，任一命中即加分
    for (let i = 0; i < q.length - 1; i += 1) {
      const gram = q.slice(i, i + 2);
      if (title.includes(gram)) score += 3;
      else if (keywords.includes(gram)) score += 2;
      else if (summary.includes(gram)) score += 1;
    }
  }

  return score;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

/** 执行搜索，返回按相关度降序的结果 */
export function searchDocs(query: string, locale: string, limit = 30): SearchHit[] {
  const q = query.trim();
  if (q.length < 1) return [];
  const isZh = /[一-鿿]/.test(q);

  return SEARCH_DOCS
    .map((doc) => ({ doc, score: scoreDoc(doc, q, isZh) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit);
}

/** 搜索建议（热门词），按语言给出 */
export const SEARCH_SUGGESTIONS: Record<string, string[]> = {
  zh: ['壮锦', '铜鼓', '花山岩画', '三月三', '吴哥窟', '螺蛳粉', '喀斯特', '泰族'],
  en: ['brocade', 'bronze drum', 'rock art', 'Sanyuesan', 'Angkor', 'karst', 'batik'],
};

export { localized };
