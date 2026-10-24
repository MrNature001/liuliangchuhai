/**
 * 公共页面文案（关于 / 无障碍 / 隐私 / 联系我们）
 * Static page copy
 */

import type { Dict } from '@/i18n/config';

export const zh: Dict = {
  'meta.about.title': '关于项目 - 广西-东盟线上文化展',
  'meta.about.desc': '广西-东盟线上文化展的定位、资料来源与策展原则。',
  'meta.accessibility.title': '无障碍访问 - 广西-东盟线上文化展',
  'meta.accessibility.desc': '本站的无障碍设计说明、已知限制与反馈渠道。',
  'meta.privacy.title': '隐私政策 - 广西-东盟线上文化展',
  'meta.privacy.desc': '本站收集什么数据、不收集什么数据，以及数据存放位置。',
  'meta.contact.title': '联系我们 - 广西-东盟线上文化展',
  'meta.contact.desc': '内容纠错、图片授权与合作的联系方式。',
  'meta.terms.title': '使用条款 - 广西-东盟线上文化展',
  'meta.terms.desc': '本站内容的使用条件与免责说明。',

  // 关于
  'about.title': '关于项目',
  'about.lead': '「广西-东盟线上文化展」是一个面向青年观众的线上展陈实验：把广西地方文化放进与东盟十国的对照之中，而不是孤立地陈列。',
  'about.mission.title': '我们想做什么',
  'about.mission.body': '广西与东盟山水相连，泰族与壮族同属侗台语族，京族的独弦琴与越南宫廷乐器互为映照，合浦的汉墓里出土过印度洋的珠子。这些联系在教科书里常常被拆散，本站尝试把它们重新接起来，让观众看到的是「关系」而不只是「物件」。',
  'about.method.title': '怎么做的',
  'about.method.body': '六个展厅：壮乡之韵、山水桂林、东盟十国、丝路新章、数字遗产、互动体验。每个展厅的文字都尽量给出可核查的时间、地点与出处；无法证实的细节宁可留白，也不编造。互动区（抛绣球、纹样配对、丝路航线、问答）全部在浏览器内运行，成绩与徽章只保存在你自己的设备上。',
  'about.sources.title': '资料来源',
  'about.sources.body': '文化实景照片来自 Wikimedia Commons 的自由许可作品，逐张核对过内容，并在「图片来源」页署名到摄影者。地图、纹样、图标、国旗为本站自绘。世界遗产与非遗传年份以 UNESCO 官方名录为准；站内数值（如人口、面积）为区间估数，仅作参照。',
  'about.limits.title': '已知局限',
  'about.limits.item1': '绣球暂无可靠自由许可的实拍照片，使用本站自绘图版，并在版权页标明。',
  'about.limits.item2': '越南语、泰语为机器翻译初稿，缅、老、高棉、印尼、马来、他加禄语尚未翻译，会回落到中文或英文。',
  'about.limits.item3': '三维模型为程序化生成的示意模型，不是文物的实测扫描。',
  'about.limits.item4': '本站是展陈与文化科普，不构成贸易、投资或旅游安全建议。',
  'about.stack.title': '技术说明',
  'about.stack.body': 'Next.js 14 App Router + TypeScript + TailwindCSS，零后端、零追踪脚本，全部页面静态预渲染。搜索索引在构建期生成，在浏览器内匹配。',

  // 无障碍
  'a11yPage.title': '无障碍访问',
  'a11yPage.lead': '本站以 WCAG 2.2 AA 为设计目标。以下是已实现的部分、已知的限制，以及如何反馈问题。',
  'a11yPage.done.title': '已实现',
  'a11yPage.done.item1': '每页提供「跳到主内容」链接，键盘 Tab 首次按下即可见。',
  'a11yPage.done.item2': '所有交互元素均有可见焦点环，弹窗使用原生 <dialog>，支持 Esc 关闭与焦点陷阱。',
  'a11yPage.done.item3': '图标按钮均带无障碍名称；装饰性图像 aria-hidden，内容图像带替代文本。',
  'a11yPage.done.item4': '支持 prefers-reduced-motion：系统开启减少动画后，全部动画降为接近零时长。',
  'a11yPage.done.item5': '支持 prefers-contrast: high，卡片边框与链接样式会加强。',
  'a11yPage.done.item6': '页面语言随 URL 变化同步到 <html lang>，屏幕阅读器按对应语言发音。',
  'a11yPage.done.item7': '游戏与搜索的关键状态通过 aria-live 播报，不依赖颜色单独传递信息。',
  'a11yPage.limits.title': '已知限制',
  'a11yPage.limits.item1': '三维模型旋转需要拖拽，键盘用户可使用按钮替代（左转 / 右转 / 放大 / 还原）。',
  'a11yPage.limits.item2': '部分历史地图与纹样为静态图像，信息已同时以文字给出。',
  'a11yPage.limits.item3': '缅、老、高棉等语言的字体依赖系统，个别设备可能缺字形。',
  'a11yPage.feedback.title': '反馈',
  'a11yPage.feedback.body': '如果遇到无法操作的内容，请通过「联系我们」页面的邮箱说明页面地址与所用辅助技术，我们会优先修复。',

  // 隐私
  'privacy.title': '隐私政策',
  'privacy.lead': '本站不设账号体系，不加载第三方统计、广告或社交脚本。',
  'privacy.collect.title': '我们保存什么',
  'privacy.collect.body': '只有你主动产生的数据：游戏成绩、徽章进度、收藏的文物、社区留言，以及语言偏好。这些数据保存在你浏览器的 localStorage 中，键名以 llch: 开头。',
  'privacy.collect.not': '我们不收集：姓名、邮箱、手机号、位置、设备指纹、浏览行为日志。本站没有后端数据库。',
  'privacy.where.title': '数据在哪里',
  'privacy.where.body': '全部在你的设备上。清除浏览器数据、使用无痕窗口或点击页面底部的「清除本站数据」，即可删除。删除后无法恢复，也不影响浏览。',
  'privacy.third.title': '第三方资源',
  'privacy.third.body': '本站不引用外部字体、CDN 或分析服务。图片全部存放在本站自身目录下。',
  'privacy.rights.title': '你的选择',
  'privacy.rights.body': '不使用互动功能不会限制浏览；关闭 JavaScript 后，全部展厅内容仍可阅读。',

  // 联系
  'contact.title': '联系我们',
  'contact.lead': '内容纠错优先处理。请附上页面地址与你认为正确的信息出处。',
  'contact.content.title': '内容纠错',
  'contact.content.body': '包括年代、地点、非遗名录年份、族群归属等事实性问题。请注明页面与具体句子。',
  'contact.image.title': '图片授权与撤图',
  'contact.image.body': '本站图片均来自 Wikimedia Commons 的自由许可作品。若你是摄影者且希望调整署名方式或撤图，请来信说明，我们会在一周内处理。',
  'contact.collab.title': '合作与共建',
  'contact.collab.body': '欢迎地方文化机构、学校与译者参与：尤其是缅甸语、老挝语、高棉语、印尼语、马来语与他加禄语的母语审校。',
  'contact.note': '本站为面向公众的展陈项目，暂不接收商业投放。',
  'contact.emailLabel': '联系邮箱',

  // 使用条款
  'terms.title': '使用条款',
  'terms.lead': '本站用于文化展示、教育与研究参考。',
  'terms.content.title': '内容使用',
  'terms.content.body': '站内文字可自由引用，请注明来源「广西-东盟线上文化展」。实景照片按各自 CC 许可使用，署名见「图片来源」页；本站自绘图版与程序化模型可自由使用。',
  'terms.disclaimer.title': '免责说明',
  'terms.disclaimer.body': '本站对文化事实尽力核对，但不保证完整无误；对贸易、投资、旅行决策不承担责任。三维模型为示意，不作为文物形制的学术依据。',

  // 联系表单
  'form.name': '称呼',
  'form.namePlaceholder': '怎么称呼你',
  'form.topic': '事由',
  'form.topicContent': '内容纠错',
  'form.topicImage': '图片授权 / 撤图',
  'form.topicCollab': '合作与共建',
  'form.topicOther': '其他',
  'form.message': '内容',
  'form.messagePlaceholder': '请写明页面地址与具体问题',
  'form.language': '希望回复的语言',
  'form.submit': '生成邮件',
  'form.required': '请填写称呼与内容。',
  'form.tooShort': '内容太短，请至少写 10 个字。',
  'form.preview': '将打开你的邮件客户端，把以下内容发送到本站邮箱：',
  'form.mailSubject': '[文化展] {topic} - {name}',
  'form.mailBody': '称呼：{name}\n事由：{topic}\n语言：{language}\n\n{message}',
  'form.copyInstead': '复制邮件正文',
  'form.copied': '邮件正文已复制，请粘贴到你的邮箱。',
  'form.localNote': '表单不会把内容发送到任何服务器，只在本机生成邮件草稿。',

  // 通用
  'back.home': '返回首页',
};

export const en: Dict = {
  'meta.about.title': 'About - Guangxi-ASEAN Online Cultural Exhibition',
  'meta.about.desc': 'What this exhibition is, where its sources come from, and how it is curated.',
  'meta.accessibility.title': 'Accessibility - Guangxi-ASEAN Online Cultural Exhibition',
  'meta.accessibility.desc': 'Accessibility features, known limitations and how to report a problem.',
  'meta.privacy.title': 'Privacy - Guangxi-ASEAN Online Cultural Exhibition',
  'meta.privacy.desc': 'What this site stores, what it never collects, and where data lives.',
  'meta.contact.title': 'Contact - Guangxi-ASEAN Online Cultural Exhibition',
  'meta.contact.desc': 'Corrections, image licensing and collaboration.',
  'meta.terms.title': 'Terms - Guangxi-ASEAN Online Cultural Exhibition',
  'meta.terms.desc': 'Terms of use and disclaimers.',

  'about.title': 'About',
  'about.lead':
    'This is an experiment in online exhibition-making for young audiences: Guangxi’s local cultures placed in conversation with the ten ASEAN nations rather than displayed in isolation.',
  'about.mission.title': 'What we set out to do',
  'about.mission.body':
    'Guangxi shares mountains and water with ASEAN. Tai and Zhuang belong to the same Kra-Dai language family; the Jing people’s single-string zither echoes Vietnamese court instruments; Hepu’s Han tombs held beads from the Indian Ocean. Textbooks often separate these threads — this site tries to reconnect them so visitors see relationships, not just objects.',
  'about.method.title': 'How it is built',
  'about.method.body':
    'Six halls: Rhythm of Zhuang, Guilin Landscape, ASEAN Kaleidoscope, New Silk Road, Digital Heritage and Interactive. Every claim aims to carry a checkable date, place or source; where evidence is thin we leave a gap rather than invent detail. The interactive hall runs entirely in your browser — scores and badges stay on your device.',
  'about.sources.title': 'Sources',
  'about.sources.body':
    'Photographs come from freely licensed Wikimedia Commons works, each checked against its subject and credited to the photographer on the Image Credits page. Maps, motifs, icons and flags are drawn in-house. World Heritage and intangible-heritage years follow the official UNESCO listings; population and area figures are approximate ranges for orientation only.',
  'about.limits.title': 'Known limitations',
  'about.limits.item1': 'No reliably licensed photograph of an embroidered ball was found; the site uses an in-house plate and says so on the credits page.',
  'about.limits.item2': 'Vietnamese and Thai are machine-translation drafts; Burmese, Lao, Khmer, Indonesian, Malay and Tagalog are not yet translated and fall back to Chinese or English.',
  'about.limits.item3': 'The 3D model is a procedurally generated schematic, not a metrological scan of an artefact.',
  'about.limits.item4': 'This is cultural interpretation, not trade, investment or travel-safety advice.',
  'about.stack.title': 'Technical notes',
  'about.stack.body':
    'Next.js 14 App Router with TypeScript and TailwindCSS. No backend and no tracking scripts; every page is statically prerendered. The search index is generated at build time and matched in the browser.',

  'a11yPage.title': 'Accessibility',
  'a11yPage.lead':
    'The site targets WCAG 2.2 AA. Below is what is implemented, what is still limited, and how to report a problem.',
  'a11yPage.done.title': 'Implemented',
  'a11yPage.done.item1': 'Every page has a “skip to main content” link that appears on the first Tab press.',
  'a11yPage.done.item2': 'All interactive elements have visible focus rings; dialogs use native <dialog> with Escape and focus trapping.',
  'a11yPage.done.item3': 'Icon buttons carry accessible names; decorative images are aria-hidden and content images have alt text.',
  'a11yPage.done.item4': 'prefers-reduced-motion is respected: animations collapse to near-zero duration.',
  'a11yPage.done.item5': 'prefers-contrast: high strengthens card borders and link styling.',
  'a11yPage.done.item6': 'The document language follows the URL and is synced to <html lang> for screen readers.',
  'a11yPage.done.item7': 'Key game and search states are announced via aria-live; colour is never the only signal.',
  'a11yPage.limits.title': 'Known limitations',
  'a11yPage.limits.item1': 'Rotating the 3D model uses drag; keyboard users have rotate and zoom buttons as equivalents.',
  'a11yPage.limits.item2': 'Some historical maps and motifs are static images; the same information is also given as text.',
  'a11yPage.limits.item3': 'Burmese, Lao and Khmer typography depends on system fonts; some devices may lack glyphs.',
  'a11yPage.feedback.title': 'Feedback',
  'a11yPage.feedback.body':
    'If something cannot be operated, email us from the Contact page with the page address and the assistive technology you use; we prioritise those fixes.',

  'privacy.title': 'Privacy',
  'privacy.lead': 'There are no accounts, no analytics, no advertising and no social scripts.',
  'privacy.collect.title': 'What is stored',
  'privacy.collect.body':
    'Only what you create: game scores, badge progress, saved artefacts, community notes and language preference. These live in your browser’s localStorage under keys prefixed llch:.',
  'privacy.collect.not':
    'We do not collect names, emails, phone numbers, location, device fingerprints or browsing logs. There is no backend database.',
  'privacy.where.title': 'Where it lives',
  'privacy.where.body':
    'Entirely on your device. Clear your browser data, use a private window, or press “Clear site data” in the footer. Deletion is permanent and does not affect browsing.',
  'privacy.third.title': 'Third parties',
  'privacy.third.body': 'No external fonts, CDNs or analytics. All images are served from this site.',
  'privacy.rights.title': 'Your choices',
  'privacy.rights.body':
    'Browsing does not depend on the interactive features; with JavaScript disabled every exhibition hall remains readable.',

  'contact.title': 'Contact',
  'contact.lead': 'Corrections come first. Please include the page address and a source for the correct information.',
  'contact.content.title': 'Content corrections',
  'contact.content.body':
    'Dates, places, inscription years, ethnic attributions. Quote the page and the sentence in question.',
  'contact.image.title': 'Image licensing',
  'contact.image.body':
    'Photographs are freely licensed Wikimedia Commons works. If you are a photographer and want a credit changed or an image removed, write to us and we will act within a week.',
  'contact.collab.title': 'Collaboration',
  'contact.collab.body':
    'Cultural institutions, schools and translators are welcome — especially native reviewers for Burmese, Lao, Khmer, Indonesian, Malay and Tagalog.',
  'contact.note': 'This is a public exhibition project and does not accept commercial placements.',
  'contact.emailLabel': 'Email',

  'terms.title': 'Terms',
  'terms.lead': 'This site is for cultural display, education and research reference.',
  'terms.content.title': 'Using the content',
  'terms.content.body':
    'Text may be quoted with attribution to the Guangxi-ASEAN Online Cultural Exhibition. Photographs follow their individual CC licences, credited on the Image Credits page; in-house plates and procedural models may be used freely.',
  'terms.disclaimer.title': 'Disclaimer',
  'terms.disclaimer.body':
    'Cultural facts are checked with care but are not guaranteed complete or error-free. Nothing here is advice on trade, investment or travel. The 3D model is schematic and not an academic record of an artefact’s form.',

  'form.name': 'Name',
  'form.namePlaceholder': 'How should we address you',
  'form.topic': 'Topic',
  'form.topicContent': 'Content correction',
  'form.topicImage': 'Image licensing / removal',
  'form.topicCollab': 'Collaboration',
  'form.topicOther': 'Something else',
  'form.message': 'Message',
  'form.messagePlaceholder': 'Include the page address and the specific problem',
  'form.language': 'Preferred reply language',
  'form.submit': 'Compose email',
  'form.required': 'Please fill in your name and message.',
  'form.tooShort': 'A little more detail, please — at least 10 characters.',
  'form.preview': 'Your mail client will open with this message addressed to us:',
  'form.mailSubject': '[Exhibition] {topic} - {name}',
  'form.mailBody': 'Name: {name}\nTopic: {topic}\nLanguage: {language}\n\n{message}',
  'form.copyInstead': 'Copy the email text',
  'form.copied': 'Email text copied — paste it into your mail app.',
  'form.localNote': 'This form sends nothing to a server; it only composes a draft on your device.',

  'back.home': 'Back to Home',
};
