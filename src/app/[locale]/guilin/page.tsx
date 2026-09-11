import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '山水桂林 - 自然景观与诗意文化展厅',
  description: '探索桂林山水的喀斯特地貌之美与深厚的文人诗词文化',
};

export default function GuilinHallPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* 展厅标题 - 水墨画风格 */}
      <section className="relative h-[70vh] flex items-center justify-center ink-container overflow-hidden">
        {/* 水墨画背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-gray-light via-ink-cyan to-ink-gray-dark">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'url(/images/textures/ink-paper.jpg)',
            backgroundSize: 'cover',
          }}></div>
        </div>

        {/* 山峰剪影 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20">
          <svg viewBox="0 0 1200 400" className="w-full h-full">
            <path d="M0,400 L0,300 Q150,100 300,200 T600,150 T900,180 T1200,220 L1200,400 Z" fill="currentColor" className="text-black"/>
          </svg>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-ink-black animate-fade-in" style={{ fontFamily: 'serif' }}>
            山水桂林
          </h1>
          <p className="text-2xl md:text-3xl mb-2 text-ink-gray-dark animate-slide-up animation-delay-200">
            Guilin Landscape Gallery
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-ink-gray animate-slide-up animation-delay-300">
            桂林山水甲天下 • 千年诗意入画来
          </p>
        </div>

        {/* 雾气粒子效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-mist-flow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-mist-flow animation-delay-500"></div>
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
                className="whitespace-nowrap px-4 py-2 rounded-full bg-ink-gray-light/20 hover:bg-ink-cyan hover:text-white transition-colors text-sm font-medium"
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 漓江烟雨区 */}
      <section id="lijiang" className="py-20 bg-gradient-to-b from-white to-ink-gray-light/10">
        <div className="container-custom">
          <SectionHeader
            icon="🌊"
            title="漓江烟雨"
            subtitle="天下第一江山"
            description="漓江全长437公里，两岸奇峰林立，烟雨朦胧如诗如画"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="card-cultural p-8 bg-gradient-to-br from-ink-cyan/10 to-ink-green/10">
                <h3 className="text-2xl font-bold mb-4 text-ink-black">桂林山水甲天下</h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    "桂林山水甲天下，阳朔山水甲桂林。" 桂林以其独特的喀斯特地貌闻名于世，
                    漓江碧水如镜，群峰倒影，宛如一幅流动的山水画卷。
                  </p>
                  <div className="border-l-4 border-ink-cyan pl-4 italic text-ink-gray-dark">
                    "江作青罗带，山如碧玉簪" <br/>
                    <span className="text-sm">— 唐·韩愈</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {lijiangFeatures.map((feature, idx) => (
                  <div key={idx} className="card-cultural p-4 text-center">
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <div className="font-bold text-lg mb-1">{feature.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gradient-to-br from-ink-gray to-ink-cyan rounded-lg overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-xl font-bold">360° 漓江全景</p>
                    <p className="text-sm opacity-75 mt-2">沉浸式虚拟游览</p>
                  </div>
                </div>
              </div>

              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">历代文人诗词</h4>
                <div className="space-y-3 text-sm">
                  {poems.map((poem, idx) => (
                    <div key={idx} className="border-l-2 border-ink-blue pl-3">
                      <div className="font-medium text-ink-black dark:text-white">{poem.text}</div>
                      <div className="text-gray-500 text-xs mt-1">— {poem.author}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 喀斯特峰林区 */}
      <section id="karst" className="py-20 bg-ink-gray-light/5">
        <div className="container-custom">
          <SectionHeader
            icon="⛰️"
            title="喀斯特峰林"
            subtitle="地质奇观"
            description="亿万年地质演化造就的独特地貌景观"
          />

          <div className="mt-12">
            <div className="aspect-[21/9] bg-gradient-to-br from-gray-700 via-gray-500 to-gray-600 rounded-2xl overflow-hidden relative">
              {/* 山峰剪影动画 */}
              <svg viewBox="0 0 1200 400" className="w-full h-full">
                <defs>
                  <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
                  </linearGradient>
                </defs>

                {/* 远山 */}
                <path d="M0,350 Q100,200 200,280 T400,250 T600,220 T800,260 T1000,230 T1200,270 L1200,400 L0,400 Z"
                      fill="url(#mountainGrad)" opacity="0.3"/>

                {/* 中山 */}
                <path d="M0,380 Q80,250 160,320 T320,290 T480,270 T640,300 T800,280 T960,310 T1200,290 L1200,400 L0,400 Z"
                      fill="url(#mountainGrad)" opacity="0.5"/>

                {/* 近山 */}
                <path d="M0,400 Q60,300 120,360 T240,340 T360,320 T480,350 T600,330 T720,360 T840,340 T960,370 T1080,350 T1200,380 L1200,400 Z"
                      fill="url(#mountainGrad)" opacity="0.7"/>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">WebGL 峰林漫游</p>
                  <p className="text-sm opacity-75">云雾穿行，自由视角</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {karstFeatures.map((feature, idx) => (
                <div key={idx} className="card-cultural p-6">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 象鼻山地标区 */}
      <section id="elephant" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🐘"
            title="象鼻山"
            subtitle="桂林城徽"
            description="桂林最具代表性的地标，形似巨象临江饮水"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🐘</div>
                    <p className="text-2xl font-bold">象鼻山 3D 模型</p>
                    <p className="text-sm opacity-75 mt-2">360° 旋转查看 • AR 投放体验</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">地质构造</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  象鼻山由3.6亿年前海底沉积的纯石灰岩组成，山体酷似一头巨象伸鼻临江汲水，
                  形象生动，栩栩如生，是大自然鬼斧神工的杰作。
                </p>
              </div>

              <div className="card-cultural p-6">
                <h4 className="font-bold mb-3">文化象征</h4>
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    桂林城市形象标志
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    中国20元人民币背景图案
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ink-cyan mt-1">▸</span>
                    历代文人墨客题咏胜地
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-ink-cyan/20 to-ink-green/20 p-4 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>最佳观赏时间：</strong><br/>
                  清晨与傍晚，光线柔和，倒影清晰
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 九马画山诗意区 */}
      <section id="jiuma" className="py-20 bg-gradient-to-br from-ink-gray-light/10 to-transparent">
        <div className="container-custom">
          <SectionHeader
            icon="🐴"
            title="九马画山"
            subtitle="画山寻马"
            description="山壁纹理宛如九匹骏马，考验观赏者的想象力"
          />

          <div className="mt-12">
            <div className="card-cultural p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-ink-cyan to-ink-green px-6 py-2 rounded-full text-white font-medium mb-4">
                  🎮 互动游戏：寻找九马
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  传说能看出九匹马的人会功成名就，快来挑战你的观察力！
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div key={num} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                    ?
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-bold mb-3">文人诗词</h4>
                <div className="italic text-gray-700 dark:text-gray-300">
                  "画山九马天下奇，谁能数全是神仙" <br/>
                  <span className="text-sm">— 清·徐霞客</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href="/zh"
            className="inline-flex items-center gap-2 text-ink-cyan hover:text-ink-blue transition-colors font-medium"
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
      <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-ink-cyan font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'lijiang', title: '漓江烟雨', icon: '🌊' },
  { id: 'karst', title: '喀斯特峰林', icon: '⛰️' },
  { id: 'elephant', title: '象鼻山', icon: '🐘' },
  { id: 'jiuma', title: '九马画山', icon: '🐴' },
];

const lijiangFeatures = [
  { icon: '🏔️', name: '奇峰林立', desc: '千姿百态' },
  { icon: '💧', name: '碧水如镜', desc: '清澈见底' },
  { icon: '🌫️', name: '烟雨朦胧', desc: '如梦如幻' },
  { icon: '🎨', name: '倒影如画', desc: '水墨意境' },
];

const poems = [
  { text: '江作青罗带，山如碧玉簪', author: '唐·韩愈' },
  { text: '愿作桂林人，不愿作神仙', author: '宋·陈毅' },
  { text: '桂林山水甲天下，绝妙漓江秋泛图', author: '明·董其昌' },
];

const karstFeatures = [
  {
    icon: '🪨',
    title: '石灰岩地貌',
    description: '亿万年海底沉积形成的纯石灰岩，经地壳运动抬升至地表'
  },
  {
    icon: '💨',
    title: '溶蚀作用',
    description: '雨水和地下水溶蚀石灰岩，形成独特的峰林、溶洞地貌'
  },
  {
    icon: '🌍',
    title: '世界遗产',
    description: '中国南方喀斯特地貌的典型代表，具有重要科研价值'
  },
];
