'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

const metadata: Metadata = {
  title: '丝路新章 - 广西-东盟文化交流展厅',
  description: '展示广西与东盟的历史渊源、现代合作成果与文化交流历程',
};

export default function ExchangeHallPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          {/* 连接线动画背景 */}
          <svg className="w-full h-full opacity-20" viewBox="0 0 1200 600">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {[...Array(20)].map((_, i) => (
              <line
                key={i}
                x1={Math.random() * 1200}
                y1={Math.random() * 600}
                x2={Math.random() * 1200}
                y2={Math.random() * 600}
                stroke="url(#lineGrad)"
                strokeWidth="2"
                opacity="0.3"
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            丝路新章
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            Guangxi-ASEAN Cultural Exchange
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">
            跨越千年的文化纽带 • 共建人类命运共同体
          </p>
        </div>
      </section>

      {/* 展区导航 */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium"
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 古代海上丝绸之路 */}
      <section id="silk-road" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="⛵"
            title="古代海上丝绸之路"
            subtitle="千年贸易通道"
            description="广西作为海上丝绸之路的重要节点，见证了中国与东南亚的千年交流史"
          />

          <div className="mt-12">
            {/* 交互式时间轴 */}
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

              <div className="space-y-16">
                {timelineEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="card-cultural p-6 inline-block max-w-md">
                        <div className="text-sm text-purple-600 font-bold mb-2">{event.period}</div>
                        <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl text-white shadow-lg">
                        {event.icon}
                      </div>
                    </div>

                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 壮族与泰族同源文化 */}
      <section id="zhuang-tai" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="🔗"
            title="壮族与泰族同源文化"
            subtitle="泰-卡岱语系"
            description="探索广西壮族与泰国泰族的共同文化根源"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-600">语言联系</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  壮族和泰族同属泰-卡岱语系，语言结构、词汇、语法具有显著相似性。
                  这种语言学上的联系证明了两个民族在历史上的深厚渊源。
                </p>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">语言树状图</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    泰-卡岱语系 → 壮侗语族 → 壮语支 / 泰语支
                  </div>
                </div>
              </div>

              <div className="card-cultural p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-600">文化相似性</h3>
                <ul className="space-y-3">
                  {culturalSimilarities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <strong className="text-gray-900 dark:text-white">{item.aspect}</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-2xl font-bold mb-2">文化对比展示</p>
                  <p className="text-sm opacity-75">壮族 vs 泰族文化元素并列对比</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card-cultural p-4 text-center">
                  <div className="text-3xl mb-2">🇨🇳</div>
                  <div className="font-bold mb-1">壮族</div>
                  <div className="text-xs text-gray-500">中国广西</div>
                  <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                    1800万人口
                  </div>
                </div>
                <div className="card-cultural p-4 text-center">
                  <div className="text-3xl mb-2">🇹🇭</div>
                  <div className="font-bold mb-1">泰族</div>
                  <div className="text-xs text-gray-500">泰国、老挝</div>
                  <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                    6000万人口
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 中国-东盟博览会 */}
      <section id="caexpo" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🏛️"
            title="中国-东盟博览会"
            subtitle="南宁渠道"
            description="自2004年起在南宁举办，已成为中国-东盟合作的重要平台"
          />

          <div className="mt-12">
            <div className="card-cultural p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">第20届</h3>
                  <p className="text-gray-600 dark:text-gray-400">2004 - 2024 • 20年辉煌历程</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 mb-1">10+</div>
                  <div className="text-sm text-gray-500">参展国家</div>
                </div>
              </div>

              {/* 数据可视化 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caexpoStats.map((stat, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VR全景展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exhibitionHighlights.map((highlight, idx) => (
                <div key={idx} className="card-cultural overflow-hidden group">
                  <div className={`aspect-video bg-gradient-to-br ${highlight.color} flex items-center justify-center`}>
                    <div className="text-6xl group-hover:scale-110 transition-transform">
                      {highlight.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold mb-2">{highlight.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 教育文化合作 */}
      <section id="education" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            icon="🎓"
            title="教育文化合作"
            subtitle="人文交流"
            description="广西高校与东盟大学签订教育交流协议，每年接收超过1000名东盟留学生"
          />

          <div className="mt-12">
            {/* 网络图谱可视化 */}
            <div className="aspect-video bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-4xl">
                  {/* 中心节点 - 广西 */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-xl">
                      <div className="text-center">
                        <div className="text-2xl">🇨🇳</div>
                        <div className="text-xs font-bold">广西</div>
                      </div>
                    </div>
                  </div>

                  {/* 东盟国家节点 */}
                  {cooperationNodes.map((node, idx) => {
                    const angle = (idx * 360) / cooperationNodes.length;
                    const radius = 160;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
                          <div className="text-2xl">{node.flag}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-cultural p-6 text-center">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">合作协议</div>
              </div>
              <div className="card-cultural p-6 text-center">
                <div className="text-4xl mb-3">👨‍🎓</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">留学生人次</div>
              </div>
              <div className="card-cultural p-6 text-center">
                <div className="text-4xl mb-3">🌏</div>
                <div className="text-3xl font-bold text-pink-600 mb-2">15+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">孔子学院</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 用户故事墙 */}
      <section id="stories" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="💬"
            title="用户故事墙"
            subtitle="真实经历"
            description="收集和展示参与文化交流的个人和机构的真实故事"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.map((story, idx) => (
              <div key={idx} className="card-cultural p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl">
                    {story.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{story.name}</div>
                    <div className="text-xs text-gray-500">{story.role}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{story.story}"
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  {story.year} • {story.location}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                const story = prompt('📝 分享你的故事\n\n请输入你与广西或东盟文化的故事：');
                if (story && story.trim()) {
                  alert(`✅ 故事提交成功！\n\n感谢分享：\n"${story.substring(0, 50)}${story.length > 50 ? '...' : ''}"\n\n审核通过后将在社区展示`);
                }
              }}
              className="btn-embroidery"
            >
              📝 分享你的故事
            </button>
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href="/zh"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function SectionHeader({ icon, title, subtitle, description }: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-purple-600 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'silk-road', title: '海上丝绸之路', icon: '⛵' },
  { id: 'zhuang-tai', title: '壮泰同源', icon: '🔗' },
  { id: 'caexpo', title: '东盟博览会', icon: '🏛️' },
  { id: 'education', title: '教育合作', icon: '🎓' },
  { id: 'stories', title: '用户故事', icon: '💬' },
];

const timelineEvents = [
  {
    period: '公元前5世纪',
    icon: '🏺',
    title: '古骆越文化',
    description: '广西地区骆越人与东南亚古民族的早期交流'
  },
  {
    period: '汉唐时期',
    icon: '🚢',
    title: '海上丝绸之路',
    description: '广西作为重要港口，开启中国与东南亚的海上贸易'
  },
  {
    period: '明清时期',
    icon: '📜',
    title: '朝贡贸易',
    description: '东南亚国家通过广西向中国朝贡，文化交流频繁'
  },
  {
    period: '2004年',
    icon: '🎪',
    title: '东盟博览会',
    description: '首届中国-东盟博览会在南宁举办，开启新时代'
  },
];

const culturalSimilarities = [
  { icon: '🏠', aspect: '建筑风格', description: '干栏式建筑与泰国高脚屋相似' },
  { icon: '👗', aspect: '服饰文化', description: '壮锦与泰国丝绸工艺相通' },
  { icon: '🎵', aspect: '音乐舞蹈', description: '歌舞传统和节奏韵律接近' },
  { icon: '🍚', aspect: '饮食习惯', description: '稻米为主食，烹饪方式相似' },
];

const caexpoStats = [
  { value: '20+', label: '举办届数' },
  { value: '50万+', label: '参展人次' },
  { value: '100亿+', label: '贸易额(美元)' },
  { value: '1000+', label: '文化活动' },
];

const exhibitionHighlights = [
  {
    icon: '🎨',
    title: '文化艺术展',
    description: '东盟各国传统艺术品、手工艺品展示',
    color: 'from-pink-400 to-rose-500'
  },
  {
    icon: '🎭',
    title: '民族表演',
    description: '传统舞蹈、音乐、戏剧现场演出',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    icon: '🍜',
    title: '美食节',
    description: '东盟十国特色美食文化体验',
    color: 'from-orange-400 to-red-500'
  },
];

const cooperationNodes = [
  { flag: '🇹🇭', name: '泰国' },
  { flag: '🇻🇳', name: '越南' },
  { flag: '🇮🇩', name: '印尼' },
  { flag: '🇲🇾', name: '马来西亚' },
  { flag: '🇸🇬', name: '新加坡' },
  { flag: '🇵🇭', name: '菲律宾' },
  { flag: '🇰🇭', name: '柬埔寨' },
  { flag: '🇱🇦', name: '老挝' },
];

const userStories = [
  {
    avatar: '👨‍🎓',
    name: '阮文明',
    role: '越南留学生',
    story: '在广西大学学习三年，不仅学到了专业知识，更深入了解了中国文化。现在我成为两国文化交流的桥梁。',
    year: '2021',
    location: '南宁'
  },
  {
    avatar: '👩‍🏫',
    name: '李梅',
    role: '汉语教师',
    story: '在泰国教授汉语五年，看到越来越多泰国学生对中国文化感兴趣，这让我非常自豪。',
    year: '2019',
    location: '曼谷'
  },
  {
    avatar: '👨‍💼',
    name: 'Suthi',
    role: '商务代表',
    story: '通过东盟博览会，我们公司成功进入中国市场，实现了跨国合作的梦想。',
    year: '2020',
    location: '南宁'
  },
];
