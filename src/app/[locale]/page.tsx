import type { Metadata } from 'next';
import Link from 'next/link';
import { EXHIBITION_ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: '首页 - 广西-东盟线上文化展',
  description: '欢迎来到广西-东盟线上文化展，探索广西壮族文化与东盟十国的文化交流。',
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* 英雄区域 | Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-zhuang-red via-zhuang-blue to-zhuang-gold overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-zhuangjin"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border-zhuangjin"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            广西-东盟线上文化展
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up animation-delay-200">
            Guangxi-ASEAN Online Cultural Exhibition
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 animate-slide-up animation-delay-300">
            探索广西壮族文化的独特魅力，体验东盟十国的多元文化交融
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-500">
            <Link
              href="/zh/persona"
              className="btn-embroidery text-lg px-8 py-4"
            >
              🎭 测测你的文化人设
            </Link>
            <Link
              href="/zh/guangxi"
              className="glass-effect text-white px-8 py-4 rounded-full text-lg font-medium hover:scale-105 transition-transform"
            >
              开始探索展厅 🏛️
            </Link>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* 文化人设生成器推广 | Persona Generator Promotion */}
      <section className="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-7xl mb-6 animate-embroidery-bounce">🎭✨</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              你是哪种文化人？
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              5个问题揭示你的文化DNA，生成专属人设海报
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm">🏛️ 传统守护者</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm">🧵 现代壮锦设计师</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm">🎤 山歌说唱家</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm">🗿 花山探险家</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm">🌏 东盟文化使者</span>
            </div>
            <Link
              href="/zh/persona"
              className="inline-block bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
            >
              🚀 立即测试（仅需30秒）
            </Link>
            <p className="text-sm mt-4 opacity-75">
              已有 <strong>10,245+</strong> 人发现了自己的文化身份
            </p>
          </div>
        </div>
      </section>

      {/* 展厅导航 | Exhibition Navigation */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4 text-gradient-zhuang">
            六大主题展厅
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            穿越时空，感受广西与东盟的文化魅力
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXHIBITION_ROUTES.map((exhibition, index) => (
              <Link
                key={exhibition.key}
                href={`/zh${exhibition.path}`}
                className="card-cultural group"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50 group-hover:opacity-70 transition-opacity">
                    {getExhibitionEmoji(exhibition.key)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-zhuang-red transition-colors">
                    {exhibition.titleZh}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {exhibition.titleEn}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {exhibition.descriptionZh}
                  </p>
                  <div className="mt-4 flex items-center text-zhuang-blue font-medium group-hover:translate-x-2 transition-transform">
                    探索展厅 →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特色功能 | Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-16">
            沉浸式文化体验
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="🎮"
              title="3D 虚拟展厅"
              description="第一人称视角漫游，体验真实的展厅空间"
            />
            <FeatureCard
              icon="📱"
              title="AR 增强现实"
              description="将文化元素投射到现实世界，互动体验更真实"
            />
            <FeatureCard
              icon="🌐"
              title="11 种语言"
              description="中文、英文及东盟十国语言全面支持"
            />
            <FeatureCard
              icon="♿"
              title="无障碍访问"
              description="WCAG 2.2 AA 标准，让每个人都能享受文化"
            />
          </div>
        </div>
      </section>

      {/* 文化亮点 | Cultural Highlights */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">
            文化瑰宝
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            探索 UNESCO 世界遗产与非物质文化遗产
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HighlightCard
              title="左江花山岩画"
              subtitle="UNESCO World Heritage"
              description="公元前5世纪至公元2世纪的古骆越人文化遗迹"
              color="from-red-500 to-orange-500"
            />
            <HighlightCard
              title="壮锦织艺"
              subtitle="National Intangible Heritage"
              description="千年传承的壮族传统织造工艺，色彩绚丽的民族瑰宝"
              color="from-blue-500 to-purple-500"
            />
            <HighlightCard
              title="铜鼓文化"
              subtitle="Cultural Symbol"
              description="壮族祭祀与庆典的重要文化符号，历史悠久"
              color="from-yellow-500 to-amber-600"
            />
          </div>
        </div>
      </section>

      {/* 页脚 | Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">关于我们</h3>
              <p className="text-sm">
                广西-东盟线上文化展致力于展现广西壮族文化特色与东盟十国的文化交流。
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/zh/about" className="hover:text-white">关于项目</Link></li>
                <li><Link href="/zh/accessibility" className="hover:text-white">无障碍访问</Link></li>
                <li><Link href="/zh/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/zh/contact" className="hover:text-white">联系我们</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">语言 / Languages</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link href="/zh" className="hover:text-white">中文</Link>
                <span>|</span>
                <Link href="/en" className="hover:text-white">English</Link>
                <span>|</span>
                <Link href="/vi" className="hover:text-white">Tiếng Việt</Link>
                <span>|</span>
                <Link href="/th" className="hover:text-white">ไทย</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 Guangxi-ASEAN Cultural Exhibition. Built with ❤️ for cultural preservation.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// 辅助组件 | Helper Components
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function HighlightCard({ title, subtitle, description, color }: { title: string; subtitle: string; description: string; color: string }) {
  return (
    <div className="card-cultural overflow-hidden group">
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      <div className="p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{subtitle}</div>
        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-zhuang-red transition-colors">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}

function getExhibitionEmoji(key: string): string {
  const emojiMap: Record<string, string> = {
    guangxi: '🎭',
    guilin: '🏔️',
    asean: '🌏',
    exchange: '🤝',
    archive: '📚',
    interactive: '🎮',
  };
  return emojiMap[key] || '🏛️';
}
