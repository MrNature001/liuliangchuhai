import type { Metadata } from 'next';
import Link from 'next/link';
import { ASEAN_COUNTRIES } from '@/constants/routes';

export const metadata: Metadata = {
  title: '东盟十国文化万花筒 - 文化展厅',
  description: '全面展示东盟十国的代表性文化元素、艺术形式与UNESCO遗产',
};

export default function AseanHallPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-asean-red via-asean-blue to-asean-yellow overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {ASEAN_COUNTRIES.map((country, idx) => (
            <div
              key={country.code}
              className="absolute text-9xl"
              style={{
                left: `${(idx * 10) % 100}%`,
                top: `${(idx * 15) % 100}%`,
              }}
            >
              {country.flag}
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            东盟十国文化万花筒
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            ASEAN Cultural Kaleidoscope
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">
            探索东南亚十国的多元文化、艺术瑰宝与UNESCO世界遗产
          </p>
        </div>
      </section>

      {/* 国家导航 */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-3">
            {ASEAN_COUNTRIES.map((country) => (
              <a
                key={country.code}
                href={`#${country.code}`}
                className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-asean-blue hover:text-white transition-colors text-sm font-medium"
              >
                <span className="text-xl">{country.flag}</span>
                {country.nameZh}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 泰国文化区 */}
      <section id="thailand" className="py-20">
        <div className="container-custom">
          <CountryHeader
            flag="🇹🇭"
            nameZh="泰国"
            nameEn="Thailand"
            tagline="微笑之国 • 佛教文化"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              icon="🏰"
              title="大皇宫"
              subtitle="Grand Palace"
              description="曼谷最著名的地标，金碧辉煌的泰式建筑群"
              color="from-yellow-400 to-amber-500"
            />
            <CulturalCard
              icon="💦"
              title="泼水节"
              subtitle="Songkran"
              description="泰国新年庆典，互泼水祈福，象征洗去厄运"
              color="from-blue-400 to-cyan-500"
            />
            <CulturalCard
              icon="🥊"
              title="泰拳"
              subtitle="Muay Thai"
              description="泰国国技，八肢艺术，刚柔并济的武术文化"
              color="from-red-500 to-orange-500"
            />
          </div>
        </div>
      </section>

      {/* 越南文化区 */}
      <section id="vietnam" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <CountryHeader
            flag="🇻🇳"
            nameZh="越南"
            nameEn="Vietnam"
            tagline="奥黛飘逸 • 水上木偶"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              icon="👘"
              title="奥黛"
              subtitle="Áo Dài"
              description="越南传统服饰，优雅飘逸，展现女性柔美"
              color="from-pink-400 to-rose-500"
            />
            <CulturalCard
              icon="🎭"
              title="水上木偶戏"
              subtitle="Water Puppetry"
              description="起源于11世纪红河三角洲，独特的民间艺术"
              color="from-blue-500 to-indigo-600"
            />
            <CulturalCard
              icon="🎊"
              title="春节"
              subtitle="Tết Festival"
              description="越南最重要的传统节日，家人团聚庆新年"
              color="from-red-400 to-pink-500"
            />
          </div>
        </div>
      </section>

      {/* 印度尼西亚文化区 */}
      <section id="indonesia" className="py-20">
        <div className="container-custom">
          <CountryHeader
            flag="🇮🇩"
            nameZh="印度尼西亚"
            nameEn="Indonesia"
            tagline="万岛之国 • 蜡染艺术"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <CulturalCard
              icon="🕌"
              title="婆罗浮屠"
              subtitle="Borobudur"
              description="世界最大的佛教建筑，9世纪的文化瑰宝"
              color="from-amber-600 to-orange-700"
            />
            <CulturalCard
              icon="🎨"
              title="蜡染"
              subtitle="Batik"
              description="2009年列入UNESCO非遗，精美的传统织物艺术"
              color="from-purple-500 to-pink-600"
            />
            <CulturalCard
              icon="🎪"
              title="皮影戏"
              subtitle="Wayang"
              description="传统戏剧艺术，结合音乐、舞蹈与哲学"
              color="from-gray-700 to-gray-900"
            />
          </div>
        </div>
      </section>

      {/* 其他七国概览 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-4">其他东盟国家</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            探索马来西亚、新加坡、菲律宾、柬埔寨、老挝、缅甸、文莱的文化魅力
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCountries.map((country) => (
              <Link
                key={country.code}
                href={`/zh/asean/${country.code}`}
                className="card-cultural group"
              >
                <div className={`aspect-square bg-gradient-to-br ${country.gradient} flex items-center justify-center`}>
                  <div className="text-8xl group-hover:scale-110 transition-transform">
                    {country.flag}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-asean-blue transition-colors">
                    {country.nameZh}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {country.nameEn}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {country.highlight}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UNESCO遗产专题 */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-4xl font-bold mb-4">UNESCO 世界遗产</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              东盟地区拥有众多世界文化遗产和非物质文化遗产
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {unescoSites.map((site, idx) => (
              <div key={idx} className="card-cultural overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${site.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{site.flag}</span>
                    <span className="text-sm text-gray-500">{site.country}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{site.nameZh}</h3>
                  <p className="text-sm text-gray-500 mb-3">{site.nameEn}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {site.description}
                  </p>
                  <div className="inline-block bg-asean-yellow/20 text-asean-blue px-3 py-1 rounded-full text-xs font-medium">
                    {site.year} 年列入
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href="/zh"
            className="inline-flex items-center gap-2 text-asean-blue hover:text-asean-red transition-colors font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function CountryHeader({ flag, nameZh, nameEn, tagline }: {
  flag: string;
  nameZh: string;
  nameEn: string;
  tagline: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8">
      <div className="text-8xl mb-4">{flag}</div>
      <h2 className="text-4xl font-bold mb-2">
        {nameZh}
      </h2>
      <p className="text-lg text-gray-500 mb-3">{nameEn}</p>
      <p className="text-gray-600 dark:text-gray-400">{tagline}</p>
    </div>
  );
}

function CulturalCard({ icon, title, subtitle, description, color }: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}) {
  return (
    <div className="card-cultural overflow-hidden group">
      <div className={`aspect-video bg-gradient-to-br ${color} flex items-center justify-center`}>
        <div className="text-7xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
}

// 数据定义
const otherCountries = [
  {
    code: 'malaysia',
    flag: '🇲🇾',
    nameZh: '马来西亚',
    nameEn: 'Malaysia',
    highlight: '双峰塔、拉茶文化、多元文化融合',
    gradient: 'from-blue-600 to-yellow-500',
  },
  {
    code: 'singapore',
    flag: '🇸🇬',
    nameZh: '新加坡',
    nameEn: 'Singapore',
    highlight: '鱼尾狮、花园城市、多元种族和谐',
    gradient: 'from-red-500 to-white',
  },
  {
    code: 'philippines',
    flag: '🇵🇭',
    nameZh: '菲律宾',
    nameEn: 'Philippines',
    highlight: 'Tinikling竹竿舞、Jeepney文化',
    gradient: 'from-blue-600 to-red-600',
  },
  {
    code: 'cambodia',
    flag: '🇰🇭',
    nameZh: '柬埔寨',
    nameEn: 'Cambodia',
    highlight: '吴哥窟、Apsara舞蹈、高棉文化',
    gradient: 'from-blue-800 to-red-700',
  },
  {
    code: 'laos',
    flag: '🇱🇦',
    nameZh: '老挝',
    nameEn: 'Laos',
    highlight: '琅勃拉邦、佛塔、传统纺织',
    gradient: 'from-red-600 to-blue-600',
  },
  {
    code: 'myanmar',
    flag: '🇲🇲',
    nameZh: '缅甸',
    nameEn: 'Myanmar',
    highlight: '仰光大金塔、Longyi服饰、木偶戏',
    gradient: 'from-yellow-500 to-green-600',
  },
  {
    code: 'brunei',
    flag: '🇧🇳',
    nameZh: '文莱',
    nameEn: 'Brunei',
    highlight: '清真寺、水上村落、伊斯兰文化',
    gradient: 'from-yellow-400 to-black',
  },
];

const unescoSites = [
  {
    flag: '🇰🇭',
    country: '柬埔寨',
    nameZh: '吴哥窟',
    nameEn: 'Angkor Wat',
    description: '世界最大的宗教建筑群，12世纪高棉帝国的辉煌遗迹',
    year: 1992,
    color: 'from-amber-500 to-orange-600',
  },
  {
    flag: '🇮🇩',
    country: '印度尼西亚',
    nameZh: '婆罗浮屠',
    nameEn: 'Borobudur',
    description: '世界最大的佛教建筑，9世纪佛教文化的巅峰之作',
    year: 1991,
    color: 'from-brown-600 to-amber-700',
  },
  {
    flag: '🇱🇦',
    country: '老挝',
    nameZh: '琅勃拉邦古城',
    nameEn: 'Luang Prabang',
    description: '保存完好的古城，佛教寺庙与法式殖民建筑的融合',
    year: 1995,
    color: 'from-blue-500 to-purple-600',
  },
  {
    flag: '🇻🇳',
    nameEn: 'Water Puppetry',
    country: '越南',
    nameZh: '水上木偶戏',
    description: '起源于11世纪的独特民间艺术，列入非物质文化遗产',
    year: 2008,
    color: 'from-green-500 to-teal-600',
  },
  {
    flag: '🇮🇩',
    country: '印度尼西亚',
    nameZh: '蜡染艺术',
    nameEn: 'Indonesian Batik',
    description: '精美的传统织物染色工艺，印尼文化的重要象征',
    year: 2009,
    color: 'from-purple-600 to-pink-600',
  },
  {
    flag: '🇵🇭',
    country: '菲律宾',
    nameZh: 'Ifugao梯田',
    nameEn: 'Rice Terraces',
    description: '2000年历史的山地梯田，人与自然和谐的典范',
    year: 1995,
    color: 'from-green-600 to-lime-600',
  },
];
