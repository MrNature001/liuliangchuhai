# 广西-东盟线上文化展（艺术博物馆）

**Guangxi-ASEAN Online Cultural Exhibition**

一个展现广西壮族文化特色与东盟十国文化交流的现代化线上博物馆平台。

A modern online museum platform showcasing Guangxi Zhuang culture and ASEAN cultural exchange.

---

## ✨ 核心特性 | Key Features

### 🏛️ 六大主题展厅 | Six Themed Galleries
- **壮乡之韵** - 广西民族文化（壮锦、铜鼓、左江花山岩画、三月三节日）
- **山水桂林** - 自然景观与诗意文化（桂林山水、喀斯特地貌、文人诗词）
- **东盟十国文化万花筒** - 东盟各国代表性文化元素
- **丝路新章** - 广西-东盟文化交流历程
- **数字遗产** - 文化宝库与档案中心
- **互动体验** - 文化游戏与社区广场

### 🌐 国际化支持 | Internationalization
支持 11 种语言 | Supports 11 languages:
- 中文（简体）| Chinese (Simplified)
- English | 英文
- Tiếng Việt | 越南语
- ภาษาไทย | 泰语
- Bahasa Indonesia | 印尼语
- Bahasa Melayu | 马来语
- ဗမာစာ | 缅甸语
- ພາສາລາວ | 老挝语
- ភាសាខ្មែរ | 高棉语
- Tagalog | 他加禄语

### 🎮 沉浸式体验 | Immersive Experience
- **3D 虚拟展厅** - WebGL/Three.js 驱动的第一人称漫游
- **AR 增强现实** - WebXR 图像识别与虚拟文物叠加
- **360° 全景浏览** - 桂林山水、吴哥窟等景观全景
- **互动游戏** - 三月三节日游戏、文化知识问答
- **位置音频** - 环境音效与民族音乐

### ♿ 无障碍访问 | Accessibility
- WCAG 2.2 AA 级标准合规
- 键盘全导航支持
- 屏幕阅读器优化
- 三种访问模式（纯文本 / 标准 2D+3D / 沉浸 VR/AR）
- 可调节字体大小和对比度

### 🚀 性能优化 | Performance
- PWA 渐进式 Web 应用
- 离线访问支持
- CDN 全球分发
- 懒加载与自适应质量
- 首次内容绘制 < 2.5 秒

---

## 🛠️ 技术栈 | Tech Stack

### 前端 | Frontend
- **框架**: Next.js 14 (App Router, SSR, SSG)
- **语言**: TypeScript 5
- **3D 渲染**: Three.js + React Three Fiber
- **AR**: WebXR
- **样式**: TailwindCSS + Framer Motion
- **国际化**: i18next + react-i18next
- **状态管理**: Zustand
- **数据获取**: React Query + SWR

### 后端 | Backend
- **CMS**: Strapi 4 (Headless)
- **API**: GraphQL + Apollo Server / REST
- **数据库**: PostgreSQL 15
- **搜索**: Elasticsearch 8
- **缓存**: Redis 7
- **对象存储**: S3 / 阿里云 OSS

### 媒体处理 | Media
- **CDN**: Cloudflare
- **图像优化**: Sharp / ImageKit
- **视频转码**: FFmpeg / AWS MediaConvert
- **3D 模型**: glTF/GLB (Draco 压缩)

---

## 📦 快速开始 | Quick Start

### 前置要求 | Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 安装依赖 | Install Dependencies
```bash
npm install
```

### 环境配置 | Environment Setup
复制 `.env.example` 为 `.env.local` 并配置环境变量：
```bash
cp .env.example .env.local
```

### 启动开发服务器 | Start Development Server
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本 | Build for Production
```bash
npm run build
npm run start
```

---

## 📁 项目结构 | Project Structure

```
guangxi-asean-cultural-exhibition/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── [locale]/          # 多语言路由
│   │   │   ├── guangxi/       # 广西文化展厅
│   │   │   ├── guilin/        # 桂林山水展厅
│   │   │   ├── asean/         # 东盟十国展厅
│   │   │   ├── exchange/      # 文化交流展厅
│   │   │   ├── archive/       # 数字遗产档案
│   │   │   ├── interactive/   # 互动体验
│   │   │   ├── 3d-hall/       # 3D 虚拟展厅
│   │   │   └── ar-experience/ # AR 体验
│   │   └── api/               # API 路由
│   ├── components/            # React 组件
│   │   ├── layout/           # 布局组件
│   │   ├── 3d/               # 3D 场景组件
│   │   ├── ar/               # AR 体验组件
│   │   ├── exhibition/       # 展览组件
│   │   ├── interactive/      # 互动游戏组件
│   │   ├── ui/               # UI 组件库
│   │   ├── search/           # 搜索组件
│   │   ├── accessibility/    # 无障碍组件
│   │   └── media/            # 媒体播放器
│   ├── lib/                  # 工具库
│   │   ├── i18n/            # 国际化配置
│   │   ├── api/             # API 客户端
│   │   ├── 3d/              # 3D 工具
│   │   ├── ar/              # AR 工具
│   │   └── utils/           # 通用工具
│   ├── hooks/               # 自定义 Hooks
│   ├── store/               # 状态管理
│   ├── styles/              # 全局样式
│   ├── types/               # TypeScript 类型
│   └── constants/           # 常量定义
├── public/                   # 静态资源
│   ├── locales/             # 翻译文件
│   ├── icons/               # 文化符号图标
│   ├── models/              # 3D 模型
│   ├── images/              # 图像资源
│   ├── audio/               # 音频资源
│   └── fonts/               # 字体文件
├── data/                     # 数据文件
│   ├── artifacts/           # 文物数据
│   ├── exhibitions/         # 展览配置
│   └── timeline/            # 历史时间轴
├── scripts/                  # 构建脚本
├── docs/                     # 项目文档
└── tests/                    # 测试文件
```

---

## 🎨 设计系统 | Design System

### 壮族传统配色 | Zhuang Traditional Colors
```css
/* 主色 | Primary Colors */
--color-red: #D73C2C;     /* 壮锦红 */
--color-blue: #1E5BA8;    /* 壮锦蓝 */
--color-black: #1A1A1A;   /* 壮锦黑 */

/* 辅助色 | Secondary Colors */
--color-gold: #D4AF37;    /* 金色 */
--color-green: #2E8B57;   /* 绿色 */

/* 水墨画风格 | Ink Painting Style */
--color-ink-black: #000000;
--color-ink-gray-dark: #333333;
--color-ink-gray: #808080;
--color-ink-gray-light: #CCCCCC;
--color-ink-cyan: #7FCDCD;
--color-ink-green: #90EE90;
```

### 文化符号库 | Cultural Symbol Library
- 100+ SVG 图标（壮锦纹样、铜鼓纹样、岩画图像、建筑轮廓）
- Lottie 动画组件（水墨晕染、铜鼓旋转、绣球弹跳）
- 自定义 UI 组件（绣球形按钮、竹筏形进度条、铜鼓形加载器）

---

## 🌍 多语言支持 | Multi-language Support

项目使用 `i18next` 和 `next-i18next` 实现国际化：

### 添加新翻译 | Add New Translation
1. 在 `public/locales/{locale}/common.json` 添加翻译键值
2. 在组件中使用 `useTranslation` Hook：
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

### URL 结构 | URL Structure
- 中文: `/zh/guangxi`
- 英文: `/en/guangxi`
- 越南语: `/vi/guangxi`
- 泰语: `/th/guangxi`

---

## ♿ 无障碍指南 | Accessibility Guide

### 键盘导航 | Keyboard Navigation
- `Tab` / `Shift+Tab`: 切换焦点
- `Enter`: 确认选择
- `Esc`: 关闭弹窗
- `方向键`: 3D 场景漫游

### 屏幕阅读器 | Screen Reader
所有图像提供有意义的 `alt` 文本，所有交互元素提供 ARIA 标签。

### 访问模式 | Access Modes
1. **纯文本模式**: 屏幕阅读器优化
2. **标准模式**: 2D 图像 + 3D 模型
3. **沉浸模式**: 全屏 VR/AR

---

## 📊 性能指标 | Performance Metrics

### 目标 | Targets
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Score: > 90

### 优化策略 | Optimization
- 图像懒加载与 WebP/AVIF 格式
- 3D 模型 LOD（细节层次）技术
- 代码分割与树摇优化
- CDN 全球分发
- Service Worker 缓存

---

## 🧪 测试 | Testing

### 单元测试 | Unit Tests
```bash
npm run test
```

### E2E 测试 | E2E Tests
```bash
npm run cypress:open
```

### 无障碍测试 | Accessibility Tests
```bash
npm run test:a11y
```

---

## 📝 文档 | Documentation

- [API 接口文档](docs/API.md)
- [系统架构文档](docs/ARCHITECTURE.md)
- [部署指南](docs/DEPLOYMENT.md)
- [无障碍访问指南](docs/ACCESSIBILITY.md)
- [国际化开发指南](docs/I18N.md)

---

## 🤝 贡献指南 | Contributing

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证 | License

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢 | Acknowledgments

- 广西壮族自治区文化和旅游厅
- 东盟各国文化部门
- 中国-东盟博览会秘书处
- UNESCO 世界文化遗产组织
- 所有文化传承人和志愿者

---

## 📧 联系方式 | Contact

项目维护者：[Your Name]
邮箱：[your.email@example.com]
项目主页：[https://github.com/yourusername/guangxi-asean-cultural-exhibition](https://github.com/yourusername/guangxi-asean-cultural-exhibition)

---

**Built with ❤️ for cultural preservation and exchange**

**为文化传承与交流而构建**
