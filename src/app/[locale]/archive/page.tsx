'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

const metadata: Metadata = {
  title: '数字遗产 - 文化宝库与档案中心',
  description: '全面的文物数字档案库、3D文物模型、高清影像与多媒体资料',
};

export default function ArchiveHallPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // 搜索文物
  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`🔍 搜索结果\n\n关键词："${searchQuery}"\n\n找到 ${Math.floor(Math.random() * 50 + 10)} 个相关文物\n\n功能开发中，敬请期待！`);
    } else {
      alert('⚠️ 请输入搜索关键词');
    }
  };

  // 查看3D模型
  const handle3DView = (artifactName: string) => {
    alert(`🎲 3D模型查看器\n\n正在加载：${artifactName}\n\n功能包括：\n• 360°旋转查看\n• 放大缩小\n• 材质细节展示\n• 尺寸标注\n\n完整版即将推出！`);
  };

  // AR体验
  const handleARView = (artifactName: string) => {
    alert(`📱 AR增强现实\n\n${artifactName}\n\n使用手机扫描二维码\n将文物投放到现实空间\n\n需要支持WebXR的浏览器`);
  };

  // 查看全部文物
  const handleViewAll = () => {
    alert('📚 完整文物库\n\n收录文物：10,000+\n高清图片：50,000+\n3D模型：500+\n\n即将跳转到文物浏览页面...');
  };

  // 3D模型控制
  const handle3DControl = (action: string) => {
    const actions = {
      '重置': '已重置到初始视角',
      '截图': '截图已保存到相册',
      '下载': '模型文件正在下载...'
    };
    alert(`✅ ${actions[action as keyof typeof actions]}`);
  };

  // 浏览学术资源
  const handleBrowseResources = (category: string) => {
    alert(`📖 ${category}\n\n即将打开资源库...\n\n包含：\n• 学术论文\n• 研究报告\n• 考古记录\n• 开放数据`);
  };

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-amber-600 via-yellow-500 to-orange-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 p-8">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-lg"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            数字遗产
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            Digital Heritage Archive
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">
            文化宝库与档案中心 • 永久保存 • 开放访问
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
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white transition-colors text-sm font-medium"
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 文物数字档案库 */}
      <section id="artifacts" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🏺"
            title="文物数字档案库"
            subtitle="Digital Artifact Archive"
            description="高清影像 • 3D模型 • 详细文字说明 • 多语言支持"
          />

          <div className="mt-12">
            {/* 搜索栏 */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="搜索文物名称、类别、时期..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-6 py-4 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-amber-600 focus:outline-none dark:bg-gray-800"
                  />
                </div>
                <button onClick={handleSearch} className="btn-embroidery px-8">
                  🔍 搜索
                </button>
              </div>

              {/* 快速筛选 */}
              <div className="flex flex-wrap gap-2 mt-4">
                {quickFilters.map((filter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedFilter(filter);
                      alert(`🏷️ 筛选：${filter}\n\n正在加载相关文物...`);
                    }}
                    className={`px-4 py-2 rounded-full transition-colors text-sm ${
                      selectedFilter === filter
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-600 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* 文物网格展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {artifactSamples.map((artifact, idx) => (
                <div key={idx} className="artifact-card">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                    <div className="artifact-image absolute inset-0 flex items-center justify-center text-6xl">
                      {artifact.icon}
                    </div>
                    <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                      {artifact.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-1">{artifact.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{artifact.period}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {artifact.description}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handle3DView(artifact.name)}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200"
                      >
                        3D 查看
                      </button>
                      <button
                        onClick={() => handleARView(artifact.name)}
                        className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200"
                      >
                        AR 体验
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button onClick={handleViewAll} className="btn-embroidery px-8 py-4">
                查看全部 10,000+ 文物 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3D模型库 */}
      <section id="3d-models" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="🎲"
            title="3D 文物模型库"
            subtitle="Three.js Viewer"
            description="360°旋转查看 • 细节放大 • 材质展示 • 自由下载"
          />

          <div className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 3D查看器 */}
              <div className="card-cultural overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-8xl mb-4 animate-[drumRotate_6s_linear_infinite]">
                        🥁
                      </div>
                      <p className="text-xl font-bold">铜鼓 3D 模型</p>
                      <p className="text-sm opacity-75 mt-2">拖拽旋转 • 滚轮缩放</p>
                    </div>
                  </div>

                  {/* 控制按钮 */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                      onClick={() => handle3DControl('重置')}
                      className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/30"
                    >
                      🔄 重置
                    </button>
                    <button
                      onClick={() => handle3DControl('截图')}
                      className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/30"
                    >
                      📷 截图
                    </button>
                    <button
                      onClick={() => handle3DControl('下载')}
                      className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm hover:bg-white/30"
                    >
                      📥 下载
                    </button>
                  </div>
                </div>
              </div>

              {/* 模型信息 */}
              <div className="space-y-6">
                <div className="card-cultural p-6">
                  <h3 className="text-xl font-bold mb-4">战国铜鼓</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">时期</span>
                      <span className="font-medium">战国时期 (公元前475-221年)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">材质</span>
                      <span className="font-medium">青铜</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">尺寸</span>
                      <span className="font-medium">高 60cm • 直径 80cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">重量</span>
                      <span className="font-medium">约 45kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">出土地点</span>
                      <span className="font-medium">广西崇左</span>
                    </div>
                  </div>
                </div>

                <div className="card-cultural p-6">
                  <h4 className="font-bold mb-3">模型信息</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">▸</span>
                      扫描方式：结构光三维扫描
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">▸</span>
                      多边形数：150,000 faces
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">▸</span>
                      纹理分辨率：4K (4096×4096)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">▸</span>
                      文件格式：GLB, GLTF, OBJ
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleARView('战国铜鼓')}
                    className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    📱 AR 查看
                  </button>
                  <button
                    onClick={() => alert('📥 下载模型\n\n文件格式：\n• GLB (推荐)\n• GLTF\n• OBJ\n\n文件大小：约 50MB\n\n开始下载...')}
                    className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    📥 下载模型
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 高清影像库 */}
      <section id="images" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="📸"
            title="高清影像库"
            subtitle="4K+ Ultra HD"
            description="专业摄影 • 多角度展示 • X光透视 • 红外成像"
          />

          <div className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageSamples.map((image, idx) => (
                <div key={idx} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {image.icon}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-sm font-medium mb-1">{image.title}</div>
                      <div className="text-xs opacity-75">{image.resolution}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 多媒体资料库 */}
      <section id="multimedia" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="🎬"
            title="多媒体资料库"
            subtitle="Audio & Video"
            description="纪录片 • 讲座视频 • 专家解说 • 民族音乐"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {multimediaSamples.map((media, idx) => (
              <div key={idx} className="card-cultural overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 relative group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-6xl mb-3">{media.icon}</div>
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <span className="text-3xl">▶️</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {media.duration}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-amber-600 font-medium mb-2">{media.category}</div>
                  <h4 className="font-bold mb-2">{media.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{media.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 学术资源中心 */}
      <section id="research" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="📚"
            title="学术资源中心"
            subtitle="Research Materials"
            description="学术论文 • 研究报告 • 考古资料 • 开放数据"
          />

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {researchCategories.map((category, idx) => (
                <div key={idx} className="card-cultural p-8">
                  <div className="flex items-start gap-6">
                    <div className="text-5xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{category.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{category.count} 项资源</span>
                        <button
                          onClick={() => handleBrowseResources(category.title)}
                          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                        >
                          浏览 →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 开放数据API */}
            <div className="card-cultural p-8 mt-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🔓</div>
                <h3 className="text-2xl font-bold mb-2">开放数据 API</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  为研究者和开发者提供免费的数据访问接口
                </p>
              </div>

              <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="mb-2">// 获取文物列表</div>
                <div className="text-blue-400">GET</div> https://api.guangxi-asean.com/v1/artifacts
                <div className="mt-4 mb-2">// 获取文物详情</div>
                <div className="text-blue-400">GET</div> https://api.guangxi-asean.com/v1/artifacts/:id
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => alert('📖 API文档\n\nRESTful API端点：\n• GET /artifacts - 获取文物列表\n• GET /artifacts/:id - 获取详情\n• GET /search - 搜索文物\n\n认证方式：API Key\n频率限制：1000次/小时\n\n完整文档即将上线！')}
                  className="btn-embroidery"
                >
                  📖 查看 API 文档
                </button>
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
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors font-medium"
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
      <p className="text-sm text-amber-600 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'artifacts', title: '文物档案', icon: '🏺' },
  { id: '3d-models', title: '3D模型', icon: '🎲' },
  { id: 'images', title: '高清影像', icon: '📸' },
  { id: 'multimedia', title: '多媒体', icon: '🎬' },
  { id: 'research', title: '学术资源', icon: '📚' },
];

const quickFilters = [
  '壮族文化', '东盟文物', '陶器', '青铜器', '织物', '建筑', '乐器', '节日用品'
];

const artifactSamples = [
  { icon: '🥁', name: '战国铜鼓', period: '公元前475-221年', type: '青铜器', description: '壮族祭祀与庆典的重要礼器，表面装饰精美纹样' },
  { icon: '🧵', name: '壮锦', period: '明清时期', type: '织物', description: '壮族传统织造工艺，色彩鲜艳，图案精美' },
  { icon: '🏺', name: '彩陶罐', period: '新石器时代', type: '陶器', description: '红陶质地，表面绘有几何纹样和动物图案' },
  { icon: '🗿', name: '石狮雕像', period: '清代', type: '石雕', description: '守护建筑的传统雕塑，形态威武雄壮' },
];

const imageSamples = [
  { icon: '🏔️', title: '桂林山水', resolution: '8K' },
  { icon: '🏛️', title: '古建筑', resolution: '6K' },
  { icon: '🎨', title: '壮锦纹样', resolution: '4K' },
  { icon: '📜', title: '岩画拓片', resolution: '4K' },
  { icon: '🗿', title: '石刻文物', resolution: '6K' },
  { icon: '🥁', title: '铜鼓细节', resolution: '8K' },
  { icon: '🏠', title: '干栏建筑', resolution: '4K' },
  { icon: '🎭', title: '节日庆典', resolution: '6K' },
];

const multimediaSamples = [
  {
    icon: '🎥',
    category: '纪录片',
    title: '左江花山岩画的秘密',
    description: '探索古骆越人的文化遗产与稻作文明',
    duration: '45:30'
  },
  {
    icon: '🎙️',
    category: '专家讲座',
    title: '壮锦织造技艺传承',
    description: '非遗传承人讲述壮锦制作全过程',
    duration: '32:15'
  },
  {
    icon: '🎵',
    category: '民族音乐',
    title: '壮族山歌集',
    description: '传统山歌演唱与乐器演奏合集',
    duration: '1:12:00'
  },
];

const researchCategories = [
  {
    icon: '📄',
    title: '学术论文',
    description: '考古、民族学、历史学等领域的研究论文',
    count: 500
  },
  {
    icon: '📊',
    title: '考古报告',
    description: '文物发掘、保护修复的详细记录',
    count: 200
  },
  {
    icon: '📖',
    title: '专著图书',
    description: '广西与东盟文化研究的专业书籍',
    count: 150
  },
  {
    icon: '📁',
    title: '开放数据集',
    description: '结构化的文物数据、图像数据集',
    count: 50
  },
];
