import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '壮乡之韵 - 广西民族文化展厅',
  description: '探索广西壮族及少数民族的历史文化、传统工艺与现代传承',
};

export default function GuangxiHallPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 | Hall Title */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-zhuang-red via-zhuang-blue to-zhuang-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="border-zhuangjin w-full h-full"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            壮乡之韵
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            Zhuang Culture Gallery
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto animate-slide-up animation-delay-300">
            探索广西壮族及少数民族的历史文化、传统工艺与现代传承
          </p>
        </div>
      </section>

      {/* 展区导航 | Section Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-zhuang-red hover:text-white transition-colors text-sm font-medium"
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 左江花山岩画区 | Huashan Rock Art Section */}
      <section id="huashan" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🗿"
            title="左江花山岩画"
            subtitle="UNESCO World Heritage"
            description="公元前5世纪至公元2世纪的古骆越人文化遗迹"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-2xl font-bold mb-4 text-zhuang-red">历史背景</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  左江花山岩画于2016年被列入UNESCO世界文化遗产名录，包含38处岩画遗址，
                  是古骆越人在公元前5世纪至公元后2世纪创作的文化瑰宝。岩画展现了古人的生活、
                  仪式和信仰，体现了稻作文化的深厚底蕴。
                </p>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-2xl font-bold mb-4 text-zhuang-blue">文化符号</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🐸</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">蛙形人</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">象征稻作文化中的青蛙崇拜</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🦅</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">羽饰人物</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">展现古人的装饰与身份标识</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">☀️</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">日芒纹</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-400">太阳崇拜的视觉表达</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-xl">岩画 3D 互动展示</p>
                  <p className="text-sm opacity-75 mt-2">点击查看详细内容</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zhuang-red/10 dark:bg-zhuang-red/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-zhuang-red mb-1">38+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">岩画遗址数量</div>
                </div>
                <div className="bg-zhuang-blue/10 dark:bg-zhuang-blue/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-zhuang-blue mb-1">2016</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">列入世界遗产</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 壮锦织艺区 | Zhuangjin Weaving Section */}
      <section id="zhuangjin" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="🧵"
            title="壮锦织艺"
            subtitle="National Intangible Heritage"
            description="千年传承的壮族传统织造工艺，色彩绚丽的民族瑰宝"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {zhuangjinPatterns.map((pattern, index) => (
              <div key={index} className="card-cultural group">
                <div className="aspect-square bg-gradient-to-br from-zhuang-red to-zhuang-blue flex items-center justify-center">
                  <div className="text-8xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {pattern.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {pattern.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {pattern.description}
                  </p>
                  <div className="flex gap-2">
                    {pattern.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 铜鼓文化区 | Bronze Drum Section */}
      <section id="tonggu" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🥁"
            title="铜鼓文化"
            subtitle="Cultural Symbol"
            description="壮族祭祀与庆典的重要文化符号，历史悠久"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-square bg-gradient-to-br from-zhuang-gold to-amber-600 rounded-lg flex items-center justify-center relative overflow-hidden group">
                <div className="text-9xl animate-[drumRotate_4s_ease-in-out_infinite] group-hover:animate-[drumRotate_2s_ease-in-out_infinite]">
                  🥁
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-3 text-zhuang-gold">历史渊源</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  铜鼓是壮族最重要的礼器之一，用于祭祀、庆典和战争动员。
                  铜鼓表面装饰精美的纹样，包括太阳纹、云雷纹、几何图案等，
                  体现了高超的铸造工艺和深厚的文化内涵。
                </p>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-3 text-zhuang-gold">文化意义</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> 权力与地位的象征
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> 祭祀仪式的核心器具
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> 民族团结的精神纽带
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zhuang-gold">▸</span> 艺术与工艺的结晶
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 三月三节日体验区 | Sanyuesan Festival Section */}
      <section id="sanyuesan" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            icon="🎊"
            title="三月三歌圩节"
            subtitle="Traditional Festival"
            description="壮族最重要的传统节日，歌舞相伴，欢庆春天"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {festivalActivities.map((activity, index) => (
              <div key={index} className="card-cultural">
                <div className="aspect-video bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <div className="text-7xl">{activity.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {activity.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {activity.description}
                  </p>
                  <button className="btn-embroidery w-full text-sm py-2">
                    🎮 互动体验
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 返回导航 | Back Navigation */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container-custom text-center">
          <Link
            href="/zh"
            className="inline-flex items-center gap-2 text-zhuang-blue hover:text-zhuang-red transition-colors font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件 | Helper Components
function SectionHeader({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-zhuang-red font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义 | Data Definitions
const sections = [
  { id: 'huashan', title: '左江花山岩画', icon: '🗿' },
  { id: 'zhuangjin', title: '壮锦织艺', icon: '🧵' },
  { id: 'tonggu', title: '铜鼓文化', icon: '🥁' },
  { id: 'architecture', title: '干栏式建筑', icon: '🏘️' },
  { id: 'sanyuesan', title: '三月三节日', icon: '🎊' },
  { id: 'liusanjie', title: '刘三姐文化', icon: '🎵' },
];

const zhuangjinPatterns = [
  {
    name: '菱形纹',
    icon: '◆',
    description: '象征团结和谐，最常见的壮锦图案',
    colors: ['#D73C2C', '#1E5BA8', '#D4AF37'],
  },
  {
    name: '回纹',
    icon: '⚡',
    description: '代表生生不息，连续不断的生命力',
    colors: ['#1E5BA8', '#2E8B57', '#1A1A1A'],
  },
  {
    name: '波浪纹',
    icon: '〜',
    description: '寓意流水潺潺，生活富足安康',
    colors: ['#7FCDCD', '#1E5BA8', '#FFFFFF'],
  },
];

const festivalActivities = [
  {
    name: '对歌挑战',
    icon: '🎤',
    description: '男女对唱山歌，以歌传情，展现歌唱才华',
  },
  {
    name: '抛绣球',
    icon: '🏀',
    description: '姑娘抛绣球，小伙接绣球，传统求爱方式',
  },
  {
    name: '五色糯米饭',
    icon: '🍚',
    description: '用天然植物染色的糯米饭，五彩缤纷',
  },
  {
    name: '抢花炮',
    icon: '🎆',
    description: '竞技活动，象征勇敢和力量',
  },
  {
    name: '碰彩蛋',
    icon: '🥚',
    description: '互相碰蛋，未破者为胜，寓意吉祥',
  },
  {
    name: '板鞋竞速',
    icon: '👟',
    description: '团队协作竞技，考验默契和配合',
  },
];
