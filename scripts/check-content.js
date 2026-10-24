#!/usr/bin/env node
/**
 * 内容与结构校验
 * Content and structure checks
 *
 * 这些检查防的是本项目历史上真实发生过的缺陷：
 *  - 导航指向不存在的路由（ASEAN 十国卡片曾全部 404）
 *  - i18n 字典漏翻导致 key 泄漏到页面
 *  - 搜索结果用 Math.random() 编造
 *  - 交互元素只弹 alert 而不做事
 *
 * 用法：node scripts/check-content.js
 * 退出码：0 通过，1 失败
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// 1) 路由清单
const routes = new Set();
for (const f of walk(APP)) {
  if (!f.endsWith('page.tsx')) continue;
  const rel = path.relative(APP, path.dirname(f)).split(path.sep).join('/');
  const clean = rel.replace(/\[locale\]\/?/, '').replace(/^$/, '');
  routes.add('/' + clean);
}

// 2) ASEAN 十国必须有详情页
const asean = ['thailand', 'vietnam', 'indonesia', 'malaysia', 'singapore',
  'philippines', 'cambodia', 'laos', 'myanmar', 'brunei'];
for (const c of asean) {
  if (!fs.existsSync(path.join(APP, '[locale]', 'asean', '[country]', 'page.tsx'))) {
    fail('缺少 ASEAN 国家详情路由 /asean/[country]');
    break;
  }
}

// 3) 站内链接必须指向存在的路由
const KNOWN = routes;
const ignore = new Set(['/', '/search']);
const files = walk(SRC).filter((f) => /\.tsx?$/.test(f));
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/href=\{?[`"']\/(?:\$\{locale\})?([a-z0-9/[\]-]*)/g)) {
    const target = '/' + m[1].replace(/\/$/, '');
    if (!target || target === '/' || ignore.has(target)) continue;
    if (target.includes('${')) continue;
    if (target.startsWith('/images') || target.startsWith('/icons')) continue;
    // public/ 下的独立静态页（如绣球 DIY）不是 App Router 路由
    if (target.startsWith('/diy')) continue;
    const first = '/' + target.split('/')[1];
    if (!KNOWN.has(target) && !KNOWN.has(first)) {
      fail(`死链 ${target}（${path.relative(ROOT, f)}）`);
    }
  }
}

// 4) 禁止用 alert/prompt 假装功能
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (/\balert\(/.test(src) || /\bwindow\.prompt\(/.test(src)) {
    fail(`仍在使用 alert/prompt：${path.relative(ROOT, f)}`);
  }
  if (/Math\.random\(/.test(src)) {
    warn(`使用 Math.random（可能造成水合不一致）：${path.relative(ROOT, f)}`);
  }
}

// 5) 字典键对齐：每个语言的 key 数不得少于中文
const dicts = path.join(SRC, 'i18n', 'dicts');
for (const f of fs.readdirSync(dicts)) {
  if (!f.endsWith('.ts') || f === 'index.ts') continue;
  const src = fs.readFileSync(path.join(dicts, f), 'utf8');
  const counts = {};
  for (const m of src.matchAll(/export const (\w+)(?::\s*Dict)?\s*=/g)) {
    const start = m.index + m[0].length;
    const next = src.indexOf('\nexport const ', start);
    const body = src.slice(start, next === -1 ? src.length : next);
    counts[m[1]] = (body.match(/^\s*'[^']+':/gm) || []).length;
  }
  if (!counts.zh) continue;
  for (const [lang, n] of Object.entries(counts)) {
    if (lang === 'zh') continue;
    if (n < counts.zh * 0.9) {
      warn(`${f}: ${lang} 只有 ${n} 个键，中文有 ${counts.zh} 个（会回落中文）`);
    }
  }
}

// 6) 静态资源引用必须存在
const pub = path.join(ROOT, 'public');
const refs = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/['"`](\/(?:images|icons)\/[^'"`$]+\.(?:jpg|jpeg|png|svg|webp))['"`]/g)) {
    refs.add(m[1]);
  }
}
for (const r of refs) {
  if (!fs.existsSync(path.join(pub, r))) fail(`引用了不存在的静态资源 ${r}`);
}

// 输出
if (warnings.length) {
  console.log(`⚠ ${warnings.length} 条警告`);
  warnings.slice(0, 20).forEach((w) => console.log('  -', w));
}
if (errors.length) {
  console.log(`✗ ${errors.length} 条错误`);
  errors.slice(0, 40).forEach((e) => console.log('  -', e));
  process.exit(1);
}
console.log(`✓ 内容校验通过（路由 ${routes.size} 个，静态引用 ${refs.size} 个）`);
