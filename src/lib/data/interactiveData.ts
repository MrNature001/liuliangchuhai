/**
 * 互动体验的题库与关卡数据
 * Quiz and game data for the interactive hall
 *
 * 所有题目都取自站内其它展厅已经陈述过的事实，答案不依赖站外信息。
 * 解析（explain）是判分后的反馈，也是把「答错」变成「学到」的地方。
 */

import type { LocalizedText } from './aseanCountries';

const l = (zh: string, en: string): LocalizedText => ({ zh, en });

export interface QuizQuestion {
  id: string;
  question: LocalizedText;
  options: LocalizedText[];
  /** 正确选项下标 */
  answer: number;
  explain: LocalizedText;
  /** 出处标注，指向站内展厅 */
  source: LocalizedText;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-huashan',
    question: l(
      '左江花山岩画在哪一年列入 UNESCO 世界遗产名录？',
      'In which year was the Zuojiang Huashan rock art inscribed as UNESCO World Heritage?'
    ),
    options: [l('2008 年', '2008'), l('2016 年', '2016'), l('2019 年', '2019'), l('2023 年', '2023')],
    answer: 1,
    explain: l(
      '2016 年，左江花山岩画文化景观以「文化景观」类别列入。它是中国第一处岩画类世界遗产。',
      'In 2016, as a cultural landscape — China’s first rock-art World Heritage Site.'
    ),
    source: l('壮乡之韵 · 花山岩画', 'Rhythm of Zhuang · Huashan'),
    difficulty: 'medium',
  },
  {
    id: 'q-zhuangjin',
    question: l(
      '壮锦与下列哪一组并称「中国四大名锦」？',
      'Which group completes the list of China’s four famous brocades alongside Zhuang brocade?'
    ),
    options: [
      l('云锦、蜀锦、宋锦', 'Yunjin, Shujin and Songjin'),
      l('苏绣、湘绣、粤绣', 'Su, Xiang and Yue embroidery'),
      l('缂丝、妆花、漳绒', 'Kesi, zhuanghua and zhangrong'),
      l('黎锦、苗锦、侗锦', 'Li, Miao and Dong brocade'),
    ],
    answer: 0,
    explain: l(
      '正确。云锦（南京）、蜀锦（成都）、宋锦（苏州）与壮锦（广西）合称四大名锦；粤绣、苏绣等属于「四大名绣」，是刺绣不是织锦。',
      'Correct. Yunjin (Nanjing), Shujin (Chengdu), Songjin (Suzhou) and Zhuangjin (Guangxi) are the four brocades; Su and Yue are embroideries, a different craft.'
    ),
    source: l('壮乡之韵 · 壮锦', 'Rhythm of Zhuang · Brocade'),
    difficulty: 'easy',
  },
  {
    id: 'q-tonggu',
    question: l(
      '铜鼓鼓面中心最常见的纹饰是什么？',
      'What is the most common motif at the centre of a bronze drum face?'
    ),
    options: [l('蛙纹', 'Frog'), l('太阳芒纹', 'Sunburst'), l('云雷纹', 'Cloud-thunder'), l('龙纹', 'Dragon')],
    answer: 1,
    explain: l(
      '鼓面中心是太阳芒纹，向外依次为同心弦纹与云雷纹；蛙饰通常铸在鼓面边缘，不是中心。',
      'The centre carries the sunburst, ringed by concentric bands and cloud-thunder motifs; frog figures sit at the rim, not the centre.'
    ),
    source: l('壮乡之韵 · 铜鼓', 'Rhythm of Zhuang · Bronze drum'),
    difficulty: 'easy',
  },
  {
    id: 'q-sanyuesan',
    question: l(
      '壮族「三月三」歌圩上，青年男女抛掷的定情信物是什么？',
      'At the Zhuang Sanyuesan song fair, what token do young people toss?'
    ),
    options: [l('绣球', 'Embroidered ball'), l('花伞', 'Oil-paper umbrella'), l('壮锦背带', 'Brocade baby carrier'), l('铜钱', 'Copper coin')],
    answer: 0,
    explain: l(
      '绣球以十二瓣绸布缝成球体，抛接之间完成问答与择偶，是三月三最具辨识度的符号。',
      'The twelve-petal embroidered ball is tossed back and forth as a form of courtship — the most recognisable emblem of Sanyuesan.'
    ),
    source: l('壮乡之韵 · 三月三', 'Rhythm of Zhuang · Sanyuesan'),
    difficulty: 'easy',
  },
  {
    id: 'q-zhuangtai',
    question: l(
      '壮族与泰国的泰族在语言上属于同一语系，这一语系是？',
      'Zhuang and Thai belong to the same language family. Which one?'
    ),
    options: [l('汉藏语系', 'Sino-Tibetan'), l('侗台语系（Kra-Dai）', 'Kra-Dai'), l('南亚语系', 'Austroasiatic'), l('南岛语系', 'Austronesian')],
    answer: 1,
    explain: l(
      '两者同属侗台语族（Kra-Dai），共享稻作、干栏式居住与铜鼓传统；这也解释了为何壮族与泰族在词汇与音系上有大量对应。',
      'Both belong to Kra-Dai, sharing rice farming, stilt houses and bronze drums — which is why so many words and sounds correspond.'
    ),
    source: l('丝路新章 · 壮族与泰族', 'New Silk Road · Zhuang & Tai'),
    difficulty: 'medium',
  },
  {
    id: 'q-angkor',
    question: l(
      '吴哥窟最初是为哪位神祇建造的？',
      'Which deity was Angkor Wat originally dedicated to?'
    ),
    options: [l('湿婆', 'Shiva'), l('毗湿奴', 'Vishnu'), l('佛陀', 'The Buddha'), l('因陀罗', 'Indra')],
    answer: 1,
    explain: l(
      '吴哥窟由苏耶跋摩二世建造，供奉毗湿奴；后来才逐渐转为佛教寺院，这也是它朝向西方（毗湿奴方向）的原因。',
      'Suryavarman II dedicated it to Vishnu; it later became Buddhist, which is why it faces west.'
    ),
    source: l('东盟十国 · 柬埔寨', 'ASEAN · Cambodia'),
    difficulty: 'medium',
  },
  {
    id: 'q-batik',
    question: l(
      '印尼蜡染（Batik）使用的主要工艺是？',
      'What is the core technique of Indonesian batik?'
    ),
    options: [l('蜡防染', 'Wax resist dyeing'), l('扎染', 'Tie-dye'), l('夹缬', 'Clamp resist'), l('植物拓印', 'Leaf printing')],
    answer: 0,
    explain: l(
      'Batik 以熔蜡在布上绘出纹样，再浸染，蜡覆盖处保留底色。2009 年列入 UNESCO 人类非遗。',
      'Molten wax is drawn on the cloth before dyeing, so waxed areas keep the ground colour. Inscribed by UNESCO in 2009.'
    ),
    source: l('东盟十国 · 印尼', 'ASEAN · Indonesia'),
    difficulty: 'easy',
  },
  {
    id: 'q-luosifen',
    question: l(
      '柳州螺蛳粉最具辨识度的气味来自哪种配料？',
      'Which ingredient gives Liuzhou luosifen its signature aroma?'
    ),
    options: [l('酸笋', 'Pickled bamboo shoots'), l('紫苏', 'Perilla'), l('柠檬叶', 'Kaffir lime leaf'), l('豆豉', 'Fermented black beans')],
    answer: 0,
    explain: l(
      '酸笋经乳酸发酵产生强烈气味，与螺蛳汤底共同构成螺蛳粉的味觉标识。老友粉的酸辣则来自豆豉与酸辣椒。',
      'Lacto-fermented bamboo shoots create the notorious aroma; together with snail broth they define luosifen. Laoyoufen gets its tang from black beans and pickled chilli.'
    ),
    source: l('壮乡之韵 · 广西米粉', 'Rhythm of Zhuang · Noodles'),
    difficulty: 'easy',
  },
  {
    id: 'q-unesco-vietnam',
    question: l(
      '越南水上木偶戏是否列入 UNESCO 世界遗产名录？',
      'Is Vietnamese water puppetry inscribed on the UNESCO World Heritage list?'
    ),
    options: [
      l('是，2008 年列入非物质文化遗产', 'Yes, as intangible heritage in 2008'),
      l('否，它是越南国家级非遗', 'No — it is national-level heritage in Vietnam'),
      l('是，1999 年列入世界遗产', 'Yes, as World Heritage in 1999'),
      l('是，2023 年列入', 'Yes, in 2023'),
    ],
    answer: 1,
    explain: l(
      '水上木偶戏是越南国家级非物质文化遗产，但并未列入 UNESCO 名录。越南 2008 年列入 UNESCO 非遗的是顺化宫廷雅乐与西原锣钲文化空间。本站早期版本此处有误，已更正。',
      'Water puppetry is national heritage in Vietnam but not a UNESCO inscription. Vietnam’s 2008 UNESCO inscriptions were Nhã nhạc court music and the Central Highlands gong space. This site previously stated otherwise and has been corrected.'
    ),
    source: l('东盟十国 · 越南', 'ASEAN · Vietnam'),
    difficulty: 'hard',
  },
  {
    id: 'q-caexpo',
    question: l(
      '中国—东盟博览会自哪一年起每年在南宁举办？',
      'Since which year has the CAEXPO been held annually in Nanning?'
    ),
    options: [l('1999 年', '1999'), l('2004 年', '2004'), l('2010 年', '2010'), l('2013 年', '2013')],
    answer: 1,
    explain: l(
      '首届中国—东盟博览会于 2004 年在南宁举办，此后每年一届，是广西面向东盟最重要的国家级平台。',
      'The first CAEXPO was held in Nanning in 2004 and has run annually since — Guangxi’s most important national platform for ASEAN.'
    ),
    source: l('丝路新章 · 中国—东盟博览会', 'New Silk Road · CAEXPO'),
    difficulty: 'medium',
  },
  {
    id: 'q-karst',
    question: l(
      '桂林峰林属于哪种地貌？',
      'What landform are the Guilin peaks?'
    ),
    options: [l('丹霞地貌', 'Danxia'), l('喀斯特地貌', 'Karst'), l('雅丹地貌', 'Yardang'), l('冰川地貌', 'Glacial')],
    answer: 1,
    explain: l(
      '石灰岩长期溶蚀形成峰丛与峰林，2014 年以「中国南方喀斯特」列入世界遗产。',
      'Limestone dissolution forms the towers and cones; inscribed in 2014 as part of South China Karst.'
    ),
    source: l('山水桂林 · 喀斯特', 'Guilin · Karst'),
    difficulty: 'easy',
  },
  {
    id: 'q-nixing',
    question: l(
      '钦州坭兴陶的独特之处在于？',
      'What distinguishes Qinzhou Nixing pottery?'
    ),
    options: [
      l('施厚釉高温烧成', 'A thick glaze fired at high temperature'),
      l('不施釉，靠窑变呈色并坯体刻字画', 'No glaze: colour comes from kiln variation, with carving on the body'),
      l('以紫砂泥为原料', 'Made from Yixing zisha clay'),
      l('只在龙窑中烧制', 'Fired only in dragon kilns'),
    ],
    answer: 1,
    explain: l(
      '坭兴陶以东泥、西泥配比成坯，不上釉，靠窑变产生朱红、紫红等色泽，再以刀代笔在坯体上刻字画。',
      'East- and west-bank clays are blended and fired unglazed; kiln variation yields vermilion and purple-red tones, with carving done directly into the body.'
    ),
    source: l('数字遗产 · 钦州坭兴陶', 'Digital Heritage · Nixing pottery'),
    difficulty: 'hard',
  },
  {
    id: 'q-haishang',
    question: l(
      '汉代海上丝绸之路在广西的主要始发港是？',
      'Which Guangxi port was the main departure point of the Han-era maritime silk road?'
    ),
    options: [l('合浦', 'Hepu'), l('钦州', 'Qinzhou'), l('北海', 'Beihai'), l('防城港', 'Fangchenggang')],
    answer: 0,
    explain: l(
      '《汉书·地理志》记载自合浦、徐闻出海。合浦汉墓出土的琉璃、玛瑙与香料是这条航线最直接的物证。',
      'The Han geographical treatise records voyages from Hepu and Xuwen. Glass, agate and aromatics from Hepu tombs are the route’s direct evidence.'
    ),
    source: l('丝路新章 · 海上丝路', 'New Silk Road · Maritime route'),
    difficulty: 'medium',
  },
  {
    id: 'q-loi',
    question: l(
      '泰国的水灯节（Loi Krathong）通常在什么时候举行？',
      'When is Loi Krathong held in Thailand?'
    ),
    options: [
      l('泰历十二月满月，多为 11 月', 'Full moon of the 12th Thai lunar month, usually November'),
      l('4 月 13–15 日', '13–15 April'),
      l('农历正月初一', 'Chinese New Year'),
      l('伊斯兰历十月一日', '1 Shawwal'),
    ],
    answer: 0,
    explain: l(
      '4 月 13–15 日是宋干节（泼水节）；水灯节在泰历十二月满月，人们把香蕉叶水灯放入河中寄托祛厄愿望。',
      '13–15 April is Songkran. Loi Krathong falls on the full moon of the 12th Thai lunar month, when banana-leaf floats carry away misfortune.'
    ),
    source: l('东盟十国 · 泰国', 'ASEAN · Thailand'),
    difficulty: 'medium',
  },
  {
    id: 'q-songkran',
    question: l(
      '宋干节于哪一年列入 UNESCO 人类非物质文化遗产名录？',
      'In which year was Songkran inscribed by UNESCO?'
    ),
    options: [l('2018 年', '2018'), l('2020 年', '2020'), l('2023 年', '2023'), l('尚未列入', 'Not yet inscribed')],
    answer: 2,
    explain: l(
      '宋干节于 2023 年列入 UNESCO 人类非遗。同属泰国非遗的还有 2018 年列入的孔剧。',
      'Songkran was inscribed in 2023; Khon masked dance followed in 2018.'
    ),
    source: l('东盟十国 · 泰国', 'ASEAN · Thailand'),
    difficulty: 'hard',
  },
];

/** 按难度抽题（确定性：用种子而非随机，保证 SSR/CSR 一致） */
export function pickQuestions(count: number, seed: number, difficulty?: QuizQuestion['difficulty']): QuizQuestion[] {
  const pool = difficulty ? QUIZ_QUESTIONS.filter((q) => q.difficulty === difficulty) : QUIZ_QUESTIONS;
  if (pool.length === 0) return [];
  const start = Math.abs(seed) % pool.length;
  const out: QuizQuestion[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i += 1) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 纹样连连看
// ---------------------------------------------------------------------------

export interface MotifCard {
  id: string;
  label: LocalizedText;
  image: string;
  /** 同组的两张卡互为匹配 */
  pair: string;
}

export const MOTIF_PAIRS: { pair: string; cards: [MotifCard, MotifCard] }[] = [
  {
    pair: 'a',
    cards: [
      { id: 'a1', label: l('壮锦 · 菱形纹', 'Zhuang brocade · lozenge'), image: 'zhuangjin-diamond', pair: 'a' },
      { id: 'a2', label: l('菱形纹（织锦局部）', 'Lozenge weave detail'), image: 'zhuangjin-diamond', pair: 'a' },
    ],
  },
  {
    pair: 'b',
    cards: [
      { id: 'b1', label: l('铜鼓 · 太阳纹', 'Bronze drum · sunburst'), image: 'bronze-drum', pair: 'b' },
      { id: 'b2', label: l('太阳纹（鼓面局部）', 'Sunburst drum-face detail'), image: 'bronze-drum', pair: 'b' },
    ],
  },
  {
    pair: 'c',
    cards: [
      { id: 'c1', label: l('花山 · 蹲踞人形', 'Huashan · squatting figure'), image: 'huashan-rock-art', pair: 'c' },
      { id: 'c2', label: l('蛙形舞姿（崖壁局部）', 'Frog dance pose on the cliff'), image: 'huashan-rock-art', pair: 'c' },
    ],
  },
  {
    pair: 'd',
    cards: [
      { id: 'd1', label: l('绣球 · 十二瓣', 'Embroidered ball · twelve petals'), image: 'embroidery-ball', pair: 'd' },
      { id: 'd2', label: l('球面绣纹', 'Embroidered sphere'), image: 'embroidery-ball', pair: 'd' },
    ],
  },
  {
    pair: 'e',
    cards: [
      { id: 'e1', label: l('蜡染 · 印尼', 'Batik · Indonesia'), image: 'asean-culture', pair: 'e' },
      { id: 'e2', label: l('蜡防染纹样', 'Wax-resist pattern'), image: 'asean-culture', pair: 'e' },
    ],
  },
  {
    pair: 'f',
    cards: [
      { id: 'f1', label: l('干栏 · 翘角屋檐', 'Stilt house · upturned eaves'), image: 'stilt-house', pair: 'f' },
      { id: 'f2', label: l('侗寨木构', 'Dong timber detail'), image: 'stilt-house', pair: 'f' },
    ],
  },
];

/**
 * 连连看发牌：固定 12 张（6 对），位置由下标决定，
 * 不用随机数，避免 SSR/CSR 水合不一致。
 */
export function dealMotifBoard(): MotifCard[] {
  const cards = MOTIF_PAIRS.flatMap((p) => p.cards);
  // 确定性交错：偶数位放第一张、奇数位放第二张，再按固定步长重排
  const dealt: MotifCard[] = [];
  const step = 5;
  for (let i = 0; i < cards.length; i += 1) {
    dealt.push(cards[(i * step) % cards.length]);
  }
  // 去重保护（步长与长度互质，理论上一定覆盖全部）
  return dealt.length === cards.length && new Set(dealt.map((c) => c.id)).size === cards.length
    ? dealt
    : cards;
}

// ---------------------------------------------------------------------------
// 丝路航线排序
// ---------------------------------------------------------------------------

export interface RouteStop {
  id: string;
  name: LocalizedText;
  note: LocalizedText;
}

/** 正确顺序：自北向南、自东向西 */
export const ROUTE_STOPS: RouteStop[] = [
  { id: 'hepu', name: l('合浦', 'Hepu'), note: l('汉代海路始发港，今属广西北海。', 'Han-era departure port, today in Beihai, Guangxi.') },
  { id: 'jiaxing', name: l('日南', 'Rinan'), note: l('汉日南郡，今越南中部沿海。', 'Han Rinan commandery, on the central Vietnamese coast.') },
  { id: 'funan', name: l('扶南', 'Funan'), note: l('湄公河三角洲的早期国家，今柬埔寨南部。', 'An early polity in the Mekong delta, in southern Cambodia.') },
  { id: 'malayu', name: l('马来半岛诸港', 'Malay Peninsula ports'), note: l('马六甲海峡北侧的中转港。', 'Transit ports north of the Strait of Malacca.') },
  { id: 'srivijaya', name: l('室利佛逝', 'Srivijaya'), note: l('苏门答腊的海上强国，控制海峡航运。', 'A maritime power in Sumatra controlling strait traffic.') },
  { id: 'tamralipti', name: l('耽摩栗底', 'Tamralipti'), note: l('孟加拉湾沿岸的印度港口。', 'A port on the Bay of Bengal coast.') },
];
