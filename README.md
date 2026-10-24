# 广西-东盟线上文化展

一个以广西壮族文化与东盟十国文化交流为主题的线上展览。
Next.js 14 静态站点，10 种语言，无后端、无数据库。

## 内容规模

| 项目 | 数量 |
| --- | --- |
| 主题展厅 | 6 个 |
| 东盟国家档案 | 10 国 |
| 文化亮点 | 40 条（每国 4 条） |
| UNESCO 遗产条目 | 30 条 |
| 文物档案 | 11 件 |
| 互动项目 | 4 个游戏 + 留言墙 |
| 语言 | 10 种 |
| 预渲染路由 | 243 个（24 页 × 10 语言，另加首页跳转、sitemap、robots） |

## 六个展厅

- **壮乡之韵** `/zh/guangxi` — 花山岩画、壮锦、铜鼓、干栏建筑、刘三姐、三月三
- **山水桂林** `/zh/guilin` — 漓江、喀斯特峰林、象鼻山、九马画山；含找马小游戏与可拖动缩放的实景照片
- **东盟十国** `/zh/asean` — 十国档案：概况、与广西的关联、文化亮点、UNESCO、节庆、饮食、礼仪
- **丝路新章** `/zh/exchange` — 交流历程、语言同源、中国-东盟博览会
- **数字遗产** `/zh/archive` — 11 件文物档案，可按类别、年代筛选与搜索；含铜鼓三维模型
- **互动体验** `/zh/interactive` — 文化知识问答、纹样连线、航线排序、抛绣球、社区留言墙

展厅之外还有：站内搜索（`/zh/search`）、人格测试（`/zh/persona`，5 题得出 16 种结果）、浏览进度与 9 枚徽章（仅存于本机）。

## 语言

`zh` `en` `vi` `th` `id` `ms` `my` `lo` `km` `tl`

字典按语言分块存放在 `src/i18n/dicts/`，缺失的键回退到中文；每个页面都由 `generateStaticParams` 预渲染。

## 技术栈

- Next.js 14（App Router，静态生成）
- TypeScript（strict）
- TailwindCSS
- three.js：仅用于档案页的铜鼓模型，程序化生成
- 自研零依赖 i18n（`src/i18n/`）

没有后端服务：搜索、进度、留言都在浏览器本地完成。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start
```

## 检查

```bash
npm run check           # TypeScript + 内容校验 + 单测
npm run check:content   # 死链、字典键、静态资源引用
npm run test            # 9 个内容测试
```

目前未接入 CI，以上命令均在本地执行。

## 目录

```text
src/app/[locale]/            页面：六个展厅、搜索、人格测试、法务页
src/components/              布局、展厅、交互与 UI 组件
src/lib/data/                东盟档案、文物、题库、人格与搜索索引
src/i18n/                    语言配置与分语言字典
public/images/               实拍照片、示意图、图标
public/diy/embroidery-ball/  绣球 DIY 独立网页
scripts/                     内容校验与图片处理脚本
tests/                       内容测试
data/photo-attribution.json  照片署名
```

## 素材与标注

- 大部分实拍照片来自 Wikimedia Commons，作者与许可见 `/zh/credits` 与 `data/photo-attribution.json`。
- 找不到合适实拍素材的条目使用生成的示意图，页面会注明「示意图」。
- 铜鼓三维模型是程序化示意，不是馆藏文物的实测扫描。

## 已知限制

- 三维内容只有铜鼓一件；没有第一人称漫游、AR、全景或音频。
- 社区留言与浏览进度只保存在本机，换设备不同步。
- 部分小国条目仍以示意图替代实拍。
- 无障碍做了键盘操作、语义化标签与跳转链接，但未做第三方 WCAG 审计。

## 许可

仓库尚未声明开源许可证。第三方照片的许可信息见上述署名文件。
