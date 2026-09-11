/**
 * 文化人设数据定义
 * Cultural Persona Data
 */

export interface PersonaQuestion {
  id: number;
  question: string;
  questionEn: string;
  options: PersonaOption[];
}

export interface PersonaOption {
  text: string;
  textEn: string;
  scores: {
    tradition: number;    // 传统偏好 0-20
    innovation: number;   // 创新偏好 0-20
    art: number;         // 艺术偏好 0-20
    social: number;      // 社交偏好 0-20
    adventure: number;   // 冒险偏好 0-20
  };
}

export interface PersonaResult {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  traits: string[];
  matchingExhibitions: string[];
}

// 5道测试题
export const personaQuestions: PersonaQuestion[] = [
  {
    id: 1,
    question: '如果穿越回古代广西，你最想做什么？',
    questionEn: 'If you could travel back to ancient Guangxi, what would you do?',
    options: [
      {
        text: '学习壮锦织造技艺，成为手艺人',
        textEn: 'Learn Zhuangjin weaving and become a craftsman',
        scores: { tradition: 20, innovation: 5, art: 15, social: 5, adventure: 5 }
      },
      {
        text: '参加歌圩节，与大家对歌交友',
        textEn: 'Join the Song Festival and make friends through singing',
        scores: { tradition: 10, innovation: 5, art: 10, social: 20, adventure: 10 }
      },
      {
        text: '探索花山岩画，研究古人的秘密',
        textEn: 'Explore Huashan Rock Art and study ancient mysteries',
        scores: { tradition: 15, innovation: 10, art: 5, social: 5, adventure: 20 }
      },
      {
        text: '开辟新商路，连接广西与东南亚',
        textEn: 'Open new trade routes connecting Guangxi and Southeast Asia',
        scores: { tradition: 5, innovation: 20, art: 5, social: 15, adventure: 15 }
      }
    ]
  },
  {
    id: 2,
    question: '你觉得传统文化应该如何传承？',
    questionEn: 'How should traditional culture be inherited?',
    options: [
      {
        text: '保持原汁原味，一丝不变地传承',
        textEn: 'Keep it authentic and unchanged',
        scores: { tradition: 20, innovation: 0, art: 10, social: 5, adventure: 0 }
      },
      {
        text: '融入现代元素，让年轻人更易接受',
        textEn: 'Blend modern elements to attract young people',
        scores: { tradition: 10, innovation: 20, art: 15, social: 10, adventure: 10 }
      },
      {
        text: '通过艺术作品展现文化之美',
        textEn: 'Express cultural beauty through artworks',
        scores: { tradition: 10, innovation: 10, art: 20, social: 5, adventure: 5 }
      },
      {
        text: '举办文化活动，让大家共同参与',
        textEn: 'Organize cultural events for collective participation',
        scores: { tradition: 10, innovation: 10, art: 5, social: 20, adventure: 10 }
      }
    ]
  },
  {
    id: 3,
    question: '如果让你设计一款广西文化产品，你会选择？',
    questionEn: 'If you design a Guangxi cultural product, you would choose:',
    options: [
      {
        text: '复刻古代铜鼓，保留传统工艺',
        textEn: 'Replicate ancient bronze drums with traditional craftsmanship',
        scores: { tradition: 20, innovation: 5, art: 15, social: 5, adventure: 5 }
      },
      {
        text: '壮锦图案的潮流服饰',
        textEn: 'Fashion clothing with Zhuangjin patterns',
        scores: { tradition: 10, innovation: 20, art: 15, social: 10, adventure: 5 }
      },
      {
        text: '花山岩画主题的艺术装置',
        textEn: 'Art installation themed on Huashan Rock Art',
        scores: { tradition: 10, innovation: 15, art: 20, social: 5, adventure: 10 }
      },
      {
        text: 'AR互动游戏，体验民族文化',
        textEn: 'AR interactive game to experience ethnic culture',
        scores: { tradition: 5, innovation: 20, art: 10, social: 15, adventure: 15 }
      }
    ]
  },
  {
    id: 4,
    question: '周末你更愿意？',
    questionEn: 'On weekends, you prefer to:',
    options: [
      {
        text: '去博物馆静静欣赏文物',
        textEn: 'Visit museums and quietly appreciate artifacts',
        scores: { tradition: 20, innovation: 0, art: 15, social: 0, adventure: 5 }
      },
      {
        text: '参加文化工作坊，动手制作',
        textEn: 'Join cultural workshops and create by hand',
        scores: { tradition: 15, innovation: 10, art: 20, social: 10, adventure: 5 }
      },
      {
        text: '和朋友聚会，分享文化见闻',
        textEn: 'Gather with friends and share cultural insights',
        scores: { tradition: 5, innovation: 10, art: 5, social: 20, adventure: 10 }
      },
      {
        text: '探索小众文化景点',
        textEn: 'Explore niche cultural spots',
        scores: { tradition: 10, innovation: 10, art: 10, social: 5, adventure: 20 }
      }
    ]
  },
  {
    id: 5,
    question: '如果用一个词形容你对文化的态度？',
    questionEn: 'One word to describe your attitude toward culture?',
    options: [
      {
        text: '敬畏 - 尊重传统，珍视历史',
        textEn: 'Reverence - Respect tradition, cherish history',
        scores: { tradition: 20, innovation: 5, art: 10, social: 5, adventure: 5 }
      },
      {
        text: '创新 - 突破边界，融合未来',
        textEn: 'Innovation - Break boundaries, blend with future',
        scores: { tradition: 5, innovation: 20, art: 15, social: 10, adventure: 15 }
      },
      {
        text: '审美 - 发现美，创造美',
        textEn: 'Aesthetic - Discover beauty, create beauty',
        scores: { tradition: 10, innovation: 10, art: 20, social: 5, adventure: 10 }
      },
      {
        text: '分享 - 传播文化，连接世界',
        textEn: 'Sharing - Spread culture, connect the world',
        scores: { tradition: 10, innovation: 15, art: 5, social: 20, adventure: 15 }
      }
    ]
  }
];

// 16种文化人设结果
export const personaResults: PersonaResult[] = [
  {
    id: 'traditional-guardian',
    name: '传统守护者',
    nameEn: 'Traditional Guardian',
    description: '你深深敬畏传统文化，致力于原汁原味地保护和传承。在你眼中，每一件文物、每一项技艺都是祖先的智慧结晶，值得用一生去守护。',
    descriptionEn: 'You deeply revere traditional culture and dedicate yourself to authentic preservation. Every artifact and craft is ancestral wisdom worth lifelong protection.',
    icon: '🏛️',
    color: 'from-amber-600 to-orange-700',
    traits: ['传统主义', '文化保护', '历史研究'],
    matchingExhibitions: ['guangxi', 'archive']
  },
  {
    id: 'modern-weaver',
    name: '现代壮锦设计师',
    nameEn: 'Modern Zhuangjin Designer',
    description: '你将传统壮锦纹样与现代审美完美融合，创造出既有文化底蕴又符合当代品味的作品。你相信传统需要创新才能焕发新生。',
    descriptionEn: 'You blend traditional Zhuangjin patterns with modern aesthetics, creating works with cultural depth and contemporary appeal.',
    icon: '🧵',
    color: 'from-pink-500 to-purple-600',
    traits: ['创新设计', '时尚潮流', '文化融合'],
    matchingExhibitions: ['guangxi', 'interactive']
  },
  {
    id: 'rock-art-explorer',
    name: '花山探险家',
    nameEn: 'Huashan Explorer',
    description: '你对神秘的花山岩画充满好奇，喜欢解谜和探索未知。你相信古人留下的每一个符号都藏着故事，等待被发现。',
    descriptionEn: 'You are fascinated by the mysterious Huashan Rock Art. Every ancient symbol holds a story waiting to be discovered.',
    icon: '🗿',
    color: 'from-gray-700 to-gray-900',
    traits: ['考古探索', '解谜专家', '历史研究'],
    matchingExhibitions: ['guangxi', 'guilin']
  },
  {
    id: 'song-master',
    name: '山歌说唱家',
    nameEn: 'Mountain Song Rapper',
    description: '你把壮族山歌与现代说唱结合，用节奏和韵律讲述文化故事。你相信音乐是跨越语言和文化的桥梁。',
    descriptionEn: 'You blend Zhuang mountain songs with modern rap, telling cultural stories through rhythm and rhyme.',
    icon: '🎤',
    color: 'from-blue-500 to-cyan-500',
    traits: ['音乐创作', '文化说唱', '社交达人'],
    matchingExhibitions: ['guangxi', 'interactive']
  },
  {
    id: 'asean-connector',
    name: '东盟文化使者',
    nameEn: 'ASEAN Cultural Ambassador',
    description: '你热衷于连接广西与东盟各国文化，发现不同文化间的共同点。你相信文化交流能促进理解与和平。',
    descriptionEn: 'You connect Guangxi with ASEAN cultures, discovering commonalities. Cultural exchange promotes understanding and peace.',
    icon: '🌏',
    color: 'from-green-500 to-teal-600',
    traits: ['跨文化交流', '语言达人', '外交家'],
    matchingExhibitions: ['asean', 'exchange']
  },
  {
    id: 'guilin-poet',
    name: '桂林山水诗人',
    nameEn: 'Guilin Landscape Poet',
    description: '你被桂林山水的诗意之美深深打动，喜欢用文字和影像捕捉自然与文化的融合。你相信美是治愈心灵的良药。',
    descriptionEn: 'Touched by the poetic beauty of Guilin landscapes, you capture the fusion of nature and culture through words and images.',
    icon: '🏔️',
    color: 'from-cyan-400 to-blue-500',
    traits: ['诗意表达', '摄影师', '自然爱好者'],
    matchingExhibitions: ['guilin', 'archive']
  },
  {
    id: 'festival-organizer',
    name: '三月三节日策划人',
    nameEn: 'Sanyuesan Festival Organizer',
    description: '你擅长组织文化活动，让更多人体验壮族节日的欢乐。你相信文化需要活起来，而不是躺在博物馆里。',
    descriptionEn: 'You excel at organizing cultural events, letting people experience the joy of Zhuang festivals. Culture should be alive, not locked in museums.',
    icon: '🎊',
    color: 'from-pink-400 to-red-500',
    traits: ['活动策划', '社交高手', '文化推广'],
    matchingExhibitions: ['guangxi', 'interactive']
  },
  {
    id: 'digital-curator',
    name: '数字策展人',
    nameEn: 'Digital Curator',
    description: '你精通数字技术，致力于将传统文化以创新方式呈现。VR、AR、3D扫描都是你的工具，让文化跨越时空限制。',
    descriptionEn: 'Proficient in digital technology, you present traditional culture innovatively. VR, AR, 3D scanning help culture transcend time and space.',
    icon: '💻',
    color: 'from-indigo-500 to-purple-600',
    traits: ['科技达人', '数字创新', '虚拟策展'],
    matchingExhibitions: ['archive', 'interactive']
  },
  {
    id: 'bronze-drum-musician',
    name: '铜鼓节奏大师',
    nameEn: 'Bronze Drum Rhythm Master',
    description: '你对铜鼓的节奏情有独钟，能从鼓声中感受到千年的文化脉动。你相信音乐是连接过去与未来的纽带。',
    descriptionEn: 'You love bronze drum rhythms, feeling millennial cultural pulses through drumbeats. Music connects past and future.',
    icon: '🥁',
    color: 'from-yellow-600 to-amber-700',
    traits: ['音乐天赋', '节奏感', '传统乐器'],
    matchingExhibitions: ['guangxi', 'interactive']
  },
  {
    id: 'cultural-storyteller',
    name: '文化故事讲述者',
    nameEn: 'Cultural Storyteller',
    description: '你善于用生动的故事传递文化内涵，让每个人都能被文化之美打动。你相信好的故事能改变世界。',
    descriptionEn: 'You convey cultural essence through vivid stories, touching everyone with cultural beauty. Good stories can change the world.',
    icon: '📖',
    color: 'from-orange-500 to-red-600',
    traits: ['叙事能力', '教育传播', '写作才华'],
    matchingExhibitions: ['exchange', 'archive']
  },
  {
    id: 'craft-maker',
    name: '手工艺匠人',
    nameEn: 'Craftsman',
    description: '你热爱动手创作，从编织、陶艺到木雕，你用双手延续传统技艺。你相信每件手工作品都承载着温度和故事。',
    descriptionEn: 'You love hands-on creation, from weaving to pottery to wood carving. Every handmade piece carries warmth and stories.',
    icon: '🎨',
    color: 'from-brown-500 to-amber-600',
    traits: ['手工技艺', '工匠精神', '创作热情'],
    matchingExhibitions: ['guangxi', 'interactive']
  },
  {
    id: 'social-influencer',
    name: '文化KOL',
    nameEn: 'Cultural Influencer',
    description: '你在社交媒体上分享文化见闻，用短视频、图文让更多人了解广西文化。你相信影响力能带来改变。',
    descriptionEn: 'You share cultural insights on social media through short videos and posts, introducing Guangxi culture to more people.',
    icon: '📱',
    color: 'from-pink-500 to-rose-600',
    traits: ['社交媒体', '内容创作', '影响力'],
    matchingExhibitions: ['interactive', 'asean']
  },
  {
    id: 'academic-researcher',
    name: '文化学者',
    nameEn: 'Cultural Scholar',
    description: '你用严谨的学术态度研究民族文化，撰写论文、整理史料。你相信知识是文化传承的基石。',
    descriptionEn: 'You research ethnic culture with academic rigor, writing papers and organizing historical materials. Knowledge is the foundation of cultural heritage.',
    icon: '🎓',
    color: 'from-blue-600 to-indigo-700',
    traits: ['学术研究', '文献整理', '理性分析'],
    matchingExhibitions: ['archive', 'exchange']
  },
  {
    id: 'travel-blogger',
    name: '文化旅行家',
    nameEn: 'Cultural Traveler',
    description: '你走遍广西和东盟各地，用镜头记录文化之美，分享旅途见闻。你相信行万里路胜读万卷书。',
    descriptionEn: 'You travel across Guangxi and ASEAN, documenting cultural beauty through your lens. Traveling thousands of miles beats reading thousands of books.',
    icon: '✈️',
    color: 'from-sky-400 to-blue-600',
    traits: ['旅行探索', '摄影记录', '见闻分享'],
    matchingExhibitions: ['guilin', 'asean']
  },
  {
    id: 'community-builder',
    name: '文化社区建设者',
    nameEn: 'Community Builder',
    description: '你致力于建立文化爱好者社区，组织线上线下活动。你相信集体的力量能让文化传承走得更远。',
    descriptionEn: 'You build communities of culture enthusiasts and organize online/offline events. Collective strength makes cultural heritage go further.',
    icon: '🤝',
    color: 'from-green-400 to-emerald-600',
    traits: ['社区运营', '组织能力', '团队协作'],
    matchingExhibitions: ['interactive', 'exchange']
  },
  {
    id: 'innovation-pioneer',
    name: '文化创新先锋',
    nameEn: 'Cultural Innovation Pioneer',
    description: '你用最前沿的技术和理念重新诠释传统文化，从NFT到元宇宙，你总是走在时代前沿。你相信创新是最好的传承。',
    descriptionEn: 'You reinterpret traditional culture with cutting-edge tech and ideas. From NFTs to metaverse, innovation is the best inheritance.',
    icon: '🚀',
    color: 'from-purple-500 to-pink-600',
    traits: ['技术前沿', '创新思维', '未来视野'],
    matchingExhibitions: ['interactive', 'archive']
  }
];

/**
 * 根据得分计算匹配的人设
 */
export function calculatePersona(scores: {
  tradition: number;
  innovation: number;
  art: number;
  social: number;
  adventure: number;
}): PersonaResult {
  const { tradition, innovation, art, social, adventure } = scores;

  // 根据得分组合匹配人设
  if (tradition >= 70) {
    return personaResults[0]; // 传统守护者
  }
  if (innovation >= 70) {
    return personaResults[15]; // 文化创新先锋
  }
  if (art >= 70) {
    return personaResults[10]; // 手工艺匠人
  }
  if (social >= 70) {
    return personaResults[11]; // 文化KOL
  }
  if (adventure >= 70) {
    return personaResults[2]; // 花山探险家
  }

  // 复合类型判断
  if (tradition > 50 && art > 50) {
    return personaResults[10]; // 手工艺匠人
  }
  if (innovation > 50 && art > 50) {
    return personaResults[1]; // 现代壮锦设计师
  }
  if (innovation > 50 && social > 50) {
    return personaResults[11]; // 文化KOL
  }
  if (tradition > 50 && social > 50) {
    return personaResults[6]; // 三月三节日策划人
  }
  if (art > 50 && social > 50) {
    return personaResults[9]; // 文化故事讲述者
  }
  if (adventure > 50 && social > 50) {
    return personaResults[13]; // 文化旅行家
  }
  if (innovation > 50 && adventure > 50) {
    return personaResults[7]; // 数字策展人
  }

  // 根据最高分决定
  const maxScore = Math.max(tradition, innovation, art, social, adventure);
  if (maxScore === tradition) return personaResults[0];
  if (maxScore === innovation) return personaResults[1];
  if (maxScore === art) return personaResults[5];
  if (maxScore === social) return personaResults[6];
  return personaResults[2];
}
