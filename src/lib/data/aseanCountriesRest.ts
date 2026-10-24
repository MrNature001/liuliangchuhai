/**
 * 东盟十国档案（续）：马来西亚、新加坡、菲律宾、柬埔寨、老挝、缅甸、文莱
 * ASEAN country profiles (continued)
 */

import type { CountryProfile } from './aseanCountries';

const t = (zh: string, en: string, extra?: Record<string, string>) => ({
  zh,
  en,
  ...extra,
});

export const REST_PROFILES: Record<string, CountryProfile> = {
  malaysia: {
    code: 'malaysia',
    name: t('马来西亚', 'Malaysia', { ms: 'Malaysia' }),
    officialName: t('马来西亚联邦', 'Federation of Malaysia'),
    capital: t('吉隆坡', 'Kuala Lumpur'),
    language: t('马来语（国语）、英语', 'Malay (official), English'),
    currency: t('林吉特（MYR）', 'Ringgit (MYR)'),
    population: '≈ 34 M',
    flagColors: ['#CC0001', '#FFFFFF', '#010066'],
    tagline: t('多元族群 · 南洋味道', 'Plural society · Nanyang flavours'),
    intro: t(
      '马来西亚由马来半岛与婆罗洲北部的沙巴、砂拉越组成，马来人、华人、印度人三大族群与伊班、卡达山等原住民族共同构成社会肌理。饮食与建筑因此呈现高度叠加的样貌。',
      'Malaysia spans the Malay Peninsula and Sabah and Sarawak on Borneo. Malay, Chinese and Indian communities alongside Iban, Kadazan-Dusun and other indigenous peoples give the country a deeply layered food and architectural landscape.'
    ),
    heroImage: 'malaysia',
    highlights: [
      {
        title: t('吉隆坡双子塔', 'Petronas Twin Towers'),
        desc: t(
          '1998 年建成的 88 层双塔，高 452 米，以伊斯兰几何母题组织平面，曾是世界最高建筑。',
          'Completed in 1998, the 88-storey twin towers rise 452 m and organise their plan around Islamic geometric motifs.'
        ),
        image: 'malaysia',
      },
      {
        title: t('槟城乔治市', 'George Town, Penang'),
        image: 'malaysia-georgetown',
        desc: t(
          '1786 年开埠的海峡殖民地港口，骑楼、宗祠与清真寺并置，2008 年与马六甲共同列入世界遗产。',
          'A Straits Settlements port founded in 1786 where shophouses, clan halls and mosques stand together; inscribed jointly with Melaka in 2008.'
        ),
      },
      {
        title: t('马来武术（Silat）', 'Silat'),
        image: 'malaysia-silat',
        desc: t(
          '东南亚群岛的格斗体系，讲究步伐与马来短剑（kris）配合，2019 年列入 UNESCO 非遗。',
          'An archipelagic martial art of footwork and weapon work (notably the kris), inscribed by UNESCO in 2019.'
        ),
      },
      {
        title: t('二十四节令鼓', '24 Festive Drums'),
        image: 'malaysia-drums',
        desc: t(
          '1988 年由马来西亚华人陈徽崇、陈再藩创立，以二十四节气命名，2009 年列为马来西亚国家文化遗产。',
          'Created in 1988 by Malaysian Chinese artists Tan Hooi Song and Tan Chai Puan, named after the 24 solar terms and declared national heritage in 2009.'
        ),
      },
    ],
    unesco: [
      {
        name: t('马六甲与乔治市历史城市', 'Melaka and George Town'),
        year: 2008,
        type: 'world',
        desc: t(
          '海峡殖民地的多元建筑与文化沉积。',
          'Multicultural architecture and cultural layering of the Straits Settlements.'
        ),
      },
      {
        name: t('京那巴鲁山公园', 'Kinabalu Park'),
        year: 2000,
        type: 'world',
        desc: t('婆罗洲最高峰周边的山地生态。', 'Montane ecosystems around Borneo’s highest peak.'),
      },
      {
        name: t('马来武术', 'Silat'),
        year: 2019,
        type: 'intangible',
        desc: t('马来世界的格斗与仪式体系。', 'A martial and ceremonial tradition of the Malay world.'),
      },
    ],
    festivals: [
      {
        name: t('开斋节', 'Hari Raya Aidilfitri'),
        time: t('伊斯兰历十月一日', '1 Shawwal'),
        desc: t('「开放门户」待客传统，各族群互访。', 'The open-house tradition invites neighbours of every community.'),
      },
      {
        name: t('卫塞节', 'Wesak Day'),
        time: t('农历四月十五', 'Full moon of the 4th lunar month'),
        desc: t('纪念佛陀诞生、成道与涅槃。', 'Marks the Buddha’s birth, enlightenment and passing.'),
      },
    ],
    cuisine: [
      t('椰浆饭（Nasi lemak）：椰浆煮饭配参巴酱、江鱼仔与花生。', 'Nasi lemak: coconut rice with sambal, anchovies and peanuts.'),
      t('肉骨茶：药材与胡椒两种流派并存。', 'Bak kut teh: herbal and peppery schools coexist.'),
      t('拉茶（Teh tarik）：以「拉」出的泡沫决定口感。', 'Teh tarik: the “pulled” foam defines the texture.'),
    ],
    etiquette: [
      t('进入清真寺需脱鞋，女性遮盖头发与四肢。', 'Remove shoes at mosques; women cover hair and limbs.'),
      t('用右手进食与递物。', 'Eat and pass items with the right hand.'),
      t('指路时用拇指而非食指。', 'Point with the thumb rather than the index finger.'),
    ],
    guangxiLink: t(
      '马来西亚华人多祖籍福建、广东、广西，广西籍华侨曾在霹雳、彭亨一带从事矿业与农业。关丹港与钦州港的「两国双园」是广西与马来西亚合作的标志性项目。',
      'Many Malaysian Chinese trace their roots to Fujian, Guangdong and Guangxi. The “Two Countries, Twin Parks” link between Kuantan and Qinzhou is a flagship Guangxi–Malaysia project.'
    ),
  },

  singapore: {
    code: 'singapore',
    name: t('新加坡', 'Singapore'),
    officialName: t('新加坡共和国', 'Republic of Singapore'),
    capital: t('新加坡', 'Singapore'),
    language: t('英语、华语、马来语、泰米尔语', 'English, Mandarin, Malay, Tamil'),
    currency: t('新加坡元（SGD）', 'Singapore dollar (SGD)'),
    population: '≈ 6 M',
    flagColors: ['#EF3340', '#FFFFFF', '#EF3340'],
    tagline: t('花园城市 · 多元种族', 'Garden city · multiracial harmony'),
    intro: t(
      '新加坡是面积约 730 平方公里的城市国家，1965 年独立。华人、马来人、印度人与欧亚裔社区被规划为「组屋—邻里—市镇」的城市结构，小贩文化则成为共同生活的日常语言。',
      'A city-state of about 730 km² that became independent in 1965. Chinese, Malay, Indian and Eurasian communities are woven into an HDB town-and-neighbourhood structure, while hawker culture supplies the everyday common language.'
    ),
    heroImage: 'singapore',
    highlights: [
      {
        title: t('鱼尾狮与滨海湾', 'Merlion & Marina Bay'),
        desc: t(
          '鱼尾狮造型 1964 年由设计师弗雷泽·布伦纳为旅游局创作。滨海湾一带集中了填海造地与城市更新的当代样本。',
          'The Merlion was designed for the tourist board by Fraser Brunner in 1964. Marina Bay is a contemporary showcase of land reclamation and urban renewal.'
        ),
        image: 'singapore',
      },
      {
        title: t('小贩文化', 'Hawker culture'),
        image: 'singapore-hawker',
        desc: t(
          '熟食中心（hawker centre）是新加坡的公共餐厅，2020 年列入 UNESCO 非遗名录。',
          'The hawker centre is Singapore’s public dining room; hawker culture was inscribed by UNESCO in 2020.'
        ),
      },
      {
        title: t('土生文化（Peranakan）', 'Peranakan culture'),
        image: 'singapore-peranakan',
        desc: t(
          '早期华人移民与马来世界通婚形成的「峇峇娘惹」社群，留下瓷片装饰、娘惹菜与珠绣鞋。',
          'The Baba–Nyonya communities descended from early Chinese–Malay unions left a legacy of shard decoration, Nyonya cuisine and beaded slippers.'
        ),
      },
      {
        title: t('新加坡植物园', 'Singapore Botanic Gardens'),
        image: 'singapore-gardens',
        desc: t(
          '1859 年建立的赤道植物园，2015 年成为新加坡首项世界遗产。',
          'Founded in 1859, it became Singapore’s first World Heritage Site in 2015.'
        ),
      },
    ],
    unesco: [
      {
        name: t('新加坡植物园', 'Singapore Botanic Gardens'),
        year: 2015,
        type: 'world',
        desc: t('赤道地区热带植物的研究与展示中心。', 'A research and display centre for equatorial tropical plants.'),
      },
      {
        name: t('小贩文化', 'Hawker culture in Singapore'),
        year: 2020,
        type: 'intangible',
        desc: t('熟食中心里的社区餐饮实践。', 'Community dining practices in hawker centres.'),
      },
    ],
    festivals: [
      {
        name: t('农历新年', 'Chinese New Year'),
        time: t('农历正月初一', 'First day of the lunar year'),
        desc: t('牛车水年货市场与捞鱼生习俗。', 'The Chinatown market and the lo hei tossing ritual.'),
      },
      {
        name: t('屠妖节', 'Deepavali'),
        time: t('印度历七月（多为 10–11 月）', 'Usually October–November'),
        desc: t('小印度的灯饰与油灯仪式。', 'Lights and oil lamps across Little India.'),
      },
    ],
    cuisine: [
      t('海南鸡饭：源自海南文昌鸡，经南洋改良。', 'Hainanese chicken rice: Hainan Wenchang chicken, remade in Nanyang.'),
      t('辣椒螃蟹：以蛋花与辣椒酱汁包裹。', 'Chilli crab: egg-ribboned chilli sauce.'),
      t('叻沙：椰浆咖喱汤配粗米粉。', 'Laksa: coconut curry broth with thick rice noodles.'),
    ],
    etiquette: [
      t('熟食中心需自行归还餐盘。', 'Return your tray at hawker centres.'),
      t('地铁内禁止饮食。', 'Eating and drinking are banned on the MRT.'),
      t('公共场合排队是默认秩序。', 'Queuing is the default public order.'),
    ],
    guangxiLink: t(
      '新加坡是广西在东盟最重要的贸易与金融门户之一，中新互联互通项目南向通道经北部湾出海。钦州港与新加坡港之间有多条班轮航线。',
      'Singapore is one of Guangxi’s key ASEAN trade and finance gateways. The Southern Transport Corridor reaches the sea through Beibu Gulf, with liner services between Qinzhou and Singapore.'
    ),
  },

  philippines: {
    code: 'philippines',
    name: t('菲律宾', 'Philippines', { tl: 'Pilipinas' }),
    officialName: t('菲律宾共和国', 'Republic of the Philippines'),
    capital: t('马尼拉', 'Manila'),
    language: t('菲律宾语（他加禄语）、英语', 'Filipino (Tagalog), English'),
    currency: t('菲律宾比索（PHP）', 'Philippine peso (PHP)'),
    population: '≈ 114 M',
    flagColors: ['#0038A8', '#CE1126', '#FCD116'],
    tagline: t('七千岛屿 · 山地梯田', '7,000 islands · mountain terraces'),
    intro: t(
      '菲律宾由七千余座岛屿组成，北部吕宋岛的山地原住民族、中部米沙鄢群岛的海洋文化、南部棉兰老岛的伊斯兰社群共同构成多元底色。西班牙三百年殖民与美式教育留下语言与宗教的双重印记。',
      'The Philippines is an archipelago of more than 7,000 islands: highland indigenous peoples in Luzon, maritime cultures in the Visayas and Muslim communities in Mindanao. Three centuries of Spanish rule and American-era education left a double imprint of language and religion.'
    ),
    heroImage: 'philippines',
    highlights: [
      {
        title: t('伊富高梯田', 'Ifugao Rice Terraces'),
        desc: t(
          '吕宋岛北部海拔 1,500 米左右的山地梯田，由伊富高人世代以石墙与土埂修筑，已有约两千年历史。',
          'Mountain terraces around 1,500 m in northern Luzon, built with stone walls and earth bunds by the Ifugao over roughly two millennia.'
        ),
        image: 'philippines',
      },
      {
        title: t('竹竿舞（Tinikling）', 'Tinikling'),
        image: 'philippines-tinikling',
        desc: t(
          '舞者在开合的两根竹竿间跳跃，以节奏规避夹击，被视为菲律宾国民舞蹈。',
          'Dancers step between clapping bamboo poles, dodging the beat — widely regarded as the national dance.'
        ),
      },
      {
        title: t('吉普尼（Jeepney）', 'Jeepney'),
        image: 'philippines-jeepney',
        desc: t(
          '由二战后美军剩余吉普车改装而成的公共交通工具，彩绘车身成为街头文化符号。',
          'Public transport converted from surplus post-war jeeps; their painted bodies are a street-culture icon.'
        ),
      },
      {
        title: t('巴朗盖社区（Barangay）', 'Barangay'),
        image: 'placeholder',
        desc: t(
          '菲律宾最基层的社区单位，源自前殖民时期的船队聚落，至今仍是行政与社会组织的基础。',
          'The smallest community unit, descended from pre-colonial boat settlements and still the basis of local administration.'
        ),
      },
    ],
    unesco: [
      {
        name: t('菲律宾科迪勒拉山梯田', 'Rice Terraces of the Philippine Cordilleras'),
        year: 1995,
        type: 'world',
        desc: t('伊富高人的山地稻作景观。', 'The Ifugao mountain rice landscape.'),
      },
      {
        name: t('巴洛克教堂群', 'Baroque Churches of the Philippines'),
        year: 1993,
        type: 'world',
        desc: t('西班牙殖民时期在地化的教堂建筑。', 'Hispanic-era churches adapted to local conditions.'),
      },
      {
        name: t('伊富高呼德歌谣', 'Hudhud chants of the Ifugao'),
        year: 2001,
        type: 'intangible',
        desc: t('伴随稻作与葬仪的叙事吟唱。', 'Narrative chanting tied to rice ritual and funerary practice.'),
      },
    ],
    festivals: [
      {
        name: t('圣周', 'Semana Santa'),
        time: t('复活节前一周', 'Holy Week before Easter'),
        desc: t('天主教传统中最重要的年度仪式周期。', 'The most important annual ritual cycle in Filipino Catholic life.'),
      },
      {
        name: t('阿提阿提汉节', 'Ati-Atihan'),
        time: t('每年 1 月', 'Every January'),
        desc: t('卡利博的街头鼓乐与彩绘舞蹈。', 'Street drumming and painted dancing in Kalibo.'),
      },
    ],
    cuisine: [
      t('阿斗波（Adobo）：醋、蒜与酱油慢炖。', 'Adobo: braised with vinegar, garlic and soy.'),
      t('酸汤（Sinigang）：罗望子调酸的汤锅。', 'Sinigang: a tamarind-soured soup.'),
      t('烤乳猪（Lechon）：节庆核心菜。', 'Lechon: the centrepiece of any fiesta table.'),
    ],
    etiquette: [
      t('对长辈使用「po」「opo」表示敬意。', 'Use “po” and “opo” when speaking to elders.'),
      t('用餐常以手抓饭（kamayan）形式共享。', 'Hands-on shared eating (kamayan) is common.'),
      t('进屋脱鞋是普遍习惯。', 'Removing shoes at the door is standard.'),
    ],
    guangxiLink: t(
      '菲律宾与广西同处环南海海域，古代海上丝绸之路的陶瓷贸易把广西钦州坭兴陶与菲律宾出土的贸易瓷联系起来。当代合作以农业技术与热带水果贸易为重点。',
      'The Philippines and Guangxi share the South China Sea rim. The ancient maritime ceramic trade links Qinzhou Nixing pottery with trade wares excavated in the Philippines.'
    ),
  },

  cambodia: {
    code: 'cambodia',
    name: t('柬埔寨', 'Cambodia', { km: 'កម្ពុជា' }),
    officialName: t('柬埔寨王国', 'Kingdom of Cambodia'),
    capital: t('金边', 'Phnom Penh'),
    language: t('高棉语', 'Khmer'),
    currency: t('瑞尔（KHR），美元广泛流通', 'Riel (KHR); US dollars circulate widely'),
    population: '≈ 17 M',
    flagColors: ['#032EA1', '#E00025', '#FFFFFF'],
    tagline: t('吴哥古迹 · 高棉微笑', 'Angkor · the Khmer smile'),
    intro: t(
      '柬埔寨位于湄公河下游平原，9–15 世纪的高棉帝国在此营建了以吴哥为中心的巨大水利与寺庙体系。上座部佛教与宫廷舞蹈传统延续至今，洞里萨湖的季节性涨落塑造了稻作与渔业节律。',
      'Cambodia occupies the lower Mekong plain, where the Khmer Empire built an immense hydraulic and temple system centred on Angkor between the 9th and 15th centuries. Theravada Buddhism and court dance continue, and the seasonal rise and fall of Tonlé Sap shapes rice and fishing rhythms.'
    ),
    heroImage: 'cambodia',
    highlights: [
      {
        title: t('吴哥窟（Angkor Wat）', 'Angkor Wat'),
        desc: t(
          '12 世纪苏耶跋摩二世所建，供奉毗湿奴，后转为佛寺。外垣长约 1.5 公里，回廊浮雕描绘《摩诃婆罗多》与乳海搅拌。',
          'Built by Suryavarman II in the 12th century for Vishnu and later converted to Buddhist use. Its outer enclosure runs about 1.5 km; the galleries depict the Mahabharata and the Churning of the Ocean.'
        ),
        image: 'cambodia',
      },
      {
        title: t('阿普萨拉舞蹈（Apsara）', 'Apsara dance'),
        image: 'cambodia-apsara',
        desc: t(
          '源自吴哥浮雕中的天女形象，20 世纪由西索瓦·哥沙曼王后推动复兴，2003 年列入 UNESCO 非遗。',
          'Drawn from the celestial dancers of Angkor’s reliefs, revived in the 20th century under Queen Sisowath Kossamak and inscribed by UNESCO in 2003.'
        ),
      },
      {
        title: t('高棉丝绸（Hol）', 'Khmer silk (hol)'),
        image: 'cambodia-silk',
        desc: t(
          '以天然染料与织机脚踏提花工艺生产的丝绸，2004 年相关技艺列入非遗名录。',
          'Silk woven on treadle looms with natural dyes; related craftsmanship was inscribed in 2004.'
        ),
      },
      {
        title: t('洞里萨湖', 'Tonlé Sap'),
        image: 'cambodia-tonlesap',
        desc: t(
          '东南亚最大的淡水湖，雨季面积可扩大数倍，水上村落随水位迁徙。',
          'Southeast Asia’s largest freshwater lake, whose flooded area can expand severalfold each monsoon.'
        ),
      },
    ],
    unesco: [
      {
        name: t('吴哥古迹', 'Angkor'),
        year: 1992,
        type: 'world',
        desc: t('高棉帝国都城与寺庙群。', 'The capital and temple complex of the Khmer Empire.'),
      },
      {
        name: t('柏威夏寺', 'Temple of Preah Vihear'),
        year: 2008,
        type: 'world',
        desc: t('供奉湿婆的山巅神庙，11 世纪主体建筑。', 'A cliff-top Shiva temple whose main structure dates to the 11th century.'),
      },
      {
        name: t('柬埔寨皇家芭蕾', 'Royal Ballet of Cambodia'),
        year: 2003,
        type: 'intangible',
        desc: t('宫廷女性舞蹈传统。', 'The courtly female dance tradition.'),
      },
    ],
    festivals: [
      {
        name: t('送水节', 'Bon Om Touk'),
        time: t('佛历十二月满月（多为 11 月）', 'November full moon'),
        desc: t(
          '洞里萨湖逆流时举行龙舟赛，感谢河水带来鱼获。',
          'Boat races mark the reversal of the Tonlé Sap current and give thanks for the fish harvest.'
        ),
      },
      {
        name: t('高棉新年', 'Choul Chnam Thmey'),
        time: t('4 月中旬', 'Mid-April'),
        desc: t('堆沙塔、浴佛与家庭团聚。', 'Sand mounds, bathing Buddha images and family gatherings.'),
      },
    ],
    cuisine: [
      t('阿莫克鱼（Amok）：椰浆与柠檬草蒸鱼。', 'Amok: fish steamed in coconut milk and lemongrass.'),
      t('高棉红咖喱：比泰式咖喱更温和，不加椰浆也可。', 'Khmer red curry: milder than Thai curry.'),
      t('贡布胡椒：地理标志产品，白胡椒尤负盛名。', 'Kampot pepper: a protected geographical indication.'),
    ],
    etiquette: [
      t('合十礼（Sampeah）随对方身份调整手位高度。', 'Gauge the height of the sampeah greeting by the other person’s status.'),
      t('头部神圣、脚部低贱，避免触碰头部或用脚指物。', 'Never touch heads or point with a foot.'),
      t('进入寺庙需遮盖肩膝。', 'Cover shoulders and knees in temples.'),
    ],
    guangxiLink: t(
      '广西与柬埔寨在稻作、制糖与旅游开发上合作密切。中国—东盟博览会常设柬埔寨国家馆，吴哥古迹的保护修复中也有中国专家的参与。',
      'Guangxi cooperates closely with Cambodia on rice farming, sugar processing and tourism; Chinese experts have also taken part in Angkor conservation.'
    ),
  },

  laos: {
    code: 'laos',
    name: t('老挝', 'Laos', { lo: 'ລາວ' }),
    officialName: t('老挝人民民主共和国', 'Lao PDR'),
    capital: t('万象', 'Vientiane'),
    language: t('老挝语', 'Lao'),
    currency: t('基普（LAK）', 'Kip (LAK)'),
    population: '≈ 7.7 M',
    flagColors: ['#CE1126', '#002868', '#FFFFFF'],
    tagline: t('澜沧古国 · 佛塔之城', 'Lan Xang · city of stupas'),
    intro: t(
      '老挝是东南亚唯一的内陆国，湄公河干流纵贯全境。14 世纪澜沧王国以琅勃拉邦为都，上座部佛教与稻作村落构成社会基础，织锦与银器是重要的家庭工艺。',
      'Laos is Southeast Asia’s only landlocked country, threaded by the Mekong. The Lan Xang kingdom made Luang Prabang its capital in the 14th century; weaving and silversmithing remain key household crafts.'
    ),
    heroImage: 'laos',
    highlights: [
      {
        title: t('琅勃拉邦古城', 'Luang Prabang'),
        desc: t(
          '1995 年列入世界遗产，香通寺的低垂屋檐与「生命之树」镶嵌画是澜沧建筑的代表。',
          'Inscribed in 1995. Wat Xieng Thong’s sweeping low roofs and its Tree of Life mosaic exemplify Lan Xang architecture.'
        ),
        image: 'laos',
      },
      {
        title: t('清晨布施', 'Morning alms round'),
        image: 'laos-alms',
        desc: t(
          '僧侣列队沿街接受信众糯米饭，是老挝日常宗教生活的核心场景，需保持安静与适当距离。',
          'Monks walk in procession to receive sticky rice from lay people — a core daily ritual.'
        ),
      },
      {
        title: t('老挝丝绸与织锦', 'Lao silk and weaving'),
        image: 'laos-silk',
        desc: t(
          '家庭织机生产的筒裙（sinh）与仪式织物，纹样常以那伽（naga）与稻穗为主题。',
          'Household looms produce the sinh skirt and ceremonial textiles, often patterned with naga and rice motifs.'
        ),
      },
      {
        title: t('凯旋门（Patuxai）', 'Patuxai'),
        image: 'laos-patuxai',
        desc: t(
          '万象的地标拱门，1960 年代以水泥建成，装饰母题取自佛教与印度教神话。',
          'Vientiane’s monumental arch, built of concrete in the 1960s and decorated with Buddhist and Hindu motifs.'
        ),
      },
    ],
    unesco: [
      {
        name: t('琅勃拉邦古城', 'Town of Luang Prabang'),
        year: 1995,
        type: 'world',
        desc: t('澜沧王国都城与佛教建筑群。', 'The Lan Xang capital and its Buddhist architecture.'),
      },
      {
        name: t('瓦普寺', 'Vat Phou'),
        year: 2001,
        type: 'world',
        desc: t('湄公河畔的高棉风格湿婆神庙群。', 'A Khmer-style Shiva complex above the Mekong.'),
      },
      {
        name: t('老挝笙乐', 'Khaen music of Laos'),
        year: 2017,
        type: 'intangible',
        desc: t('以竹制笙（khaen）伴奏的即兴歌谣。', 'Improvised song accompanied by the bamboo khaen mouth organ.'),
      },
    ],
    festivals: [
      {
        name: t('泼水节（Pi Mai Lao）', 'Pi Mai Lao'),
        time: t('4 月中旬', 'Mid-April'),
        desc: t('浴佛、洒水、堆沙塔迎接新年。', 'Bathing Buddha images, pouring water and building sand stupas.'),
      },
      {
        name: t('出夏节', 'Boun Ok Phansa'),
        time: t('佛历十一月满月', 'Full moon of the 11th lunar month'),
        desc: t('雨季结束，湄公河上放水灯与龙舟。', 'The end of the rains, marked by floating lights and boat races.'),
      },
    ],
    cuisine: [
      t('糯米饭：以竹篓盛装，手捏取食，是老挝主食。', 'Sticky rice: served in a bamboo basket and eaten by hand.'),
      t('青木瓜沙拉（Tam mak hoong）：鱼露与辣椒调味。', 'Tam mak hoong: papaya salad dressed with fish sauce and chilli.'),
      t('老挝咖啡：波罗芬高原的火山土壤产区。', 'Lao coffee: grown on the volcanic soils of the Bolaven Plateau.'),
    ],
    etiquette: [
      t('合十礼（Nop）时手位随对方身份调整。', 'Adjust the height of the nop greeting to the other person’s status.'),
      t('不要触碰他人头部，也不要将脚指向人或佛像。', 'Never touch heads or point feet at people or Buddha images.'),
      t('女性不要直接接触僧侣。', 'Women should not touch monks directly.'),
    ],
    guangxiLink: t(
      '老挝是广西在东盟的近邻之一，中老铁路经云南进入老挝，与北部湾港的陆海新通道形成联动。广西的甘蔗种植与制糖技术也在老挝落地。',
      'Laos is one of Guangxi’s near neighbours in ASEAN. The China–Laos Railway connects with the Beibu Gulf land–sea corridor, and Guangxi sugar expertise has been introduced in Laos.'
    ),
  },

  myanmar: {
    code: 'myanmar',
    name: t('缅甸', 'Myanmar', { my: 'မြန်မာ' }),
    officialName: t('缅甸联邦共和国', 'Republic of the Union of Myanmar'),
    capital: t('内比都', 'Naypyidaw'),
    language: t('缅甸语', 'Burmese'),
    currency: t('缅元（MMK）', 'Kyat (MMK)'),
    population: '≈ 54 M',
    flagColors: ['#FECB00', '#34B233', '#EA2839'],
    tagline: t('万塔之国 · 伊洛瓦底', 'Land of pagodas · Irrawaddy'),
    intro: t(
      '缅甸位于中南半岛西部，伊洛瓦底江纵贯南北。蒲甘王朝在 11–13 世纪营建了数千座佛塔，上座部佛教与缅历节庆构成社会时间表，漆器、木偶与翡翠加工业延续至今。',
      'Myanmar lies in western mainland Southeast Asia along the Irrawaddy. The Pagan dynasty raised thousands of stupas between the 11th and 13th centuries; lacquerware, marionettes and jade working continue as living crafts.'
    ),
    heroImage: 'myanmar',
    highlights: [
      {
        title: t('仰光大金塔', 'Shwedagon Pagoda'),
        desc: t(
          '仰光的地标佛塔，据传始建于 6 世纪，塔身贴金并镶嵌宝石，是缅甸佛教信仰的中心。',
          'Yangon’s landmark stupa, traditionally dated to the 6th century, gilded and studded with gems.'
        ),
        image: 'myanmar',
      },
      {
        title: t('蒲甘佛塔群', 'Bagan'),
        image: 'myanmar-bagan',
        desc: t(
          '伊洛瓦底江畔的平原上散布两千余座砖构佛塔，2019 年列入世界遗产。',
          'More than 2,000 brick stupas spread across the Irrawaddy plain; inscribed as World Heritage in 2019.'
        ),
      },
      {
        title: t('缅甸木偶戏', 'Burmese marionette theatre'),
        image: 'myanmar-puppet',
        desc: t(
          '以提线木偶演绎本生故事与宫廷传说，20 世纪后期一度衰落，近年由民间剧团复兴。',
          'String puppets perform jataka stories and court tales; private troupes are reviving the tradition.'
        ),
      },
      {
        title: t('特纳卡（Thanaka）', 'Thanaka'),
        image: 'myanmar-thanaka',
        desc: t(
          '以黄香楝树皮研磨成浆涂抹面部，兼具防晒与装饰功能，是缅甸日常生活的标志。',
          'A paste ground from thanaka bark, worn for sun protection and adornment.'
        ),
      },
    ],
    unesco: [
      {
        name: t('蒲甘古城', 'Bagan'),
        year: 2019,
        type: 'world',
        desc: t('蒲甘王朝的佛教建筑群。', 'The Buddhist architectural ensemble of the Pagan dynasty.'),
      },
      {
        name: t('骠国古城', 'Pyu Ancient Cities'),
        year: 2014,
        type: 'world',
        desc: t('公元前后伊洛瓦底江流域的早期城邦遗存。', 'Early walled cities of the Irrawaddy valley.'),
      },
      {
        name: t('缅甸传统新年泼水节', 'Atā Thingyan'),
        year: 2024,
        type: 'intangible',
        desc: t('缅历新年的洒水与布施传统。', 'The Burmese New Year water festival and its giving traditions.'),
      },
    ],
    festivals: [
      {
        name: t('泼水节（Thingyan）', 'Thingyan'),
        time: t('4 月中旬', 'Mid-April'),
        desc: t('持续数日，以清水洗去旧年厄运。', 'Several days of water throwing to wash away the old year.'),
      },
      {
        name: t('点灯节（Thadingyut）', 'Thadingyut'),
        time: t('缅历七月满月（多为 10 月）', 'October full moon'),
        desc: t('纪念佛陀自忉利天返回人间，家家点灯。', 'Marks the Buddha’s return from the Tāvatiṃsa heaven; homes are lit with lamps.'),
      },
    ],
    cuisine: [
      t('鱼汤米线（Mohinga）：以鱼汤与豆粉勾芡的早餐。', 'Mohinga: fish broth thickened with chickpea flour.'),
      t('茶叶沙拉（Lahpet thoke）：发酵茶叶拌豆类与坚果。', 'Lahpet thoke: fermented tea-leaf salad with beans and nuts.'),
      t('掸族米线（Shan khauk swe）：清淡的番茄与鸡肉汤底。', 'Shan khauk swe: a light tomato-and-chicken noodle soup.'),
    ],
    etiquette: [
      t('进入佛塔需赤脚，包括楼梯与平台。', 'Go barefoot at pagodas, including stairs and platforms.'),
      t('佛像被视为神圣，不要攀爬或背对佛像拍照。', 'Never climb on Buddha images or pose with your back to them.'),
      t('递物与进食使用右手。', 'Give and eat with the right hand.'),
    ],
    guangxiLink: t(
      '缅甸与广西同属澜沧江—湄公河流域合作范围，中缅油气管道自缅甸皎漂港入境，是陆海新通道的重要组成。',
      'Myanmar and Guangxi both belong to the Lancang–Mekong cooperation framework; the China–Myanmar pipelines at Kyaukphyu are a key element of the land–sea corridor.'
    ),
  },

  brunei: {
    code: 'brunei',
    name: t('文莱', 'Brunei', { ms: 'Brunei Darussalam' }),
    officialName: t('文莱达鲁萨兰国', 'Negara Brunei Darussalam'),
    capital: t('斯里巴加湾市', 'Bandar Seri Begawan'),
    language: t('马来语', 'Malay'),
    currency: t('文莱元（BND），与新加坡元等值流通', 'Brunei dollar (BND), at par with the Singapore dollar'),
    population: '≈ 450 K',
    flagColors: ['#F7E017', '#FFFFFF', '#000000'],
    tagline: t('婆罗洲绿洲 · 水上村落', 'Borneo green · the water village'),
    intro: t(
      '文莱位于婆罗洲北部，是君主立宪的苏丹国，马来伊斯兰君主制（MIB）构成国家意识形态基础。石油与天然气带来高收入，同时保留了加东夜市与水上村落这样的日常生活形态。',
      'Brunei sits on northern Borneo as a Malay Islamic monarchy in which the national philosophy of MIB underpins the state. Oil and gas underwrite high incomes, while the water village and night market anchor daily life.'
    ),
    heroImage: 'brunei',
    highlights: [
      {
        title: t('奥马尔·阿里·赛义夫丁清真寺', 'Sultan Omar Ali Saifuddien Mosque'),
        desc: t(
          '1958 年建成的首都地标，金色穹顶与人工湖上的石舫构成斯里巴加湾的城市意象。',
          'Completed in 1958, its golden dome and stone barge on an artificial lagoon define the image of the capital.'
        ),
        image: 'brunei',
      },
      {
        title: t('甘榜亚逸水上村落', 'Kampong Ayer'),
        image: 'brunei-kampong',
        desc: t(
          '文莱河上延续数百年的水上聚落，木栈桥连接学校、清真寺与民居。',
          'A centuries-old settlement on the Brunei River, with wooden walkways linking schools, mosques and homes.'
        ),
      },
      {
        title: t('努洛伊曼皇宫', 'Istana Nurul Iman'),
        image: 'brunei-palace',
        desc: t(
          '苏丹的官邸，据称是世界上仍在使用的最大宫殿之一。',
          'The Sultan’s official residence, often cited as one of the largest palaces still in use.'
        ),
      },
      {
        title: t('乌鲁淡布隆国家公园', 'Ulu Temburong National Park'),
        image: 'brunei-temburong',
        desc: t(
          '保护区内的低地龙脑香林与树冠步道，是文莱生态旅游的核心。',
          'Lowland dipterocarp forest and a canopy walkway form the core of Brunei’s ecotourism.'
        ),
      },
    ],
    unesco: [
      {
        name: t('文莱传统织锦（Kain Tenunan）', 'Kain tenunan Brunei'),
        year: 2012,
        type: 'intangible',
        desc: t('以金线织入的传统织物，用于婚礼与典礼。', 'Traditional cloth woven with gold thread, worn at weddings and ceremonies.'),
      },
    ],
    festivals: [
      {
        name: t('苏丹华诞', 'Sultan’s birthday'),
        time: t('每年 7 月 15 日', '15 July'),
        desc: t('全国庆典与巡游，民众可进宫祝贺。', 'National celebrations and parades; the public greets the Sultan at the palace.'),
      },
      {
        name: t('开斋节', 'Hari Raya Aidilfitri'),
        time: t('伊斯兰历十月一日', '1 Shawwal'),
        desc: t('开放门户待客，家宴以糕点（kuih）为主。', 'Open houses with a spread of kuih and sweets.'),
      },
    ],
    cuisine: [
      t('安布央（Ambuyat）：西米淀粉制成，配酸味蘸酱，是文莱国菜。', 'Ambuyat: sago starch with a sour dipping sauce — Brunei’s national dish.'),
      t('椰浆饭与炭烤肉串。', 'Coconut rice with charcoal-grilled skewers.'),
      t('加东夜市：本地小吃的集中地。', 'The Gadong night market: the heart of local street food.'),
    ],
    etiquette: [
      t('用右手递接物品，避免用食指指人。', 'Use the right hand and avoid pointing with the index finger.'),
      t('进入清真寺需脱鞋，女性着装遮盖四肢与头发。', 'Remove shoes at mosques; women should cover hair and limbs.'),
      t('公共场合禁烟禁酒，斋月期间日间避免饮食。', 'Smoking and alcohol are restricted in public; avoid eating and drinking in daylight during Ramadan.'),
    ],
    guangxiLink: t(
      '文莱虽体量小，但与广西联系密切——广西企业恒逸集团主导的大摩拉岛石化项目，是文莱最大的外商直接投资项目之一。',
      'Small as it is, Brunei is closely linked to Guangxi: the Hengyi petrochemical project on Pulau Muara Besar, led by Guangxi-based Hengyi Group, is one of Brunei’s largest foreign investments.'
    ),
  },
};
