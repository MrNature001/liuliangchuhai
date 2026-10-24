/**
 * 数字遗产：文物档案数据
 * Digital Heritage artifact catalogue
 *
 * 数据只描述公开可考的文物类型与年代背景，不虚构馆藏编号或出土地点细节。
 * 图片来源均为站内已有的实拍照片或自绘图版，见 /[locale]/credits。
 */

import type { LocalizedText } from './aseanCountries';

export type ArtifactCategory =
  | 'bronze'
  | 'textile'
  | 'pottery'
  | 'architecture'
  | 'rockart'
  | 'instrument'
  | 'festival'
  | 'asean';

export type ArtifactEra = 'prehistoric' | 'han-tang' | 'song-ming' | 'qing-modern' | 'contemporary';

export interface Artifact {
  id: string;
  name: LocalizedText;
  /** 类别，对应筛选按钮 */
  category: ArtifactCategory;
  era: ArtifactEra;
  /** 地区/族群 */
  origin: LocalizedText;
  material: LocalizedText;
  /** 年代范围（文本，避免给出无法证实的精确年份） */
  period: LocalizedText;
  /** 2–3 句说明 */
  description: LocalizedText;
  /** 图版说明：这张图拍的是什么 */
  imageCaption: LocalizedText;
  /** public/images/culture 下的文件名 */
  image: string;
  /** 是否有三维模型（目前仅铜鼓） */
  has3d?: boolean;
  /** 站内可玩的对应小游戏 */
  playPath?: string;
  /** 尺寸（可考的部分；不确定时写「馆藏记录不一」） */
  size?: LocalizedText;
}

const l = (zh: string, en: string): LocalizedText => ({ zh, en });

export const ARTIFACT_CATEGORIES: { key: ArtifactCategory; label: LocalizedText; labelEn: string }[] = [
  { key: 'bronze', label: l('青铜', 'Bronze'), labelEn: 'Bronze' },
  { key: 'textile', label: l('织锦', 'Textile'), labelEn: 'Textile' },
  { key: 'pottery', label: l('陶瓷', 'Ceramics'), labelEn: 'Ceramics' },
  { key: 'architecture', label: l('建筑', 'Architecture'), labelEn: 'Architecture' },
  { key: 'rockart', label: l('岩画', 'Rock art'), labelEn: 'Rock art' },
  { key: 'instrument', label: l('乐器', 'Instrument'), labelEn: 'Instrument' },
  { key: 'festival', label: l('节俗', 'Festival'), labelEn: 'Festival' },
  { key: 'asean', label: l('东盟', 'ASEAN'), labelEn: 'ASEAN' },
];

export const ARTIFACT_ERAS: { key: ArtifactEra; label: LocalizedText }[] = [
  { key: 'prehistoric', label: l('史前至先秦', 'Prehistoric') },
  { key: 'han-tang', label: l('汉唐', 'Han–Tang') },
  { key: 'song-ming', label: l('宋明', 'Song–Ming') },
  { key: 'qing-modern', label: l('清代至近代', 'Qing–modern') },
  { key: 'contemporary', label: l('当代', 'Contemporary') },
];

export const ARTIFACTS: Artifact[] = [
  {
    id: 'bronze-drum',
    name: l('铜鼓', 'Bronze drum'),
    category: 'bronze',
    era: 'han-tang',
    origin: l('广西、云南、越南北部', 'Guangxi, Yunnan and northern Vietnam'),
    material: l('青铜', 'Bronze'),
    period: l('战国至东汉为盛', 'Flourished from the Warring States to the Eastern Han'),
    description: l(
      '鼓面中心为太阳芒纹，外环绕同心弦纹与云雷纹，鼓身常铸蛙饰与巡游纹。铜鼓既是礼器也是权力象征，铸造一次往往需要集合多个村社的铜料。',
      'A sunburst at the centre is surrounded by concentric bands and cloud-thunder motifs; the body often carries frog and procession figures. Casting a drum required pooling copper from several communities, so the object doubled as a statement of authority.'
    ),
    imageCaption: l(
      '铜鼓鼓面实拍：太阳纹与同心弦纹清晰可辨。',
      'Photograph of a bronze drum face: the sunburst and concentric bands are clearly legible.'
    ),
    image: 'bronze-drum',
    has3d: true,
    size: l('各馆藏记录不一，常见鼓面直径 50–80 厘米', 'Documented drum faces commonly range 50–80 cm in diameter'),
  },
  {
    id: 'zhuangjin',
    name: l('壮锦', 'Zhuang brocade'),
    category: 'textile',
    era: 'song-ming',
    origin: l('广西靖西、忻城、宾阳一带', 'Jingxi, Xincheng and Binyang in Guangxi'),
    material: l('棉经丝纬', 'Cotton warp, silk weft'),
    period: l('宋代见于文献，明清盛产', 'Recorded in Song sources, widely produced in Ming–Qing'),
    description: l(
      '以细密的棉线作经、五色丝线作纬，纬线起花形成菱形、万字、回纹与动植物母题。壮锦与云锦、蜀锦、宋锦并称中国四大名锦，2013 年列入国家级非遗扩展名录。',
      'Fine cotton warp with a five-colour silk weft creates the pattern: lozenges, wan-characters, meander bands and animal motifs. Zhuang brocade is counted among China’s four famous brocades and was added to the national intangible heritage list in 2013.'
    ),
    imageCaption: l(
      '壮锦织物实拍：横带分层的复合几何纹样。',
      'Photograph of woven Zhuang brocade: layered geometric bands separated by horizontal stripes.'
    ),
    image: 'zhuangjin-diamond',
  },
  {
    id: 'huashan-rock-art',
    name: l('左江花山岩画', 'Zuojiang Huashan rock art'),
    category: 'rockart',
    era: 'prehistoric',
    origin: l('广西宁明、龙州等左江流域', 'The Zuo River basin, including Ningming and Longzhou'),
    material: l('崖壁赭红颜料', 'Ochre pigment on limestone cliffs'),
    period: l('战国至东汉', 'Warring States to Eastern Han'),
    description: l(
      '崖面上以赤铁矿粉调和动物胶绘制的人形、铜鼓、犬与刀剑图像，人物多作蹲踞、双手上举。2016 年以「广西左江花山岩画文化景观」列入世界遗产。',
      'Figures, drums, dogs and weapons painted in iron-oxide pigment on limestone. Human figures squat with arms raised — a pose linked to ritual dance. Inscribed as the Zuojiang Huashan Rock Art Cultural Landscape in 2016.'
    ),
    imageCaption: l('花山岩画临江崖壁实拍。', 'Photograph of the painted cliff face above the Zuo River.'),
    image: 'huashan-rock-art',
  },
  {
    id: 'stilt-house',
    name: l('干栏式建筑', 'Stilt house (ganlan)'),
    category: 'architecture',
    era: 'qing-modern',
    origin: l('桂北、桂西北侗族与壮族村寨', 'Dong and Zhuang villages in northern and northwestern Guangxi'),
    material: l('杉木、瓦', 'Fir timber and tile'),
    period: l('形制延续两千年，现存多为明清以来', 'The form is roughly two millennia old; surviving examples date mostly from the Ming–Qing onward'),
    description: l(
      '底层架空堆放农具与饲养牲畜，二层设火塘与起居空间。架空层可隔湿、通风、防洪，同时避免占用有限的平坝耕地。鼓楼与风雨桥是同一木构体系的公共延伸。',
      'The raised ground floor stores tools and livestock; the upper floor holds the hearth and living rooms. Elevation keeps out damp, floods and pests while sparing scarce flat farmland. Drum towers and covered bridges extend the same timber system into public architecture.'
    ),
    imageCaption: l('侗寨吊脚楼群与鼓楼实拍。', 'Photograph of a Dong village of stilt houses and its drum tower.'),
    image: 'stilt-house',
  },
  {
    id: 'embroidery-ball',
    name: l('绣球', 'Embroidered ball'),
    category: 'festival',
    era: 'qing-modern',
    origin: l('广西靖西、那坡等壮族地区', 'Zhuang areas such as Jingxi and Napo'),
    material: l('绸布、丝线、流苏', 'Silk cloth, thread and tassels'),
    period: l('清代以来见于记载', 'Documented from the Qing period'),
    description: l(
      '以十二瓣绸布缝合为球体，瓣面绣花鸟纹样，下缀流苏。三月三歌圩上抛绣球既是竞技也是择偶习俗，今天更多作为表演与文创载体。',
      'Twelve cloth petals are sewn into a sphere, embroidered with birds and flowers and finished with tassels. Tossing the ball at Sanyuesan song fairs was both a game and a courtship custom; today it survives mainly as performance and craft.'
    ),
    imageCaption: l('本站自绘的绣球图版（未使用实拍照片）。', '本站自绘的绣球图版。'),
    image: 'embroidery-ball',
    playPath: '/interactive#games',
  },
  {
    id: 'nixing',
    name: l('钦州坭兴陶', 'Qinzhou Nixing pottery'),
    category: 'pottery',
    era: 'qing-modern',
    origin: l('广西钦州', 'Qinzhou, Guangxi'),
    material: l('钦江东西岸陶土', 'Clays from the east and west banks of the Qin River'),
    period: l('清咸丰年间兴盛', 'Rose to prominence in the Xianfeng reign of the Qing'),
    description: l(
      '以东泥与西泥按比例混合，不上釉，靠窑变产生朱红、紫红等色泽，再以刀在坯体上刻字画。与宜兴紫砂、云南建水陶、四川荣昌陶并称中国四大名陶。',
      'East-bank and west-bank clays are blended and fired without glaze; kiln variation yields vermilion and purple-red tones, and decoration is carved into the body. It is counted among China’s four famous pottery traditions.'
    ),
    imageCaption: l('广西陶器实拍（考古出土器物）。', 'Photograph of excavated Guangxi ceramics.'),
    image: 'guangxi-city',
  },
  {
    id: 'silk-road-ship',
    name: l('海上丝路的中式帆船', 'Chinese junk of the maritime silk road'),
    category: 'architecture',
    era: 'han-tang',
    origin: l('合浦、徐闻启航，经东南亚至印度洋', 'Departing Hepu and Xuwen for the Indian Ocean via Southeast Asia'),
    material: l('木、帆布', 'Timber and sailcloth'),
    period: l('汉代开辟，宋元鼎盛', 'Opened in the Han, peaked in Song–Yuan'),
    description: l(
      '汉代文献记载自合浦、徐闻出海，经都元、邑卢没等国抵达黄支。合浦汉墓出土的琉璃、玛瑙与香料，是这条航线最直接的物证。',
      'Han texts record voyages from Hepu and Xuwen through Southeast Asian polities to Kanchipuram. Glass, agate and aromatics from Hepu tombs are the route’s most direct material evidence.'
    ),
    imageCaption: l('红帆中式帆船与港口天际线实拍。', 'Photograph of a red-sailed junk against a harbour skyline.'),
    image: 'silk-road-sea',
  },
  {
    id: 'festival-costume',
    name: l('壮族节庆服饰', 'Zhuang festival dress'),
    category: 'festival',
    era: 'contemporary',
    origin: l('广西壮族聚居区', 'Zhuang communities across Guangxi'),
    material: l('土布、壮锦镶边、银饰', 'Homespun cloth, brocade trim and silver ornaments'),
    period: l('当代仍在穿戴', 'Still worn today'),
    description: l(
      '以蓝靛染制的土布为底，襟口、袖口与裙摆镶壮锦或刺绣花边；盛装时佩戴银项圈、银镯。服饰纹样与壮锦母题同源，是移动的纹样档案。',
      'Indigo-dyed homespun cloth is trimmed at the collar, cuffs and hem with brocade or embroidery; silver neck rings and bracelets complete the festival ensemble. The motifs share a vocabulary with brocade, making dress a portable pattern archive.'
    ),
    imageCaption: l('民族节庆服饰实拍。', 'Photograph of ethnic festival dress.'),
    image: 'festival',
  },
  {
    id: 'archives',
    name: l('地方文献与古籍', 'Local archives and rare books'),
    category: 'pottery',
    era: 'song-ming',
    origin: l('广西地方志与族谱', 'Guangxi gazetteers and genealogies'),
    material: l('纸、墨', 'Paper and ink'),
    period: l('明清方志为主', 'Mostly Ming–Qing gazetteers'),
    description: l(
      '地方志记录了物产、风俗与族群分布，是研究壮锦、铜鼓与歌圩最重要的文字旁证。数字化后的方志可按地名与物产检索。',
      'Gazetteers record local products, customs and ethnic distribution — the most important textual corroboration for brocade, bronze drums and song fairs. Digitised editions can be searched by place name and product.'
    ),
    imageCaption: l('古籍数字化工作现场实拍。', 'Photograph of a digitisation workstation with rare books.'),
    image: 'archives',
  },
  {
    id: 'ink-painting',
    name: l('水墨山水与桂林题咏', 'Ink landscape and Guilin poems'),
    category: 'rockart',
    era: 'song-ming',
    origin: l('桂林摩崖石刻与文人画', 'Guilin cliff inscriptions and literati painting'),
    material: l('纸本水墨、摩崖', 'Ink on paper; carved cliff inscriptions'),
    period: l('宋至清', 'Song to Qing'),
    description: l(
      '桂林诸山崖壁留有自唐以来的摩崖石刻两千余件，题咏与山水画共同塑造了「桂林山水甲天下」的文化意象。',
      'Guilin’s cliffs carry more than two thousand inscriptions from the Tang onward; poems and landscape painting together built the cultural image of Guilin as the finest landscape under heaven.'
    ),
    imageCaption: l('中国水墨山水实拍。', 'Photograph of a Chinese ink landscape painting.'),
    image: 'ink-painting',
  },
  {
    id: 'asean-angkor',
    name: l('吴哥窟', 'Angkor Wat'),
    category: 'asean',
    era: 'song-ming',
    origin: l('柬埔寨暹粒', 'Siem Reap, Cambodia'),
    material: l('砂岩、红土砖', 'Sandstone and laterite'),
    period: l('12 世纪', '12th century'),
    description: l(
      '苏耶跋摩二世兴建的毗湿奴神庙，后转为佛寺。外垣与回廊浮雕构成完整的宇宙图式，1992 年列入世界遗产。',
      'A Vishnu temple built by Suryavarman II and later converted to Buddhist use. Its enclosure and gallery reliefs form a complete cosmological scheme; inscribed in 1992.'
    ),
    imageCaption: l('吴哥窟实拍。', 'Photograph of Angkor Wat.'),
    image: 'asean-culture',
  },
];

export const ARTIFACT_BY_ID: Record<string, Artifact> = Object.fromEntries(
  ARTIFACTS.map((a) => [a.id, a])
);
