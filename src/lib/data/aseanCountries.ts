/**
 * 东盟十国国家档案
 * ASEAN country profiles
 *
 * 数据只用于展陈叙事：地理/文化事实取自公开资料，
 * 「与广西的关联」一栏是展陈解读，不构成贸易建议。
 *
 * 多语言策略：本文件为「数据型文案」，结构是 { zh, en }。
 * 其他语言优先取同语种字段（若后续补充），否则回落英文（东盟通用工作语言），
 * 因此这里不经过 i18n 字典层，见 localized()。
 */

import type { Locale } from '@/i18n/config';

export interface LocalizedText {
  zh: string;
  en: string;
  vi?: string;
  th?: string;
  id?: string;
  ms?: string;
  my?: string;
  lo?: string;
  km?: string;
  tl?: string;
}

export interface CountryHighlight {
  title: LocalizedText;
  desc: LocalizedText;
  /** public/images/asean 或 public/images/culture 下的文件名（不含扩展名），留空则不显示图 */
  image?: string;
}

export interface UnescoEntry {
  name: LocalizedText;
  year: number;
  /** 文化遗产 / 非物质文化遗产 */
  type: 'world' | 'intangible';
  desc: LocalizedText;
}

export interface CountryProfile {
  code: string;
  name: LocalizedText;
  officialName: LocalizedText;
  capital: LocalizedText;
  language: LocalizedText;
  currency: LocalizedText;
  population: string;
  flagColors: [string, string, string];
  tagline: LocalizedText;
  intro: LocalizedText;
  heroImage: string;
  highlights: CountryHighlight[];
  unesco: UnescoEntry[];
  festivals: { name: LocalizedText; time: LocalizedText; desc: LocalizedText }[];
  cuisine: LocalizedText[];
  etiquette: LocalizedText[];
  /** 与广西的关联（展陈解读） */
  guangxiLink: LocalizedText;
}

/**
 * 按当前语言取数据型文案。
 * 有本语种就用本语种；否则中文页面用中文、其他语言用英文。
 */
export function localized(value: LocalizedText, locale: Locale): string {
  const direct = value[locale];
  if (direct) return direct;
  return locale === 'zh' ? value.zh : value.en;
}

const t = (zh: string, en: string, extra?: Partial<LocalizedText>): LocalizedText => ({
  zh,
  en,
  ...extra,
});

export const ASEAN_COUNTRY_CODES = [
  'thailand',
  'vietnam',
  'indonesia',
  'malaysia',
  'singapore',
  'philippines',
  'cambodia',
  'laos',
  'myanmar',
  'brunei',
] as const;

export type AseanCountryCode = (typeof ASEAN_COUNTRY_CODES)[number];

export function isAseanCountryCode(value: string): value is AseanCountryCode {
  return (ASEAN_COUNTRY_CODES as readonly string[]).includes(value);
}

/** 展厅原有的三国档案（其余七国见 aseanCountriesRest.ts） */
export const ASEAN_COUNTRIES_DATA: Record<'thailand' | 'vietnam' | 'indonesia', CountryProfile> = {
  thailand: {
    code: 'thailand',
    name: t('泰国', 'Thailand', { th: 'ประเทศไทย', vi: 'Thái Lan', id: 'Thailand', ms: 'Thailand' }),
    officialName: t('泰王国', 'Kingdom of Thailand'),
    capital: t('曼谷', 'Bangkok', { th: 'กรุงเทพมหานคร' }),
    language: t('泰语', 'Thai', { th: 'ภาษาไทย' }),
    currency: t('泰铢（THB）', 'Thai baht (THB)'),
    population: '≈ 71.7 M',
    flagColors: ['#A51931', '#F4F5F8', '#2D2A4A'],
    tagline: t('微笑之国 · 佛教文化', 'Land of Smiles · Buddhist culture'),
    intro: t(
      '泰国位于中南半岛中部，是东南亚重要的农业与旅游经济体。上座部佛教塑造了城镇格局、节庆节奏与日常礼仪；湄南河三角洲的稻作传统则孕育了冬阴功、绿咖喱等酸辣鲜明的饮食体系。',
      'Thailand sits at the centre of mainland Southeast Asia and is one of the region’s major agricultural and tourism economies. Theravada Buddhism shapes its towns, festival calendar and daily etiquette, while rice farming on the Chao Phraya delta produced a bright, sour-and-spicy cuisine.'
    ),
    heroImage: 'thailand-grand-palace',
    highlights: [
      {
        title: t('大皇宫与玉佛寺', 'Grand Palace & Wat Phra Kaew'),
        desc: t(
          '曼谷却克里王朝的王宫建筑群，1782 年始建。金顶、琉璃瓦与回廊壁画共同构成泰式宫廷建筑的教科书式样本。',
          'Founded in 1782, the Chakri dynasty’s royal compound in Bangkok is a textbook of Thai court architecture: gilded spires, glazed tiles and narrative murals along the cloisters.'
        ),
        image: 'thailand-grand-palace',
      },
      {
        title: t('宋干节（泼水节）', 'Songkran'),
        desc: t(
          '每年 4 月 13–15 日的泰历新年。以清水浴佛、向长辈行洒水礼为传统，街头泼水是后来的民俗延伸。2023 年列入 UNESCO 人类非遗。',
          'The Thai New Year, 13–15 April. Pouring scented water over Buddha images and elders is the traditional core; the street water fights are a later folk extension. Inscribed by UNESCO in 2023.'
        ),
        image: 'thailand-songkran',
      },
      {
        title: t('泰拳（Muay Thai）', 'Muay Thai'),
        desc: t(
          '被称为「八肢艺术」，允许拳、腿、膝、肘并用。赛前拜师舞（Wai Khru）保留了仪式性的尊重表达。',
          'Known as the “art of eight limbs”, using fists, kicks, knees and elbows. The pre-fight Wai Khru dance preserves a ritual language of respect.'
        ),
        image: 'thailand-muaythai',
      },
      {
        title: t('泰式按摩（Nuad Thai）', 'Nuad Thai massage'),
        image: 'thailand-massage',
        desc: t(
          '以拉伸与按压经络为主，2019 年列入 UNESCO 非遗名录。与中医推拿同属「以手为器」的身体知识体系。',
          'A bodywork tradition of stretching and pressure along energy lines, inscribed by UNESCO in 2019.'
        ),
      },
    ],
    unesco: [
      {
        name: t('大城府历史城', 'Historic City of Ayutthaya'),
        year: 1991,
        type: 'world',
        desc: t(
          '1350–1767 年阿瑜陀耶王朝都城，湄南河畔的砖塔与佛寺遗迹见证了东南亚最重要的贸易都会之一。',
          'Capital of the Ayutthaya Kingdom from 1350 to 1767; its brick prangs and temple ruins mark one of Southeast Asia’s great trading cities.'
        ),
      },
      {
        name: t('素可泰历史城镇', 'Historic Town of Sukhothai'),
        year: 1991,
        type: 'world',
        desc: t(
          '13–15 世纪素可泰王朝都城，泰文字母与「行走佛」造像在此定型。',
          'Capital of the Sukhothai Kingdom in the 13th–15th centuries, where the Thai script and the walking Buddha image took form.'
        ),
      },
      {
        name: t('宋干节', 'Songkran in Thailand'),
        year: 2023,
        type: 'intangible',
        desc: t('泰历新年的洒水礼，象征净化与祝福。', 'The water-pouring rite of the Thai New Year, a gesture of purification and blessing.'),
      },
      {
        name: t('孔剧（Khon）', 'Khon masked dance drama'),
        year: 2018,
        type: 'intangible',
        desc: t('源于《罗摩衍那》泰文改编本《拉玛坚》的宫廷面具舞剧。', 'Court masked dance drama based on the Ramakien, the Thai Ramayana.'),
      },
    ],
    festivals: [
      {
        name: t('宋干节', 'Songkran'),
        time: t('4 月 13–15 日', '13–15 April'),
        desc: t('浴佛、洒水、家庭团聚，是泰历新年。', 'Bathing Buddha images, pouring water and family reunions mark the Thai New Year.'),
      },
      {
        name: t('水灯节', 'Loi Krathong'),
        time: t('泰历十二月满月（多为 11 月）', 'Full moon of the 12th lunar month (usually November)'),
        desc: t('以香蕉叶折成水灯放入河面，寄托祛除厄运的愿望。', 'Banana-leaf floats are set on rivers carrying away misfortune.'),
      },
    ],
    cuisine: [
      t('冬阴功汤：香茅、南姜、青柠与辣椒构成的酸辣底味。', 'Tom yum: lemongrass, galangal, lime and chilli build a sour-hot base.'),
      t('绿咖喱：椰浆调和辣度，配茉莉香米。', 'Green curry: coconut milk softens the heat, served with jasmine rice.'),
      t('芒果糯米饭：椰浆糯米配熟芒果，是季节性甜点代表。', 'Mango sticky rice: coconut-soaked glutinous rice with ripe mango.'),
    ],
    etiquette: [
      t('见面行合十礼，双手位置越高表示越尊敬。', 'Greet with a wai — the higher the hands, the greater the respect.'),
      t('头部被视为神圣，不要随意触碰他人头顶。', 'The head is sacred; avoid touching anyone’s head.'),
      t('进入佛寺需遮肩过膝，脱鞋并避免脚底朝向佛像。', 'Cover shoulders and knees in temples, remove shoes, and never point soles at a Buddha image.'),
    ],
    guangxiLink: t(
      '泰族与壮族同属侗台语族，语言同源、稻作与干栏式居住传统相近。广西的壮锦与泰北的织物纹样，都使用几何化的动植物母题。',
      'Tai and Zhuang peoples share the Kra-Dai language family, rice cultivation and stilt-house dwelling traditions. Zhuang brocade and northern Thai textiles both use geometric plant and animal motifs.'
    ),
  },

  vietnam: {
    code: 'vietnam',
    name: t('越南', 'Vietnam', { vi: 'Việt Nam' }),
    officialName: t('越南社会主义共和国', 'Socialist Republic of Vietnam'),
    capital: t('河内', 'Hanoi', { vi: 'Hà Nội' }),
    language: t('越南语', 'Vietnamese', { vi: 'Tiếng Việt' }),
    currency: t('越南盾（VND）', 'Vietnamese đồng (VND)'),
    population: '≈ 100 M',
    flagColors: ['#DA251D', '#FFFF00', '#DA251D'],
    tagline: t('奥黛飘逸 · 水上木偶', 'Graceful áo dài · water puppetry'),
    intro: t(
      '越南沿南海呈狭长分布，北部红河三角洲与南部湄公河三角洲是两大稻作核心。历史上深受汉字文化圈影响，又在近代形成拉丁化国语字，形成了独特的双层文化记忆。',
      'Stretching along the South China Sea, Vietnam’s two rice heartlands are the Red River delta in the north and the Mekong delta in the south. Centuries of Sinitic influence sit alongside the modern Latin-script quốc ngữ, giving the country a layered cultural memory.'
    ),
    heroImage: 'vietnam-aodai',
    highlights: [
      {
        title: t('奥黛（Áo dài）', 'Áo dài'),
        desc: t(
          '收腰长衫配宽腿长裤，两侧开衩至腰。20 世纪 30 年代河内画家阮吉祥改良后成为现代形制。',
          'A fitted tunic worn over wide trousers, slit at the waist. The modern cut was refined by Hanoi painter Nguyễn Cát Tường in the 1930s.'
        ),
        image: 'vietnam-aodai',
      },
      {
        title: t('水上木偶戏', 'Water puppetry'),
        desc: t(
          '起源于 11 世纪红河三角洲，演员立于水幕后以长杆操纵木偶，水面即舞台。它不属于 UNESCO 名录，但被越南列为国家级非遗。',
          'Originating in the 11th-century Red River delta, puppeteers stand behind a screen and move puppets on long poles, with water as the stage. It is national heritage in Vietnam, not a UNESCO inscription.'
        ),
        image: 'vietnam-water-puppetry',
      },
      {
        title: t('春节（Tết）', 'Tết'),
        desc: t(
          '越南最重要的传统节日，家家包方形粽（bánh chưng），以桃花、金桔装饰厅堂。',
          'The most important festival of the year: square sticky-rice cakes (bánh chưng) are boiled at home and peach blossom or kumquat decorates the house.'
        ),
        image: 'vietnam-tet',
      },
      {
        title: t('会安古城', 'Hoi An Ancient Town'),
        image: 'vietnam-hoian',
        desc: t(
          '15–19 世纪的海上丝绸与陶瓷贸易港，保留了越南、中国、日本建筑并置的街景。',
          'A 15th–19th century trading port for silk and ceramics, where Vietnamese, Chinese and Japanese building traditions stand side by side.'
        ),
      },
    ],
    unesco: [
      {
        name: t('顺化宫廷雅乐（Nhã nhạc）', 'Nhã nhạc court music of Huế'),
        year: 2008,
        type: 'intangible',
        desc: t(
          '阮朝宫廷礼仪音乐，是越南第一项列入 UNESCO 的非遗代表作。',
          'The ceremonial court music of the Nguyễn dynasty — Vietnam’s first UNESCO intangible heritage inscription.'
        ),
      },
      {
        name: t('西原锣钲文化空间', 'Space of gong culture in the Central Highlands'),
        year: 2008,
        type: 'intangible',
        desc: t('西原各族群以铜锣体系标记人生礼仪与农事周期。', 'Highland communities use bronze gong ensembles to mark life-cycle rites and the farming cycle.'),
      },
      {
        name: t('会安古城', 'Hoi An Ancient Town'),
        year: 1999,
        type: 'world',
        desc: t('保存完好的东南亚贸易港口城市。', 'A remarkably preserved Southeast Asian trading port.'),
      },
      {
        name: t('顺化古迹建筑群', 'Complex of Huế Monuments'),
        year: 1993,
        type: 'world',
        desc: t('阮朝皇城、陵寝与坛庙构成完整的都城体系。', 'The Nguyễn dynasty’s citadel, tombs and altars form a complete imperial capital ensemble.'),
      },
    ],
    festivals: [
      {
        name: t('春节（Tết Nguyên Đán）', 'Tết Nguyên Đán'),
        time: t('农历正月初一前后', 'Around the first day of the lunar year'),
        desc: t('祭祖、包粽、贴春联，与广西春节习俗高度相似。', 'Ancestor rites, sticky-rice cakes and red couplets — very close to Spring Festival customs in Guangxi.'),
      },
      {
        name: t('雄王忌日', 'Hùng Kings’ Commemoration'),
        time: t('农历三月初十', '10th day of the 3rd lunar month'),
        desc: t('祭祀传说中的越南立国之君，2012 年相关信仰列入 UNESCO 非遗。', 'Honouring the legendary founders of Vietnam; related beliefs were inscribed by UNESCO in 2012.'),
      },
    ],
    cuisine: [
      t('河粉（Phở）：牛骨清汤配米粉、香草与青柠。', 'Phở: clear beef broth with rice noodles, herbs and lime.'),
      t('春卷：米纸包裹鲜蔬或炸制，蘸鱼露。', 'Spring rolls: rice paper with fresh herbs or fried, served with nước chấm.'),
      t('滴漏咖啡：炼乳配深烘咖啡，源自法国殖民时期。', 'Cà phê sữa đá: drip coffee with condensed milk, a French colonial legacy.'),
    ],
    etiquette: [
      t('问候时微微欠身，商务场合常用双手递接名片。', 'Bow slightly when greeting; offer and receive cards with both hands in business settings.'),
      t('进寺庙、私宅需脱鞋，衣着避免过于暴露。', 'Remove shoes at temples and homes; dress modestly.'),
      t('餐桌上筷子不直插饭中，这一点与广西习俗一致。', 'Never stand chopsticks upright in rice — the same taboo holds in Guangxi.'),
    ],
    guangxiLink: t(
      '广西与越南陆海相邻，东兴、凭祥是主要陆路口岸。京族是中国唯一的海洋少数民族，聚居于防城港，其独弦琴与越南宫廷乐器的源流互为映照。',
      'Guangxi shares both land and sea borders with Vietnam; Dongxing and Pingxiang are the main crossings. The Jing (Kinh) people of Fangchenggang are China’s only maritime ethnic minority, and their single-string đàn bầu echoes Vietnamese court instruments.'
    ),
  },

  indonesia: {
    code: 'indonesia',
    name: t('印度尼西亚', 'Indonesia', { id: 'Indonesia' }),
    officialName: t('印度尼西亚共和国', 'Republic of Indonesia'),
    capital: t('雅加达（努山塔拉建设中）', 'Jakarta (Nusantara under development)'),
    language: t('印尼语', 'Indonesian', { id: 'Bahasa Indonesia' }),
    currency: t('印尼盾（IDR）', 'Indonesian rupiah (IDR)'),
    population: '≈ 280 M',
    flagColors: ['#CE1126', '#FFFFFF', '#CE1126'],
    tagline: t('万岛之国 · 蜡染艺术', 'Nation of islands · batik'),
    intro: t(
      '印度尼西亚由一万七千余座岛屿组成，横跨三个时区。爪哇的宫廷传统、苏门答腊的伊斯兰文化、巴厘的印度教社区与东部群岛的海洋贸易记忆，共同构成极其多元的文化图景。',
      'Indonesia spans more than 17,000 islands across three time zones. Javanese court traditions, Sumatran Islamic culture, Balinese Hindu communities and the maritime trade memories of the eastern islands together form an exceptionally plural cultural landscape.'
    ),
    heroImage: 'indonesia-borobudur',
    highlights: [
      {
        title: t('婆罗浮屠', 'Borobudur'),
        desc: t(
          '建于 8–9 世纪夏连特拉王朝，以九层立体曼荼罗结构层层上升，回廊浮雕总长约 2.5 公里。',
          'Built by the Sailendra dynasty in the 8th–9th century, it rises as a nine-level mandala; its narrative reliefs run about 2.5 km.'
        ),
        image: 'indonesia-borobudur',
      },
      {
        title: t('蜡染（Batik）', 'Batik'),
        desc: t(
          '以蜡防染的织物工艺，2009 年列入 UNESCO 非遗。爪哇宫廷纹样（如 Parang）曾与身份等级挂钩。',
          'A wax-resist textile craft inscribed by UNESCO in 2009. Certain Javanese patterns, such as parang, were once tied to social rank.'
        ),
        image: 'indonesia-batik',
      },
      {
        title: t('哇扬皮影（Wayang Kulit）', 'Wayang kulit'),
        desc: t(
          '爪哇与巴厘的皮影戏，演出通宵达旦，以《摩诃婆罗多》《罗摩衍那》为脚本，操偶师兼作叙述者。',
          'Shadow puppetry of Java and Bali. Performances run all night, drawing on the Mahabharata and Ramayana, with the puppeteer as narrator.'
        ),
        image: 'indonesia-wayang',
      },
      {
        title: t('甘美兰（Gamelan）', 'Gamelan'),
        image: 'indonesia-gamelan',
        desc: t(
          '以铜排琴、锣与鼓组成的合奏体系，采用五声或七声调式，2021 年列入 UNESCO 非遗。',
          'A bronze-keyed ensemble of metallophones, gongs and drums using five- or seven-tone tuning, inscribed by UNESCO in 2021.'
        ),
      },
    ],
    unesco: [
      {
        name: t('婆罗浮屠寺庙群', 'Borobudur Temple Compounds'),
        year: 1991,
        type: 'world',
        desc: t('世界最大的佛教建筑群之一。', 'One of the largest Buddhist monuments in the world.'),
      },
      {
        name: t('普兰巴南寺庙群', 'Prambanan Temple Compounds'),
        year: 1991,
        type: 'world',
        desc: t('9 世纪印度教神庙群，主塔高约 47 米。', 'A 9th-century Hindu temple complex whose main spire rises about 47 m.'),
      },
      {
        name: t('印尼蜡染', 'Indonesian Batik'),
        year: 2009,
        type: 'intangible',
        desc: t('爪哇蜡染的技艺与象征体系。', 'The technique and symbolic system of Javanese batik.'),
      },
      {
        name: t('哇扬木偶戏', 'Wayang puppet theatre'),
        year: 2003,
        type: 'intangible',
        desc: t('印尼皮影与木偶戏的统称。', 'The umbrella tradition of Indonesian shadow and rod puppet theatre.'),
      },
    ],
    festivals: [
      {
        name: t('开斋节（Lebaran）', 'Idul Fitri (Lebaran)'),
        time: t('伊斯兰历十月一日', '1 Shawwal in the Islamic calendar'),
        desc: t('返乡（mudik）、家庭祈祷与互致歉意。', 'Homecoming (mudik), family prayers and mutual forgiveness.'),
      },
      {
        name: t('巴厘静居日（Nyepi）', 'Nyepi'),
        time: t('巴厘历新年（多为 3 月）', 'Balinese new year (usually March)'),
        desc: t('全岛停止活动、熄灯静默二十四小时。', 'The island falls silent for 24 hours — no travel, no lights, no work.'),
      },
    ],
    cuisine: [
      t('炒饭（Nasi goreng）：甜酱油与虾酱调味的国民料理。', 'Nasi goreng: fried rice seasoned with sweet soy and shrimp paste.'),
      t('仁当牛肉：椰浆与香料慢炖至收汁。', 'Rendang: beef slow-cooked in coconut milk and spices until nearly dry.'),
      t('沙嗲：炭烤串配花生酱。', 'Satay: charcoal-grilled skewers with peanut sauce.'),
    ],
    etiquette: [
      t('用右手递接物品，左手被视为不洁。', 'Use the right hand to give and receive; the left is considered impolite.'),
      t('进入清真寺需脱鞋，女性佩戴头巾。', 'Remove shoes at mosques; women should cover their hair.'),
      t('称呼他人时常用尊称（Bapak/Ibu），而非直呼其名。', 'Address people with honorifics such as Bapak or Ibu rather than first names.'),
    ],
    guangxiLink: t(
      '印尼是广西在东盟的重要贸易伙伴，钦州港与雅加达之间开通了集装箱直航。广西的铝加工、农机与印尼的棕榈油、镍矿形成互补。',
      'Indonesia is a major ASEAN trading partner for Guangxi; direct container services link Qinzhou port and Jakarta. Guangxi aluminium processing and agricultural machinery complement Indonesian palm oil and nickel.'
    ),
  },
};
