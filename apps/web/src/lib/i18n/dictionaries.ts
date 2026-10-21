/**
 * UI copy for every language the interface can render. Keys are grouped by the
 * screen that uses them; each locale provides a complete, non-partial map so a
 * missing translation is a type error rather than a silent English fallback.
 */

import type { Locale } from "./locales"

export type Dictionary = {
  brand: { name: string; caption: string; footerTagline: string; footerRoute: string; footerNote: string }
  nav: { products: string; startAnalysis: string; home: string; browseProducts: string; demoNav: string; skip: string; mainNav: string; switchLanguage: string; language: string }
  hero: {
    eyebrow: string; title1: string; titleAccent: string; title2: string; intro: string
    startAnalysis: string; exploreProducts: string; note: string; loadingCatalog: string; loadingTitle: string
  }
  workflow: { eyebrow: string; title: string; steps: [string, string][] }
  featured: {
    eyebrow: string; title: string; subtitle: string; exploreAll: string; loading: string
    emptyTitle: string; emptyBody: string; unavailableTitle: string; unavailableBody: string
    visitCatalog: string; cardNumber: string; viewProduct: string; startAnalysis: string
  }
  heroExample: {
    topLeft: string; topRight: string; exampleEyebrow: string; demoRecommendation: string; caution: string
    sampleNote: string; sampleBody: string; tryProduct: string; emptyTitle1: string; emptyTitle2: string
    emptyBody: string; footProduct: string; footMarket: string; footContent: string; toMalaysia: string
  }
  outputs: { eyebrow: string; title1: string; title2: string; intro: string; demoNote: string; items: [string, string][] }
  cta: { eyebrow: string; title: string; body: string; start: string }
  catalog: {
    eyebrow: string; title: string; intro: string; emptyTitle: string; emptyBody: string
    countOne: string; countMany: string; price: string; viewProduct: string
  }
  detail: {
    breadcrumb: string; origin: string; price: string; analyze: string; visitSeller: string; newTab: string
    culturalBackground: string; howToUse: string; ingredients: string
  }
  images: {
    productAlt: string; unavailable: string; catalogMissing: string
    galleryLabel: string; showImage: string
  }
  productsError: { eyebrow: string; title: string; body: string; retry: string; back: string }
  productsLoading: { eyebrow: string; title: string; body: string }
  notFound: { eyebrow: string; title: string; body: string; browse: string }
  analysis: {
    eyebrow: string; title: string; intro: string; formTitle: string; formHint: string
    loadingProducts: string; retryCatalog: string; noProducts: string; reloadCatalog: string
    product: string; selectProduct: string; country: string; audience: string; optional: string
    notes: string; presetsLabel: string; analyze: string; analyzing: string; checkInputs: string
    statusAnalyzing: string; statusComplete: string; reportTitle: string; reportIdle: string
    reportPreparing: string; recommendation: string; heuristic: string; heuristicNote: string
    summary: string; targetAudiences: string; strengths: string; risks: string
    culturalAdvantages: string; marketingSuggestions: string; contentDirections: string
    noneProvided: string; recommendations: { strong_fit: string; fit: string; caution: string; not_recommended: string }
  }
  contentPlan: {
    title: string; intro: string; language: string; generate: string; generating: string
    statusGenerating: string; statusReady: string; keySellingPoints: string
    imagePrompt: string; shortVideoIdea: string; shortVideoPrompt: string; liveScript: string; socialCaption: string
    copy: string; copied: string; copyFailed: string
    languages: { en: string; zh: string; vi: string; th: string; ms: string; id: string }
  }
  digitalHuman: {
    title: string; intro: string; language: string; generate: string; generating: string
    statusGenerating: string; statusReady: string; placeholder: string; videoLabel: string
    mockNote: string
  }
  assistant: {
    label: string; eyebrow: string; title: string; subtitle: string; close: string; expand: string; collapse: string
    scope: string; contextProduct: string; welcomeTitle: string; welcomeProduct: string; welcomeGeneric: string
    you: string; thinking: string; retry: string; composerLabel: string; composerPlaceholder: string; send: string
    viewProduct: string; startAnalysis: string; conversationLabel: string
    promptsProduct: [string, string, string]; promptsGeneric: [string, string, string]
  }
  errors: {
    products: string; analysis: string; contentPlan: string; assistant: string; catalog: string
    digitalHuman: string
  }
}

const zh: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "本地根脉 · 全新天地", footerTagline: "流量出海", footerRoute: "中国广西 → 东盟市场", footerNote: "AI 辅助策略演示" },
  nav: { products: "商品", startAnalysis: "开始分析", home: "首页", browseProducts: "浏览商品", demoNav: "演示导航", skip: "跳到主要内容", mainNav: "主导航", switchLanguage: "切换语言", language: "语言" },
  hero: {
    eyebrow: "AI 辅助市场策略 · 演示", title1: "中国好物。", titleAccent: "东盟", title2: "无限可能。",
    intro: "用 AI 辅助的市场分析与内容策划，把广西地方特产变成新的市场机会。",
    startAnalysis: "开始分析", exploreProducts: "浏览商品", note: "一个产品故事。一个新市场。一个起点。",
    loadingCatalog: "正在加载示例商品…", loadingTitle: "本地根脉。全新天地。",
  },
  workflow: {
    eyebrow: "三步流程", title: "从地方根脉，走向新市场。",
    steps: [
      ["选择商品", "从一件地方特产开始，了解它的产地、配料与文化故事。"],
      ["分析市场", "选择东盟目标市场与人群，探索定位、机会与风险。"],
      ["生成策略", "把分析结果转化为内容方案，从社媒文案到短视频创意。"],
    ],
  },
  featured: {
    eyebrow: "根植广西", title: "小小产地，大大故事。", subtitle: "浏览本次演示精选的商品。",
    exploreAll: "浏览全部商品", loading: "正在加载精选商品…",
    emptyTitle: "新的商品故事正在路上。", emptyBody: "目录中暂时还没有商品，请稍后再来。",
    unavailableTitle: "精选商品暂时无法加载。", unavailableBody: "你仍然可以浏览演示的其他部分。",
    visitCatalog: "前往商品目录", cardNumber: "精选 / 0", viewProduct: "查看商品", startAnalysis: "开始分析",
  },
  heroExample: {
    topLeft: "地方根脉", topRight: "中国 → 东盟", exampleEyebrow: "一个可以探索的示例",
    demoRecommendation: "演示建议", caution: "谨慎", sampleNote: "示例输出：市场假设仍需验证。",
    sampleBody: "填写目标人群后，即可生成产品介绍与社媒文案。", tryProduct: "试用这个商品",
    emptyTitle1: "一个地方故事。", emptyTitle2: "一个新市场。", emptyBody: "选择一件商品与一个东盟市场，开始你的演示。",
    footProduct: "商品", footMarket: "市场", footContent: "内容", toMalaysia: "马来西亚",
  },
  outputs: {
    eyebrow: "超越最初的想法", title1: "更清晰的方向。", title2: "更有创意的起点。",
    intro: "先看清市场策略的轮廓，再把它落成一份内容方案。",
    demoNote: "本演示使用示例输出展示流程。市场假设仍需独立验证，部分分析字段可能为空。",
    items: [
      ["市场建议", "探索契合度、优势与风险的起点。"],
      ["目标人群", "聚焦市场探索所需的人群背景。"],
      ["文化定位", "产品背后的地方故事与传统。"],
      ["营销建议", "规划时可参考的方向建议。"],
      ["内容方向", "社媒文案、产品图片与视频的创意方向。"],
    ],
  },
  cta: { eyebrow: "下一段旅程", title: "准备好探索新市场了吗？", body: "从一件商品开始，看看它的故事能走多远。", start: "开始演示" },
  catalog: {
    eyebrow: "商品目录", title: "发现地方特产", intro: "浏览商品、了解它们的产地，以及背后的故事。",
    emptyTitle: "暂无商品", emptyBody: "目录目前为空，请稍后再来。",
    countOne: "件商品", countMany: "件商品", price: "价格", viewProduct: "查看商品",
  },
  detail: {
    breadcrumb: "← 全部商品", origin: "产地", price: "价格", analyze: "分析市场契合度",
    visitSeller: "访问卖家网站", newTab: "（在新标签页打开）",
    culturalBackground: "文化背景", howToUse: "使用方法", ingredients: "配料",
  },
  images: {
    productAlt: "{name} — 商品图片 {index}", unavailable: "图片暂不可用", catalogMissing: "未提供图片",
    galleryLabel: "{name} 图片", showImage: "查看第 {index} 张，共 {total} 张",
  },
  productsError: { eyebrow: "商品目录", title: "无法加载商品", body: "商品信息暂时不可用，请稍后重试。", retry: "重试", back: "返回目录" },
  productsLoading: { eyebrow: "商品目录", title: "正在加载商品…", body: "正在获取商品信息。" },
  notFound: { eyebrow: "商品未找到 · 404", title: "该商品不可用", body: "它可能已被移除，或者链接有误。", browse: "浏览全部商品" },
  analysis: {
    eyebrow: "商品 · 市场分析", title: "探索商品的市场契合度",
    intro: "选择一件目录商品与一个目标市场，生成结构化的策划报告。",
    formTitle: "设定分析背景", formHint: "商品与国家为必填项。",
    loadingProducts: "正在加载商品…", retryCatalog: "重试加载目录", noProducts: "暂无可选商品。", reloadCatalog: "重新加载目录",
    product: "商品", selectProduct: "请选择商品", country: "国家", audience: "目标人群", optional: "选填",
    notes: "市场备注", presetsLabel: "东盟市场快捷选择", analyze: "分析商品", analyzing: "分析中…",
    checkInputs: "请检查表单填写。", statusAnalyzing: "正在分析你选择的商品…", statusComplete: "分析完成。",
    reportTitle: "分析报告", reportIdle: "提交商品与市场后，即可查看建议、优势、风险与建议方向。",
    reportPreparing: "报告正在生成。", recommendation: "建议", heuristic: "启发式评分",
    heuristicNote: "这是策划参考指标，不是概率或销售预测。",
    summary: "摘要", targetAudiences: "目标人群", strengths: "优势", risks: "风险",
    culturalAdvantages: "文化优势", marketingSuggestions: "营销建议", contentDirections: "内容方向",
    noneProvided: "暂无内容。",
    recommendations: { strong_fit: "高度契合", fit: "契合", caution: "谨慎", not_recommended: "不建议" },
  },
  contentPlan: {
    title: "内容方案", intro: "基于本次分析生成营销文案与创意提示词。不生成图片或视频；发布前请核实产品表述与当地适用性。",
    language: "目标语言", generate: "生成内容方案", generating: "生成中…",
    statusGenerating: "正在生成内容方案…", statusReady: "内容方案已生成。", keySellingPoints: "核心卖点",
    imagePrompt: "图片提示词", shortVideoIdea: "短视频创意", shortVideoPrompt: "短视频脚本",
    liveScript: "直播话术", socialCaption: "社媒文案",
    copy: "复制", copied: "已复制", copyFailed: "复制失败",
    languages: { en: "英语", zh: "中文", vi: "越南语", th: "泰语", ms: "马来语", id: "印尼语" },
  },
  digitalHuman: {
    title: "数字人口播视频", intro: "用上方生成的话术与数字人生成一段口播视频。",
    language: "口播语言", generate: "生成视频", generating: "生成中…",
    statusGenerating: "正在渲染数字人视频，可能需要几分钟…", statusReady: "视频已生成。",
    placeholder: "尚未生成视频", videoLabel: "数字人口播视频",
    mockNote: "当前为演示模式：返回的是占位地址，不会渲染真实视频。",
  },
  assistant: {
    label: "商品助手", eyebrow: "广西 · 商品导览", title: "桂品 AI 助手", subtitle: "了解商品 · 文化背景 · 出海分析",
    close: "收起助手", expand: "打开桂品 AI 助手", collapse: "收起桂品 AI 助手",
    scope: "仅提供当前 Demo 商品及跨境展示相关咨询", contextProduct: "当前商品",
    welcomeTitle: "从一个小问题开始", welcomeProduct: "一起了解这件广西特色商品。",
    welcomeGeneric: "浏览广西特色商品，发现它们的文化与可能性。",
    you: "你", thinking: "AI 正在思考…", retry: "重试", composerLabel: "想了解什么？",
    composerPlaceholder: "问问商品、文化或出海分析", send: "发送", viewProduct: "查看商品",
    startAnalysis: "开始出海分析", conversationLabel: "助手对话",
    promptsProduct: ["这个商品有什么特点？", "有什么文化背景？", "适合进入哪些海外市场？"],
    promptsGeneric: ["你能帮我了解哪些商品？", "如何了解商品文化背景？", "如何开始出海分析？"],
  },
  errors: {
    products: "无法加载商品，请重试。", analysis: "无法完成分析，请重试。",
    contentPlan: "无法生成内容方案，请重试。", assistant: "当前助手暂时无法回答，请稍后再试。", catalog: "无法加载商品目录。",
      digitalHuman: "数字人视频暂时无法生成，请稍后再试。",
  },
}

const en: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "LOCAL ROOTS. NEW HORIZONS.", footerTagline: "流量出海", footerRoute: "Guangxi, China → ASEAN markets", footerNote: "An AI-assisted strategy demo" },
  nav: { products: "Products", startAnalysis: "Start Analysis", home: "Home", browseProducts: "Browse products", demoNav: "Demo navigation", skip: "Skip to content", mainNav: "Main navigation", switchLanguage: "Switch language", language: "Language" },
  hero: {
    eyebrow: "AI-ASSISTED MARKET STRATEGY · DEMO", title1: "Chinese products.", titleAccent: "ASEAN", title2: "possibilities.",
    intro: "Turn local products from Guangxi, China into new market possibilities with AI-assisted analysis and content strategy.",
    startAnalysis: "Start Analysis", exploreProducts: "Explore Products", note: "A product story. A new market. A place to begin.",
    loadingCatalog: "Loading a catalog example…", loadingTitle: "Local roots. New horizons.",
  },
  workflow: {
    eyebrow: "THE JOURNEY", title: "From local roots to new markets.",
    steps: [
      ["Select Product", "Start with a local specialty. Get to know its origins, ingredients, and cultural story."],
      ["Analyze Market", "Choose an ASEAN market and an audience to explore positioning, opportunities, and risks."],
      ["Generate Strategy", "Turn the analysis into a content plan, from a social caption to a short video concept."],
    ],
  },
  featured: {
    eyebrow: "ROOTED IN GUANGXI", title: "Small origins. Big stories.", subtitle: "Explore featured products, handpicked for this demo.",
    exploreAll: "Explore all products", loading: "Loading featured products…",
    emptyTitle: "New product stories are on the way.", emptyBody: "There are no products in the catalog yet. Please check back later.",
    unavailableTitle: "The collection is taking a moment.", unavailableBody: "Featured products are temporarily unavailable. You can still explore the demo.",
    visitCatalog: "Visit the product catalog", cardNumber: "THE COLLECTION / 0", viewProduct: "View Product", startAnalysis: "Start Analysis",
  },
  heroExample: {
    topLeft: "LOCAL ROOTS", topRight: "CHINA → ASEAN", exampleEyebrow: "AN EXAMPLE TO EXPLORE",
    demoRecommendation: "Demo recommendation", caution: "Caution", sampleNote: "Sample output: market assumptions need validation.",
    sampleBody: "Add your audience, then create a product introduction and social caption.", tryProduct: "Try this product",
    emptyTitle1: "A local story.", emptyTitle2: "A new market.", emptyBody: "Choose a product and an ASEAN market to begin your demo.",
    footProduct: "PRODUCT", footMarket: "MARKET", footContent: "CONTENT", toMalaysia: "Malaysia",
  },
  outputs: {
    eyebrow: "BEYOND THE FIRST IDEA", title1: "A clearer direction.", title2: "A creative starting point.",
    intro: "Explore the shape of a market strategy, then take it into a content plan.",
    demoNote: "This demo uses sample outputs to show the workflow. Market assumptions still need validation; some analysis fields may be empty.",
    items: [
      ["Market recommendation", "A starting point for exploring fit, strengths, and risks."],
      ["Customer segments", "Audience context to focus your market exploration."],
      ["Cultural positioning", "The local story and traditions behind your product."],
      ["Marketing suggestions", "Suggested directions to consider in your planning."],
      ["Content directions", "Ideas for social captions, product imagery, and video."],
    ],
  },
  cta: { eyebrow: "YOUR NEXT CHAPTER", title: "Ready to explore new markets?", body: "Start with a product. Discover where its story could go.", start: "Start Demo" },
  catalog: {
    eyebrow: "The product collection", title: "Discover local specialties", intro: "Explore products, their origins, and the stories behind them.",
    emptyTitle: "No products yet", emptyBody: "The catalog is currently empty. Please check back later.",
    countOne: "product", countMany: "products", price: "Price", viewProduct: "View product",
  },
  detail: {
    breadcrumb: "← All products", origin: "Origin", price: "Price", analyze: "Analyze market fit",
    visitSeller: "Visit seller website", newTab: "(opens in a new tab)",
    culturalBackground: "Cultural background", howToUse: "How to use", ingredients: "Ingredients",
  },
  images: {
    productAlt: "{name} — product image {index}", unavailable: "Image unavailable", catalogMissing: "Catalog image not provided",
    galleryLabel: "{name} images", showImage: "Show image {index} of {total}",
  },
  productsError: { eyebrow: "The product collection", title: "Unable to load products", body: "Product information is temporarily unavailable. Please try again.", retry: "Try again", back: "Back to catalog" },
  productsLoading: { eyebrow: "The product collection", title: "Loading products…", body: "Retrieving product information." },
  notFound: { eyebrow: "Product not found · 404", title: "This product is unavailable", body: "It may have been removed, or the link may be incorrect.", browse: "Browse all products" },
  analysis: {
    eyebrow: "Product · Market analysis", title: "Explore a product's market fit",
    intro: "Choose a catalog product and a target market to build a structured planning report.",
    formTitle: "Set the context", formHint: "Product and country are required.",
    loadingProducts: "Loading products…", retryCatalog: "Retry catalog", noProducts: "No products are available.", reloadCatalog: "Reload catalog",
    product: "Product", selectProduct: "Select a product", country: "Country", audience: "Target audience", optional: "optional",
    notes: "Market notes", presetsLabel: "ASEAN market shortcuts", analyze: "Analyze product", analyzing: "Analyzing…",
    checkInputs: "Please check the form inputs.", statusAnalyzing: "Analyzing your selected product…", statusComplete: "Analysis complete.",
    reportTitle: "Analysis report", reportIdle: "Submit a product and market to see the recommendation, strengths, risks and suggested directions.",
    reportPreparing: "Your report is being prepared.", recommendation: "Recommendation", heuristic: "Heuristic score",
    heuristicNote: "This is a heuristic planning indicator, not a probability or sales forecast.",
    summary: "Summary", targetAudiences: "Target audiences", strengths: "Strengths", risks: "Risks",
    culturalAdvantages: "Cultural advantages", marketingSuggestions: "Marketing suggestions", contentDirections: "Content directions",
    noneProvided: "None provided.",
    recommendations: { strong_fit: "Strong fit", fit: "Fit", caution: "Caution", not_recommended: "Not recommended" },
  },
  contentPlan: {
    title: "Content plan", intro: "Prepare marketing copy and creative prompts from this analysis. No images or videos are generated; review product claims and local suitability before use.",
    language: "Target language", generate: "Generate content plan", generating: "Generating…",
    statusGenerating: "Generating content plan…", statusReady: "Content plan ready.", keySellingPoints: "Key selling points",
    imagePrompt: "Image prompt", shortVideoIdea: "Short video idea", shortVideoPrompt: "Short video prompt",
    liveScript: "Live script", socialCaption: "Social caption",
    copy: "Copy", copied: "Copied", copyFailed: "Copy failed",
    languages: { en: "English", zh: "Chinese", vi: "Vietnamese", th: "Thai", ms: "Malay", id: "Indonesian" },
  },
  digitalHuman: {
    title: "Digital-human video", intro: "Turn the generated script into a presenter video.",
    language: "Spoken language", generate: "Generate video", generating: "Generating…",
    statusGenerating: "Rendering the digital-human video. This can take several minutes…", statusReady: "Video ready.",
    placeholder: "No video yet", videoLabel: "Digital-human presenter video",
    mockNote: "Demo mode: a placeholder address is returned and no video is rendered.",
  },
  assistant: {
    label: "Product assistant", eyebrow: "GUANGXI · PRODUCT GUIDE", title: "Guipin AI Assistant", subtitle: "Products · Culture · Market entry",
    close: "Close assistant", expand: "Open the Guipin AI assistant", collapse: "Close the Guipin AI assistant",
    scope: "Answers only about the current demo products and cross-border display", contextProduct: "Current product",
    welcomeTitle: "Start with a small question", welcomeProduct: "Let's look at this Guangxi specialty together.",
    welcomeGeneric: "Browse Guangxi specialties and discover their culture and possibilities.",
    you: "You", thinking: "AI is thinking…", retry: "Retry", composerLabel: "What would you like to know?",
    composerPlaceholder: "Ask about products, culture, or market entry", send: "Send", viewProduct: "View product",
    startAnalysis: "Start market analysis", conversationLabel: "Assistant conversation",
    promptsProduct: ["What makes this product special?", "What is its cultural background?", "Which overseas markets suit it?"],
    promptsGeneric: ["Which products can you tell me about?", "How do I learn a product's cultural background?", "How do I start a market analysis?"],
  },
  errors: {
    products: "Unable to load products. Please try again.", analysis: "Unable to run analysis. Please try again.",
    contentPlan: "Unable to create content plan. Please try again.", assistant: "The assistant is unavailable right now. Please try again later.", catalog: "Unable to load products. Please try again.",
      digitalHuman: "The digital-human video could not be generated. Please try again.",
  },
}

const vi: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "GỐC ĐỊA PHƯƠNG. CHÂN TRỜI MỚI.", footerTagline: "流量出海", footerRoute: "Quảng Tây, Trung Quốc → Thị trường ASEAN", footerNote: "Bản demo chiến lược hỗ trợ bởi AI" },
  nav: { products: "Sản phẩm", startAnalysis: "Bắt đầu phân tích", home: "Trang chủ", browseProducts: "Xem sản phẩm", demoNav: "Điều hướng demo", skip: "Chuyển đến nội dung", mainNav: "Điều hướng chính", switchLanguage: "Đổi ngôn ngữ", language: "Ngôn ngữ" },
  hero: {
    eyebrow: "CHIẾN LƯỢC THỊ TRƯỜNG HỖ TRỢ AI · DEMO", title1: "Sản phẩm Trung Quốc.", titleAccent: "ASEAN", title2: "nhiều khả năng.",
    intro: "Biến đặc sản địa phương Quảng Tây thành cơ hội thị trường mới với phân tích và chiến lược nội dung hỗ trợ bởi AI.",
    startAnalysis: "Bắt đầu phân tích", exploreProducts: "Xem sản phẩm", note: "Một câu chuyện sản phẩm. Một thị trường mới. Một điểm khởi đầu.",
    loadingCatalog: "Đang tải ví dụ danh mục…", loadingTitle: "Gốc địa phương. Chân trời mới.",
  },
  workflow: {
    eyebrow: "HÀNH TRÌNH", title: "Từ gốc địa phương đến thị trường mới.",
    steps: [
      ["Chọn sản phẩm", "Bắt đầu với một đặc sản địa phương. Tìm hiểu nguồn gốc, nguyên liệu và câu chuyện văn hóa."],
      ["Phân tích thị trường", "Chọn một thị trường ASEAN và nhóm khách hàng để khám phá định vị, cơ hội và rủi ro."],
      ["Tạo chiến lược", "Chuyển phân tích thành kế hoạch nội dung, từ caption mạng xã hội đến ý tưởng video ngắn."],
    ],
  },
  featured: {
    eyebrow: "BẮT NGUỒN TỪ QUẢNG TÂY", title: "Nguồn gốc nhỏ. Câu chuyện lớn.", subtitle: "Khám phá các sản phẩm nổi bật được chọn cho bản demo này.",
    exploreAll: "Xem tất cả sản phẩm", loading: "Đang tải sản phẩm nổi bật…",
    emptyTitle: "Những câu chuyện sản phẩm mới đang đến.", emptyBody: "Danh mục hiện chưa có sản phẩm. Vui lòng quay lại sau.",
    unavailableTitle: "Bộ sưu tập đang tạm chờ.", unavailableBody: "Sản phẩm nổi bật tạm thời không khả dụng. Bạn vẫn có thể khám phá bản demo.",
    visitCatalog: "Truy cập danh mục sản phẩm", cardNumber: "BỘ SƯU TẬP / 0", viewProduct: "Xem sản phẩm", startAnalysis: "Bắt đầu phân tích",
  },
  heroExample: {
    topLeft: "GỐC ĐỊA PHƯƠNG", topRight: "TRUNG QUỐC → ASEAN", exampleEyebrow: "MỘT VÍ DỤ ĐỂ KHÁM PHÁ",
    demoRecommendation: "Gợi ý demo", caution: "Thận trọng", sampleNote: "Kết quả mẫu: giả định thị trường cần được kiểm chứng.",
    sampleBody: "Thêm nhóm khách hàng, sau đó tạo phần giới thiệu sản phẩm và caption mạng xã hội.", tryProduct: "Dùng thử sản phẩm này",
    emptyTitle1: "Một câu chuyện địa phương.", emptyTitle2: "Một thị trường mới.", emptyBody: "Chọn một sản phẩm và một thị trường ASEAN để bắt đầu bản demo.",
    footProduct: "SẢN PHẨM", footMarket: "THỊ TRƯỜNG", footContent: "NỘI DUNG", toMalaysia: "Malaysia",
  },
  outputs: {
    eyebrow: "VƯỢT XA Ý TƯỞNG ĐẦU TIÊN", title1: "Định hướng rõ ràng hơn.", title2: "Điểm khởi đầu sáng tạo.",
    intro: "Khám phá hình hài của một chiến lược thị trường, rồi chuyển thành kế hoạch nội dung.",
    demoNote: "Bản demo này dùng kết quả mẫu để minh họa quy trình. Giả định thị trường vẫn cần kiểm chứng; một số trường phân tích có thể để trống.",
    items: [
      ["Gợi ý thị trường", "Điểm khởi đầu để khám phá độ phù hợp, thế mạnh và rủi ro."],
      ["Nhóm khách hàng", "Bối cảnh khách hàng để tập trung khám phá thị trường."],
      ["Định vị văn hóa", "Câu chuyện và truyền thống địa phương phía sau sản phẩm."],
      ["Gợi ý marketing", "Các hướng gợi ý để cân nhắc trong kế hoạch."],
      ["Hướng nội dung", "Ý tưởng cho caption, hình ảnh sản phẩm và video."],
    ],
  },
  cta: { eyebrow: "CHƯƠNG TIẾP THEO", title: "Sẵn sàng khám phá thị trường mới?", body: "Bắt đầu từ một sản phẩm. Khám phá xem câu chuyện của nó có thể đi đến đâu.", start: "Bắt đầu demo" },
  catalog: {
    eyebrow: "Danh mục sản phẩm", title: "Khám phá đặc sản địa phương", intro: "Tìm hiểu sản phẩm, nguồn gốc và câu chuyện phía sau chúng.",
    emptyTitle: "Chưa có sản phẩm", emptyBody: "Danh mục hiện đang trống. Vui lòng quay lại sau.",
    countOne: "sản phẩm", countMany: "sản phẩm", price: "Giá", viewProduct: "Xem sản phẩm",
  },
  detail: {
    breadcrumb: "← Tất cả sản phẩm", origin: "Nguồn gốc", price: "Giá", analyze: "Phân tích độ phù hợp thị trường",
    visitSeller: "Truy cập website người bán", newTab: "(mở trong tab mới)",
    culturalBackground: "Bối cảnh văn hóa", howToUse: "Cách sử dụng", ingredients: "Thành phần",
  },
  images: {
    productAlt: "{name} — hình ảnh sản phẩm {index}", unavailable: "Hình ảnh tạm thời không có", catalogMissing: "Chưa cung cấp hình ảnh",
    galleryLabel: "Hình ảnh {name}", showImage: "Xem hình {index} trên {total}",
  },
  productsError: { eyebrow: "Danh mục sản phẩm", title: "Không thể tải sản phẩm", body: "Thông tin sản phẩm tạm thời không khả dụng. Vui lòng thử lại.", retry: "Thử lại", back: "Về danh mục" },
  productsLoading: { eyebrow: "Danh mục sản phẩm", title: "Đang tải sản phẩm…", body: "Đang lấy thông tin sản phẩm." },
  notFound: { eyebrow: "Không tìm thấy sản phẩm · 404", title: "Sản phẩm này không khả dụng", body: "Có thể nó đã bị xóa, hoặc liên kết không đúng.", browse: "Xem tất cả sản phẩm" },
  analysis: {
    eyebrow: "Sản phẩm · Phân tích thị trường", title: "Khám phá độ phù hợp thị trường",
    intro: "Chọn một sản phẩm trong danh mục và một thị trường mục tiêu để tạo báo cáo kế hoạch có cấu trúc.",
    formTitle: "Thiết lập bối cảnh", formHint: "Sản phẩm và quốc gia là bắt buộc.",
    loadingProducts: "Đang tải sản phẩm…", retryCatalog: "Thử lại danh mục", noProducts: "Không có sản phẩm nào.", reloadCatalog: "Tải lại danh mục",
    product: "Sản phẩm", selectProduct: "Chọn một sản phẩm", country: "Quốc gia", audience: "Nhóm khách hàng", optional: "không bắt buộc",
    notes: "Ghi chú thị trường", presetsLabel: "Chọn nhanh thị trường ASEAN", analyze: "Phân tích sản phẩm", analyzing: "Đang phân tích…",
    checkInputs: "Vui lòng kiểm tra thông tin trong biểu mẫu.", statusAnalyzing: "Đang phân tích sản phẩm bạn chọn…", statusComplete: "Phân tích hoàn tất.",
    reportTitle: "Báo cáo phân tích", reportIdle: "Gửi sản phẩm và thị trường để xem gợi ý, thế mạnh, rủi ro và hướng đề xuất.",
    reportPreparing: "Báo cáo đang được chuẩn bị.", recommendation: "Gợi ý", heuristic: "Điểm heuristic",
    heuristicNote: "Đây là chỉ số tham khảo cho lập kế hoạch, không phải xác suất hay dự báo doanh số.",
    summary: "Tóm tắt", targetAudiences: "Nhóm khách hàng", strengths: "Thế mạnh", risks: "Rủi ro",
    culturalAdvantages: "Lợi thế văn hóa", marketingSuggestions: "Gợi ý marketing", contentDirections: "Hướng nội dung",
    noneProvided: "Chưa có nội dung.",
    recommendations: { strong_fit: "Rất phù hợp", fit: "Phù hợp", caution: "Thận trọng", not_recommended: "Không khuyến nghị" },
  },
  contentPlan: {
    title: "Kế hoạch nội dung", intro: "Chuẩn bị nội dung marketing và gợi ý sáng tạo từ phân tích này. Không tạo hình ảnh hay video; hãy kiểm tra tuyên bố sản phẩm và tính phù hợp địa phương trước khi dùng.",
    language: "Ngôn ngữ đích", generate: "Tạo kế hoạch nội dung", generating: "Đang tạo…",
    statusGenerating: "Đang tạo kế hoạch nội dung…", statusReady: "Kế hoạch nội dung đã sẵn sàng.", keySellingPoints: "Điểm bán hàng chính",
    imagePrompt: "Gợi ý hình ảnh", shortVideoIdea: "Ý tưởng video ngắn", shortVideoPrompt: "Kịch bản video ngắn",
    liveScript: "Kịch bản livestream", socialCaption: "Caption mạng xã hội",
    copy: "Sao chép", copied: "Đã sao chép", copyFailed: "Không sao chép được",
    languages: { en: "Tiếng Anh", zh: "Tiếng Trung", vi: "Tiếng Việt", th: "Tiếng Thái", ms: "Tiếng Mã Lai", id: "Tiếng Indonesia" },
  },
  digitalHuman: {
    title: "Video người dẫn ảo", intro: "Chuyển kịch bản vừa tạo thành video người dẫn.",
    language: "Ngôn ngữ thuyết minh", generate: "Tạo video", generating: "Đang tạo…",
    statusGenerating: "Đang kết xuất video người dẫn ảo, có thể mất vài phút…", statusReady: "Video đã sẵn sàng.",
    placeholder: "Chưa có video", videoLabel: "Video người dẫn ảo",
    mockNote: "Chế độ demo: trả về địa chỉ tạm, không kết xuất video thật.",
  },
  assistant: {
    label: "Trợ lý sản phẩm", eyebrow: "QUẢNG TÂY · HƯỚNG DẪN SẢN PHẨM", title: "Trợ lý AI Guipin", subtitle: "Sản phẩm · Văn hóa · Phân tích thị trường",
    close: "Đóng trợ lý", expand: "Mở trợ lý AI Guipin", collapse: "Đóng trợ lý AI Guipin",
    scope: "Chỉ trả lời về sản phẩm demo hiện tại và trưng bày xuyên biên giới", contextProduct: "Sản phẩm hiện tại",
    welcomeTitle: "Bắt đầu từ một câu hỏi nhỏ", welcomeProduct: "Cùng tìm hiểu đặc sản Quảng Tây này.",
    welcomeGeneric: "Duyệt đặc sản Quảng Tây và khám phá văn hóa cùng tiềm năng của chúng.",
    you: "Bạn", thinking: "AI đang suy nghĩ…", retry: "Thử lại", composerLabel: "Bạn muốn biết điều gì?",
    composerPlaceholder: "Hỏi về sản phẩm, văn hóa hoặc phân tích thị trường", send: "Gửi", viewProduct: "Xem sản phẩm",
    startAnalysis: "Bắt đầu phân tích thị trường", conversationLabel: "Hội thoại trợ lý",
    promptsProduct: ["Sản phẩm này có gì đặc biệt?", "Bối cảnh văn hóa của nó là gì?", "Phù hợp với thị trường nước ngoài nào?"],
    promptsGeneric: ["Bạn có thể giới thiệu sản phẩm nào?", "Làm sao tìm hiểu bối cảnh văn hóa?", "Làm sao bắt đầu phân tích thị trường?"],
  },
  errors: {
    products: "Không thể tải sản phẩm. Vui lòng thử lại.", analysis: "Không thể chạy phân tích. Vui lòng thử lại.",
    contentPlan: "Không thể tạo kế hoạch nội dung. Vui lòng thử lại.", assistant: "Trợ lý hiện không khả dụng. Vui lòng thử lại sau.", catalog: "Không thể tải danh mục sản phẩm.",
      digitalHuman: "Không thể tạo video người dẫn ảo. Vui lòng thử lại.",
  },
}

const th: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "รากถิ่นฐาน สู่โลกใหม่", footerTagline: "流量出海", footerRoute: "กว่างซี จีน → ตลาดอาเซียน", footerNote: "เดโมกลยุทธ์ที่ขับเคลื่อนด้วย AI" },
  nav: { products: "สินค้า", startAnalysis: "เริ่มวิเคราะห์", home: "หน้าแรก", browseProducts: "ดูสินค้า", demoNav: "นำทางเดโม", skip: "ข้ามไปยังเนื้อหา", mainNav: "เมนูหลัก", switchLanguage: "เปลี่ยนภาษา", language: "ภาษา" },
  hero: {
    eyebrow: "กลยุทธ์การตลาดด้วย AI · เดโม", title1: "สินค้าจีน.", titleAccent: "อาเซียน", title2: "ความเป็นไปได้.",
    intro: "เปลี่ยนสินค้าท้องถิ่นจากกว่างซีให้เป็นโอกาสตลาดใหม่ ด้วยการวิเคราะห์และกลยุทธ์เนื้อหาที่ขับเคลื่อนด้วย AI",
    startAnalysis: "เริ่มวิเคราะห์", exploreProducts: "ดูสินค้า", note: "เรื่องราวสินค้าหนึ่งชิ้น ตลาดใหม่หนึ่งแห่ง จุดเริ่มต้นหนึ่งจุด",
    loadingCatalog: "กำลังโหลดตัวอย่างแคตตาล็อก…", loadingTitle: "รากถิ่นฐาน สู่โลกใหม่",
  },
  workflow: {
    eyebrow: "เส้นทาง", title: "จากรากถิ่นฐาน สู่ตลาดใหม่",
    steps: [
      ["เลือกสินค้า", "เริ่มจากของดีประจำถิ่น ทำความรู้จักแหล่งกำเนิด ส่วนผสม และเรื่องราววัฒนธรรม"],
      ["วิเคราะห์ตลาด", "เลือกตลาดอาเซียนและกลุ่มเป้าหมาย เพื่อสำรวจจุดยืน โอกาส และความเสี่ยง"],
      ["สร้างกลยุทธ์", "เปลี่ยนผลวิเคราะห์เป็นแผนเนื้อหา ตั้งแต่แคปชันโซเชียลจนถึงไอเดียวิดีโอสั้น"],
    ],
  },
  featured: {
    eyebrow: "หยั่งรากในกว่างซี", title: "ถิ่นเล็ก เรื่องเล่าใหญ่", subtitle: "สำรวจสินค้าแนะนำที่คัดสรรสำหรับเดโมนี้",
    exploreAll: "ดูสินค้าทั้งหมด", loading: "กำลังโหลดสินค้าแนะนำ…",
    emptyTitle: "เรื่องราวสินค้าใหม่กำลังจะมา", emptyBody: "ยังไม่มีสินค้าในแคตตาล็อก กรุณากลับมาอีกครั้ง",
    unavailableTitle: "คอลเลกชันกำลังโหลด", unavailableBody: "สินค้าแนะนำใช้งานไม่ได้ชั่วคราว คุณยังสำรวจเดโมส่วนอื่นได้",
    visitCatalog: "ไปที่แคตตาล็อกสินค้า", cardNumber: "คอลเลกชัน / 0", viewProduct: "ดูสินค้า", startAnalysis: "เริ่มวิเคราะห์",
  },
  heroExample: {
    topLeft: "รากถิ่นฐาน", topRight: "จีน → อาเซียน", exampleEyebrow: "ตัวอย่างที่สำรวจได้",
    demoRecommendation: "คำแนะนำเดโม", caution: "ระวัง", sampleNote: "ผลตัวอย่าง: สมมติฐานตลาดยังต้องตรวจสอบ",
    sampleBody: "เพิ่มกลุ่มเป้าหมาย แล้วสร้างคำแนะนำสินค้าและแคปชันโซเชียล", tryProduct: "ลองสินค้านี้",
    emptyTitle1: "เรื่องราวท้องถิ่นหนึ่งเรื่อง", emptyTitle2: "ตลาดใหม่อีกแห่ง", emptyBody: "เลือกสินค้าและตลาดอาเซียนเพื่อเริ่มเดโม",
    footProduct: "สินค้า", footMarket: "ตลาด", footContent: "เนื้อหา", toMalaysia: "มาเลเซีย",
  },
  outputs: {
    eyebrow: "เหนือกว่าไอเดียแรก", title1: "ทิศทางที่ชัดขึ้น", title2: "จุดเริ่มต้นที่สร้างสรรค์",
    intro: "สำรวจรูปทรงของกลยุทธ์การตลาด แล้วนำไปสู่แผนเนื้อหา",
    demoNote: "เดโมนี้ใช้ผลลัพธ์ตัวอย่างเพื่อแสดงขั้นตอน สมมติฐานตลาดยังต้องตรวจสอบอย่างอิสระ บางช่องวิเคราะห์อาจว่าง",
    items: [
      ["คำแนะนำตลาด", "จุดเริ่มต้นสำหรับสำรวจความเหมาะสม จุดแข็ง และความเสี่ยง"],
      ["กลุ่มลูกค้า", "บริบทกลุ่มเป้าหมายเพื่อโฟกัสการสำรวจตลาด"],
      ["จุดยืนทางวัฒนธรรม", "เรื่องราวและประเพณีท้องถิ่นเบื้องหลังสินค้า"],
      ["คำแนะนำการตลาด", "ทิศทางที่ควรพิจารณาในการวางแผน"],
      ["ทิศทางเนื้อหา", "ไอเดียสำหรับแคปชัน รูปสินค้า และวิดีโอ"],
    ],
  },
  cta: { eyebrow: "บทต่อไปของคุณ", title: "พร้อมสำรวจตลาดใหม่หรือยัง?", body: "เริ่มจากสินค้าหนึ่งชิ้น ค้นหาได้ว่าเรื่องราวของมันไปได้ไกลแค่ไหน", start: "เริ่มเดโม" },
  catalog: {
    eyebrow: "แคตตาล็อกสินค้า", title: "ค้นพบของดีประจำถิ่น", intro: "สำรวจสินค้า แหล่งกำเนิด และเรื่องราวเบื้องหลัง",
    emptyTitle: "ยังไม่มีสินค้า", emptyBody: "แคตตาล็อกว่างเปล่าในขณะนี้ กรุณากลับมาอีกครั้ง",
    countOne: "รายการ", countMany: "รายการ", price: "ราคา", viewProduct: "ดูสินค้า",
  },
  detail: {
    breadcrumb: "← สินค้าทั้งหมด", origin: "แหล่งกำเนิด", price: "ราคา", analyze: "วิเคราะห์ความเหมาะสมตลาด",
    visitSeller: "เยี่ยมชมเว็บไซต์ผู้ขาย", newTab: "(เปิดในแท็บใหม่)",
    culturalBackground: "ภูมิหลังทางวัฒนธรรม", howToUse: "วิธีใช้", ingredients: "ส่วนผสม",
  },
  images: {
    productAlt: "{name} — รูปสินค้า {index}", unavailable: "ไม่สามารถแสดงรูปได้", catalogMissing: "ยังไม่มีรูปสินค้า",
    galleryLabel: "รูปภาพ {name}", showImage: "ดูรูปที่ {index} จาก {total}",
  },
  productsError: { eyebrow: "แคตตาล็อกสินค้า", title: "โหลดสินค้าไม่ได้", body: "ข้อมูลสินค้าใช้งานไม่ได้ชั่วคราว กรุณาลองอีกครั้ง", retry: "ลองอีกครั้ง", back: "กลับไปแคตตาล็อก" },
  productsLoading: { eyebrow: "แคตตาล็อกสินค้า", title: "กำลังโหลดสินค้า…", body: "กำลังดึงข้อมูลสินค้า" },
  notFound: { eyebrow: "ไม่พบสินค้า · 404", title: "สินค้านี้ใช้งานไม่ได้", body: "อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง", browse: "ดูสินค้าทั้งหมด" },
  analysis: {
    eyebrow: "สินค้า · วิเคราะห์ตลาด", title: "สำรวจความเหมาะสมของสินค้า",
    intro: "เลือกสินค้าในแคตตาล็อกและตลาดเป้าหมาย เพื่อสร้างรายงานแผนที่มีโครงสร้าง",
    formTitle: "กำหนดบริบท", formHint: "สินค้าและประเทศเป็นสิ่งจำเป็น",
    loadingProducts: "กำลังโหลดสินค้า…", retryCatalog: "ลองโหลดแคตตาล็อกอีกครั้ง", noProducts: "ไม่มีสินค้าที่ใช้ได้", reloadCatalog: "โหลดแคตตาล็อกใหม่",
    product: "สินค้า", selectProduct: "เลือกสินค้า", country: "ประเทศ", audience: "กลุ่มเป้าหมาย", optional: "ไม่บังคับ",
    notes: "บันทึกตลาด", presetsLabel: "ทางลัดตลาดอาเซียน", analyze: "วิเคราะห์สินค้า", analyzing: "กำลังวิเคราะห์…",
    checkInputs: "กรุณาตรวจสอบข้อมูลในแบบฟอร์ม", statusAnalyzing: "กำลังวิเคราะห์สินค้าที่คุณเลือก…", statusComplete: "วิเคราะห์เสร็จสิ้น",
    reportTitle: "รายงานการวิเคราะห์", reportIdle: "ส่งสินค้าและตลาดเพื่อดูคำแนะนำ จุดแข็ง ความเสี่ยง และทิศทางที่เสนอ",
    reportPreparing: "กำลังเตรียมรายงานของคุณ", recommendation: "คำแนะนำ", heuristic: "คะแนนฮิวริสติก",
    heuristicNote: "นี่คือตัวชี้วัดเพื่อการวางแผน ไม่ใช่ความน่าจะเป็นหรือการพยากรณ์ยอดขาย",
    summary: "สรุป", targetAudiences: "กลุ่มเป้าหมาย", strengths: "จุดแข็ง", risks: "ความเสี่ยง",
    culturalAdvantages: "ข้อได้เปรียบทางวัฒนธรรม", marketingSuggestions: "คำแนะนำการตลาด", contentDirections: "ทิศทางเนื้อหา",
    noneProvided: "ไม่มีข้อมูล",
    recommendations: { strong_fit: "เหมาะสมมาก", fit: "เหมาะสม", caution: "ระวัง", not_recommended: "ไม่แนะนำ" },
  },
  contentPlan: {
    title: "แผนเนื้อหา", intro: "เตรียมข้อความการตลาดและพรอมป์สร้างสรรค์จากผลวิเคราะห์นี้ ไม่มีการสร้างรูปหรือวิดีโอ ควรตรวจสอบคำกล่าวอ้างสินค้าและความเหมาะสมท้องถิ่นก่อนใช้",
    language: "ภาษาเป้าหมาย", generate: "สร้างแผนเนื้อหา", generating: "กำลังสร้าง…",
    statusGenerating: "กำลังสร้างแผนเนื้อหา…", statusReady: "แผนเนื้อหาพร้อมแล้ว", keySellingPoints: "จุดขายหลัก",
    imagePrompt: "พรอมป์รูปภาพ", shortVideoIdea: "ไอเดียวิดีโอสั้น", shortVideoPrompt: "สคริปต์วิดีโอสั้น",
    liveScript: "สคริปต์ไลฟ์", socialCaption: "แคปชันโซเชียล",
    copy: "คัดลอก", copied: "คัดลอกแล้ว", copyFailed: "คัดลอกไม่สำเร็จ",
    languages: { en: "อังกฤษ", zh: "จีน", vi: "เวียดนาม", th: "ไทย", ms: "มาเลย์", id: "อินโดนีเซีย" },
  },
  digitalHuman: {
    title: "วิดีโอผู้ประกาศดิจิทัล", intro: "แปลงบทที่สร้างขึ้นเป็นวิดีโอผู้ประกาศ",
    language: "ภาษาที่ใช้พูด", generate: "สร้างวิดีโอ", generating: "กำลังสร้าง…",
    statusGenerating: "กำลังเรนเดอร์วิดีโอผู้ประกาศ อาจใช้เวลาหลายนาที…", statusReady: "วิดีโอพร้อมแล้ว",
    placeholder: "ยังไม่มีวิดีโอ", videoLabel: "วิดีโอผู้ประกาศดิจิทัล",
    mockNote: "โหมดสาธิต: ระบบคืนที่อยู่ตัวอย่างและไม่เรนเดอร์วิดีโอจริง",
  },
  assistant: {
    label: "ผู้ช่วยสินค้า", eyebrow: "กว่างซี · ไกด์สินค้า", title: "ผู้ช่วย AI Guipin", subtitle: "สินค้า · วัฒนธรรม · การวิเคราะห์ตลาด",
    close: "ปิดผู้ช่วย", expand: "เปิดผู้ช่วย AI Guipin", collapse: "ปิดผู้ช่วย AI Guipin",
    scope: "ตอบเฉพาะสินค้าเดโมปัจจุบันและการจัดแสดงข้ามพรมแดน", contextProduct: "สินค้าปัจจุบัน",
    welcomeTitle: "เริ่มจากคำถามเล็ก ๆ", welcomeProduct: "มาทำความรู้จักของดีกว่างซีชิ้นนี้ด้วยกัน",
    welcomeGeneric: "สำรวจของดีกว่างซี และค้นพบวัฒนธรรมกับความเป็นไปได้",
    you: "คุณ", thinking: "AI กำลังคิด…", retry: "ลองอีกครั้ง", composerLabel: "อยากรู้เรื่องอะไร?",
    composerPlaceholder: "ถามเรื่องสินค้า วัฒนธรรม หรือการวิเคราะห์ตลาด", send: "ส่ง", viewProduct: "ดูสินค้า",
    startAnalysis: "เริ่มวิเคราะห์ตลาด", conversationLabel: "บทสนทนาผู้ช่วย",
    promptsProduct: ["สินค้านี้มีจุดเด่นอะไร?", "มีภูมิหลังทางวัฒนธรรมอย่างไร?", "เหมาะกับตลาดต่างประเทศใด?"],
    promptsGeneric: ["ช่วยแนะนำสินค้าอะไรได้บ้าง?", "จะศึกษาภูมิหลังวัฒนธรรมได้อย่างไร?", "จะเริ่มวิเคราะห์ตลาดได้อย่างไร?"],
  },
  errors: {
    products: "โหลดสินค้าไม่ได้ กรุณาลองอีกครั้ง", analysis: "วิเคราะห์ไม่สำเร็จ กรุณาลองอีกครั้ง",
    contentPlan: "สร้างแผนเนื้อหาไม่สำเร็จ กรุณาลองอีกครั้ง", assistant: "ผู้ช่วยไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่ภายหลัง", catalog: "โหลดแคตตาล็อกสินค้าไม่ได้",
      digitalHuman: "ไม่สามารถสร้างวิดีโอผู้ประกาศดิจิทัลได้ โปรดลองอีกครั้ง",
  },
}

const ms: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "AKAR TEMPATAN. UFUK BAHARU.", footerTagline: "流量出海", footerRoute: "Guangxi, China → Pasaran ASEAN", footerNote: "Demo strategi berbantukan AI" },
  nav: { products: "Produk", startAnalysis: "Mula Analisis", home: "Utama", browseProducts: "Lihat produk", demoNav: "Navigasi demo", skip: "Langkau ke kandungan", mainNav: "Navigasi utama", switchLanguage: "Tukar bahasa", language: "Bahasa" },
  hero: {
    eyebrow: "STRATEGI PASARAN BERBANTUKAN AI · DEMO", title1: "Produk China.", titleAccent: "ASEAN", title2: "kemungkinan.",
    intro: "Jadikan produk tempatan dari Guangxi sebagai peluang pasaran baharu dengan analisis dan strategi kandungan berbantukan AI.",
    startAnalysis: "Mula Analisis", exploreProducts: "Lihat Produk", note: "Satu kisah produk. Satu pasaran baharu. Satu titik permulaan.",
    loadingCatalog: "Memuatkan contoh katalog…", loadingTitle: "Akar tempatan. Ufuk baharu.",
  },
  workflow: {
    eyebrow: "PERJALANAN", title: "Dari akar tempatan ke pasaran baharu.",
    steps: [
      ["Pilih Produk", "Mulakan dengan produk istimewa tempatan. Kenali asal usul, bahan dan kisah budayanya."],
      ["Analisis Pasaran", "Pilih pasaran ASEAN dan audiens untuk meneroka kedudukan, peluang dan risiko."],
      ["Jana Strategi", "Tukar analisis kepada pelan kandungan, dari kapsyen sosial hingga idea video pendek."],
    ],
  },
  featured: {
    eyebrow: "BERAKAR DI GUANGXI", title: "Asal kecil. Kisah besar.", subtitle: "Terokai produk pilihan yang dipilih khas untuk demo ini.",
    exploreAll: "Lihat semua produk", loading: "Memuatkan produk pilihan…",
    emptyTitle: "Kisah produk baharu sedang dalam perjalanan.", emptyBody: "Belum ada produk dalam katalog. Sila semak semula nanti.",
    unavailableTitle: "Koleksi sedang dimuatkan.", unavailableBody: "Produk pilihan tidak tersedia sementara. Anda masih boleh meneroka demo ini.",
    visitCatalog: "Lawati katalog produk", cardNumber: "KOLEKSI / 0", viewProduct: "Lihat Produk", startAnalysis: "Mula Analisis",
  },
  heroExample: {
    topLeft: "AKAR TEMPATAN", topRight: "CHINA → ASEAN", exampleEyebrow: "SATU CONTOH UNTUK DITEROKAI",
    demoRecommendation: "Saranan demo", caution: "Berhati-hati", sampleNote: "Output contoh: andaian pasaran perlu disahkan.",
    sampleBody: "Tambah audiens anda, kemudian jana pengenalan produk dan kapsyen sosial.", tryProduct: "Cuba produk ini",
    emptyTitle1: "Satu kisah tempatan.", emptyTitle2: "Satu pasaran baharu.", emptyBody: "Pilih produk dan pasaran ASEAN untuk memulakan demo anda.",
    footProduct: "PRODUK", footMarket: "PASARAN", footContent: "KANDUNGAN", toMalaysia: "Malaysia",
  },
  outputs: {
    eyebrow: "MELEBIHI IDEA PERTAMA", title1: "Hala tuju lebih jelas.", title2: "Titik permulaan kreatif.",
    intro: "Terokai bentuk strategi pasaran, kemudian jadikannya pelan kandungan.",
    demoNote: "Demo ini menggunakan output contoh untuk menunjukkan aliran kerja. Andaian pasaran masih perlu disahkan; sesetengah medan analisis mungkin kosong.",
    items: [
      ["Saranan pasaran", "Titik permulaan untuk meneroka kesesuaian, kekuatan dan risiko."],
      ["Segmen pelanggan", "Konteks audiens untuk memfokuskan penerokaan pasaran."],
      ["Kedudukan budaya", "Kisah dan tradisi tempatan di sebalik produk anda."],
      ["Saranan pemasaran", "Hala tuju yang boleh dipertimbangkan dalam perancangan."],
      ["Hala tuju kandungan", "Idea untuk kapsyen, imej produk dan video."],
    ],
  },
  cta: { eyebrow: "BAB SETERUSNYA", title: "Sedia meneroka pasaran baharu?", body: "Mulakan dengan satu produk. Temui sejauh mana kisahnya boleh pergi.", start: "Mula Demo" },
  catalog: {
    eyebrow: "Koleksi produk", title: "Temui produk istimewa tempatan", intro: "Terokai produk, asal usul dan kisah di sebaliknya.",
    emptyTitle: "Belum ada produk", emptyBody: "Katalog kosong buat masa ini. Sila semak semula nanti.",
    countOne: "produk", countMany: "produk", price: "Harga", viewProduct: "Lihat produk",
  },
  detail: {
    breadcrumb: "← Semua produk", origin: "Asal usul", price: "Harga", analyze: "Analisis kesesuaian pasaran",
    visitSeller: "Lawati laman penjual", newTab: "(buka dalam tab baharu)",
    culturalBackground: "Latar belakang budaya", howToUse: "Cara guna", ingredients: "Bahan",
  },
  images: {
    productAlt: "{name} — imej produk {index}", unavailable: "Imej tidak tersedia", catalogMissing: "Imej katalog belum disediakan",
    galleryLabel: "Imej {name}", showImage: "Tunjuk imej {index} daripada {total}",
  },
  productsError: { eyebrow: "Koleksi produk", title: "Tidak dapat memuatkan produk", body: "Maklumat produk tidak tersedia sementara. Sila cuba lagi.", retry: "Cuba lagi", back: "Kembali ke katalog" },
  productsLoading: { eyebrow: "Koleksi produk", title: "Memuatkan produk…", body: "Mendapatkan maklumat produk." },
  notFound: { eyebrow: "Produk tidak ditemui · 404", title: "Produk ini tidak tersedia", body: "Ia mungkin telah dialih keluar, atau pautan tidak betul.", browse: "Lihat semua produk" },
  analysis: {
    eyebrow: "Produk · Analisis pasaran", title: "Terokai kesesuaian pasaran produk",
    intro: "Pilih produk katalog dan pasaran sasaran untuk membina laporan perancangan berstruktur.",
    formTitle: "Tetapkan konteks", formHint: "Produk dan negara diperlukan.",
    loadingProducts: "Memuatkan produk…", retryCatalog: "Cuba katalog lagi", noProducts: "Tiada produk tersedia.", reloadCatalog: "Muat semula katalog",
    product: "Produk", selectProduct: "Pilih produk", country: "Negara", audience: "Audiens sasaran", optional: "pilihan",
    notes: "Nota pasaran", presetsLabel: "Pintasan pasaran ASEAN", analyze: "Analisis produk", analyzing: "Menganalisis…",
    checkInputs: "Sila semak input borang.", statusAnalyzing: "Menganalisis produk pilihan anda…", statusComplete: "Analisis selesai.",
    reportTitle: "Laporan analisis", reportIdle: "Hantar produk dan pasaran untuk melihat saranan, kekuatan, risiko dan hala tuju cadangan.",
    reportPreparing: "Laporan anda sedang disediakan.", recommendation: "Saranan", heuristic: "Skor heuristik",
    heuristicNote: "Ini penunjuk perancangan heuristik, bukan kebarangkalian atau ramalan jualan.",
    summary: "Ringkasan", targetAudiences: "Audiens sasaran", strengths: "Kekuatan", risks: "Risiko",
    culturalAdvantages: "Kelebihan budaya", marketingSuggestions: "Saranan pemasaran", contentDirections: "Hala tuju kandungan",
    noneProvided: "Tiada maklumat.",
    recommendations: { strong_fit: "Sangat sesuai", fit: "Sesuai", caution: "Berhati-hati", not_recommended: "Tidak disyorkan" },
  },
  contentPlan: {
    title: "Pelan kandungan", intro: "Sediakan teks pemasaran dan gesaan kreatif daripada analisis ini. Tiada imej atau video dijana; semak dakwaan produk dan kesesuaian tempatan sebelum digunakan.",
    language: "Bahasa sasaran", generate: "Jana pelan kandungan", generating: "Menjana…",
    statusGenerating: "Menjana pelan kandungan…", statusReady: "Pelan kandungan sedia.", keySellingPoints: "Titik jualan utama",
    imagePrompt: "Gesaan imej", shortVideoIdea: "Idea video pendek", shortVideoPrompt: "Skrip video pendek",
    liveScript: "Skrip siaran langsung", socialCaption: "Kapsyen sosial",
    copy: "Salin", copied: "Disalin", copyFailed: "Gagal menyalin",
    languages: { en: "Inggeris", zh: "Cina", vi: "Vietnam", th: "Thai", ms: "Melayu", id: "Indonesia" },
  },
  digitalHuman: {
    title: "Video penyampai digital", intro: "Tukar skrip yang dijana menjadi video penyampai.",
    language: "Bahasa pertuturan", generate: "Jana video", generating: "Menjana…",
    statusGenerating: "Video penyampai digital sedang dirender, mungkin mengambil beberapa minit…",
    statusReady: "Video sedia.",
    placeholder: "Belum ada video", videoLabel: "Video penyampai digital",
    mockNote: "Mod demo: alamat pemegang tempat dikembalikan dan tiada video dirender.",
  },
  assistant: {
    label: "Pembantu produk", eyebrow: "GUANGXI · PANDUAN PRODUK", title: "Pembantu AI Guipin", subtitle: "Produk · Budaya · Analisis pasaran",
    close: "Tutup pembantu", expand: "Buka pembantu AI Guipin", collapse: "Tutup pembantu AI Guipin",
    scope: "Menjawab hanya tentang produk demo semasa dan paparan rentas sempadan", contextProduct: "Produk semasa",
    welcomeTitle: "Mulakan dengan soalan kecil", welcomeProduct: "Mari kenali produk istimewa Guangxi ini bersama.",
    welcomeGeneric: "Terokai produk istimewa Guangxi dan temui budaya serta kemungkinannya.",
    you: "Anda", thinking: "AI sedang berfikir…", retry: "Cuba lagi", composerLabel: "Apa yang anda ingin tahu?",
    composerPlaceholder: "Tanya tentang produk, budaya atau analisis pasaran", send: "Hantar", viewProduct: "Lihat produk",
    startAnalysis: "Mula analisis pasaran", conversationLabel: "Perbualan pembantu",
    promptsProduct: ["Apa yang istimewa tentang produk ini?", "Apakah latar belakang budayanya?", "Pasaran luar mana yang sesuai?"],
    promptsGeneric: ["Produk apa yang boleh anda perkenalkan?", "Bagaimana memahami latar belakang budaya?", "Bagaimana memulakan analisis pasaran?"],
  },
  errors: {
    products: "Tidak dapat memuatkan produk. Sila cuba lagi.", analysis: "Tidak dapat menjalankan analisis. Sila cuba lagi.",
    contentPlan: "Tidak dapat mencipta pelan kandungan. Sila cuba lagi.", assistant: "Pembantu tidak tersedia sekarang. Sila cuba lagi nanti.", catalog: "Tidak dapat memuatkan katalog produk.",
      digitalHuman: "Video penyampai digital tidak dapat dijana. Sila cuba lagi.",
  },
}

const id: Dictionary = {
  brand: { name: "liuliangchuhai", caption: "AKAR LOKAL. CAKRAWALA BARU.", footerTagline: "流量出海", footerRoute: "Guangxi, Tiongkok → Pasar ASEAN", footerNote: "Demo strategi berbantuan AI" },
  nav: { products: "Produk", startAnalysis: "Mulai Analisis", home: "Beranda", browseProducts: "Jelajahi produk", demoNav: "Navigasi demo", skip: "Lewati ke konten", mainNav: "Navigasi utama", switchLanguage: "Ganti bahasa", language: "Bahasa" },
  hero: {
    eyebrow: "STRATEGI PASAR BERBANTUAN AI · DEMO", title1: "Produk Tiongkok.", titleAccent: "ASEAN", title2: "kemungkinan.",
    intro: "Ubah produk lokal dari Guangxi menjadi peluang pasar baru dengan analisis dan strategi konten berbantuan AI.",
    startAnalysis: "Mulai Analisis", exploreProducts: "Jelajahi Produk", note: "Satu kisah produk. Satu pasar baru. Satu titik awal.",
    loadingCatalog: "Memuat contoh katalog…", loadingTitle: "Akar lokal. Cakrawala baru.",
  },
  workflow: {
    eyebrow: "PERJALANAN", title: "Dari akar lokal ke pasar baru.",
    steps: [
      ["Pilih Produk", "Mulai dari produk khas daerah. Kenali asal usul, bahan, dan kisah budayanya."],
      ["Analisis Pasar", "Pilih pasar ASEAN dan audiens untuk menjelajahi posisi, peluang, dan risiko."],
      ["Hasilkan Strategi", "Ubah analisis menjadi rencana konten, dari takarir sosial hingga ide video pendek."],
    ],
  },
  featured: {
    eyebrow: "BERAKAR DI GUANGXI", title: "Asal kecil. Kisah besar.", subtitle: "Jelajahi produk pilihan yang dikurasi untuk demo ini.",
    exploreAll: "Jelajahi semua produk", loading: "Memuat produk pilihan…",
    emptyTitle: "Kisah produk baru sedang dalam perjalanan.", emptyBody: "Belum ada produk di katalog. Silakan periksa kembali nanti.",
    unavailableTitle: "Koleksi sedang dimuat.", unavailableBody: "Produk pilihan sementara tidak tersedia. Anda tetap dapat menjelajahi demo ini.",
    visitCatalog: "Kunjungi katalog produk", cardNumber: "KOLEKSI / 0", viewProduct: "Lihat Produk", startAnalysis: "Mulai Analisis",
  },
  heroExample: {
    topLeft: "AKAR LOKAL", topRight: "TIONGKOK → ASEAN", exampleEyebrow: "SATU CONTOH UNTUK DIJELAJAHI",
    demoRecommendation: "Saran demo", caution: "Hati-hati", sampleNote: "Output contoh: asumsi pasar masih perlu divalidasi.",
    sampleBody: "Tambahkan audiens Anda, lalu buat pengantar produk dan takarir sosial.", tryProduct: "Coba produk ini",
    emptyTitle1: "Satu kisah lokal.", emptyTitle2: "Satu pasar baru.", emptyBody: "Pilih produk dan pasar ASEAN untuk memulai demo Anda.",
    footProduct: "PRODUK", footMarket: "PASAR", footContent: "KONTEN", toMalaysia: "Malaysia",
  },
  outputs: {
    eyebrow: "MELAMPAUI IDE PERTAMA", title1: "Arah yang lebih jelas.", title2: "Titik awal yang kreatif.",
    intro: "Jelajahi bentuk strategi pasar, lalu jadikan rencana konten.",
    demoNote: "Demo ini memakai output contoh untuk menunjukkan alur kerja. Asumsi pasar tetap perlu divalidasi; sebagian kolom analisis mungkin kosong.",
    items: [
      ["Saran pasar", "Titik awal untuk menjelajahi kesesuaian, kekuatan, dan risiko."],
      ["Segmen pelanggan", "Konteks audiens untuk memfokuskan penjelajahan pasar."],
      ["Posisi budaya", "Kisah dan tradisi lokal di balik produk Anda."],
      ["Saran pemasaran", "Arah yang dapat dipertimbangkan dalam perencanaan."],
      ["Arah konten", "Ide untuk takarir, gambar produk, dan video."],
    ],
  },
  cta: { eyebrow: "BAB BERIKUTNYA", title: "Siap menjelajahi pasar baru?", body: "Mulai dari satu produk. Temukan sejauh mana kisahnya bisa melangkah.", start: "Mulai Demo" },
  catalog: {
    eyebrow: "Koleksi produk", title: "Temukan produk khas daerah", intro: "Jelajahi produk, asal usul, dan kisah di baliknya.",
    emptyTitle: "Belum ada produk", emptyBody: "Katalog saat ini kosong. Silakan periksa kembali nanti.",
    countOne: "produk", countMany: "produk", price: "Harga", viewProduct: "Lihat produk",
  },
  detail: {
    breadcrumb: "← Semua produk", origin: "Asal usul", price: "Harga", analyze: "Analisis kesesuaian pasar",
    visitSeller: "Kunjungi situs penjual", newTab: "(terbuka di tab baru)",
    culturalBackground: "Latar budaya", howToUse: "Cara pakai", ingredients: "Bahan",
  },
  images: {
    productAlt: "{name} — gambar produk {index}", unavailable: "Gambar tidak tersedia", catalogMissing: "Gambar katalog belum disediakan",
    galleryLabel: "Gambar {name}", showImage: "Tampilkan gambar {index} dari {total}",
  },
  productsError: { eyebrow: "Koleksi produk", title: "Tidak dapat memuat produk", body: "Informasi produk sementara tidak tersedia. Silakan coba lagi.", retry: "Coba lagi", back: "Kembali ke katalog" },
  productsLoading: { eyebrow: "Koleksi produk", title: "Memuat produk…", body: "Mengambil informasi produk." },
  notFound: { eyebrow: "Produk tidak ditemukan · 404", title: "Produk ini tidak tersedia", body: "Mungkin sudah dihapus, atau tautannya salah.", browse: "Jelajahi semua produk" },
  analysis: {
    eyebrow: "Produk · Analisis pasar", title: "Jelajahi kesesuaian pasar produk",
    intro: "Pilih produk katalog dan pasar target untuk menyusun laporan perencanaan terstruktur.",
    formTitle: "Tetapkan konteks", formHint: "Produk dan negara wajib diisi.",
    loadingProducts: "Memuat produk…", retryCatalog: "Coba katalog lagi", noProducts: "Tidak ada produk tersedia.", reloadCatalog: "Muat ulang katalog",
    product: "Produk", selectProduct: "Pilih produk", country: "Negara", audience: "Audiens target", optional: "opsional",
    notes: "Catatan pasar", presetsLabel: "Pintasan pasar ASEAN", analyze: "Analisis produk", analyzing: "Menganalisis…",
    checkInputs: "Silakan periksa isian formulir.", statusAnalyzing: "Menganalisis produk pilihan Anda…", statusComplete: "Analisis selesai.",
    reportTitle: "Laporan analisis", reportIdle: "Kirim produk dan pasar untuk melihat saran, kekuatan, risiko, dan arah yang disarankan.",
    reportPreparing: "Laporan Anda sedang disiapkan.", recommendation: "Saran", heuristic: "Skor heuristik",
    heuristicNote: "Ini indikator perencanaan heuristik, bukan probabilitas atau ramalan penjualan.",
    summary: "Ringkasan", targetAudiences: "Audiens target", strengths: "Kekuatan", risks: "Risiko",
    culturalAdvantages: "Keunggulan budaya", marketingSuggestions: "Saran pemasaran", contentDirections: "Arah konten",
    noneProvided: "Tidak ada informasi.",
    recommendations: { strong_fit: "Sangat sesuai", fit: "Sesuai", caution: "Hati-hati", not_recommended: "Tidak disarankan" },
  },
  contentPlan: {
    title: "Rencana konten", intro: "Siapkan teks pemasaran dan prompt kreatif dari analisis ini. Tidak ada gambar atau video yang dihasilkan; tinjau klaim produk dan kesesuaian lokal sebelum digunakan.",
    language: "Bahasa target", generate: "Hasilkan rencana konten", generating: "Menghasilkan…",
    statusGenerating: "Menghasilkan rencana konten…", statusReady: "Rencana konten siap.", keySellingPoints: "Poin jual utama",
    imagePrompt: "Prompt gambar", shortVideoIdea: "Ide video pendek", shortVideoPrompt: "Skrip video pendek",
    liveScript: "Skrip siaran langsung", socialCaption: "Takarir sosial",
    copy: "Salin", copied: "Tersalin", copyFailed: "Gagal menyalin",
    languages: { en: "Inggris", zh: "Tionghoa", vi: "Vietnam", th: "Thai", ms: "Melayu", id: "Indonesia" },
  },
  digitalHuman: {
    title: "Video pembawa acara digital", intro: "Ubah skrip yang dihasilkan menjadi video pembawa acara.",
    language: "Bahasa lisan", generate: "Buat video", generating: "Membuat…",
    statusGenerating: "Video pembawa acara digital sedang dirender, bisa memakan beberapa menit…",
    statusReady: "Video siap.",
    placeholder: "Belum ada video", videoLabel: "Video pembawa acara digital",
    mockNote: "Mode demo: alamat pengganti dikembalikan dan tidak ada video yang dirender.",
  },
  assistant: {
    label: "Asisten produk", eyebrow: "GUANGXI · PANDUAN PRODUK", title: "Asisten AI Guipin", subtitle: "Produk · Budaya · Analisis pasar",
    close: "Tutup asisten", expand: "Buka asisten AI Guipin", collapse: "Tutup asisten AI Guipin",
    scope: "Hanya menjawab tentang produk demo saat ini dan tampilan lintas batas", contextProduct: "Produk saat ini",
    welcomeTitle: "Mulai dari pertanyaan kecil", welcomeProduct: "Mari kenali produk khas Guangxi ini bersama.",
    welcomeGeneric: "Jelajahi produk khas Guangxi dan temukan budaya serta kemungkinannya.",
    you: "Anda", thinking: "AI sedang berpikir…", retry: "Coba lagi", composerLabel: "Apa yang ingin Anda ketahui?",
    composerPlaceholder: "Tanya tentang produk, budaya, atau analisis pasar", send: "Kirim", viewProduct: "Lihat produk",
    startAnalysis: "Mulai analisis pasar", conversationLabel: "Percakapan asisten",
    promptsProduct: ["Apa yang istimewa dari produk ini?", "Bagaimana latar budayanya?", "Pasar luar mana yang cocok?"],
    promptsGeneric: ["Produk apa yang bisa Anda jelaskan?", "Bagaimana memahami latar budaya produk?", "Bagaimana memulai analisis pasar?"],
  },
  errors: {
    products: "Tidak dapat memuat produk. Silakan coba lagi.", analysis: "Tidak dapat menjalankan analisis. Silakan coba lagi.",
    contentPlan: "Tidak dapat membuat rencana konten. Silakan coba lagi.", assistant: "Asisten tidak tersedia saat ini. Silakan coba lagi nanti.", catalog: "Tidak dapat memuat katalog produk.",
      digitalHuman: "Video pembawa acara digital tidak dapat dibuat. Silakan coba lagi.",
  },
}

export const dictionaries: Record<Locale, Dictionary> = { zh, en, vi, th, ms, id }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
