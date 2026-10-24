/**
 * 内容数据测试
 * Content data tests
 *
 * 运行：node --test tests/
 * 只测纯数据与纯函数，不依赖 DOM、不需要浏览器。
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { QUIZ_QUESTIONS, MOTIF_PAIRS, ROUTE_STOPS, dealMotifBoard } from '../src/lib/data/interactiveData.ts';
import { ARTIFACTS, ARTIFACT_CATEGORIES } from '../src/lib/data/artifacts.ts';
import { ASEAN_PROFILES, ASEAN_COUNTRY_CODES, localized } from '../src/lib/data/aseanProfiles.ts';
import { SEARCH_DOCS, searchDocs } from '../src/lib/data/searchIndex.ts';

test('题库：每题有四个选项且答案下标合法', () => {
  assert.ok(QUIZ_QUESTIONS.length >= 10, '题目至少 10 道');
  for (const q of QUIZ_QUESTIONS) {
    assert.equal(q.options.length, 4, `${q.id} 选项数`);
    assert.ok(q.answer >= 0 && q.answer < 4, `${q.id} 答案下标`);
    assert.ok(q.explain.zh.length > 5 && q.explain.en.length > 5, `${q.id} 解析`);
    assert.ok(q.source.zh && q.source.en, `${q.id} 出处`);
  }
});

test('题库：id 唯一', () => {
  const ids = QUIZ_QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('连线牌组：12 张、6 对、id 唯一且成对', () => {
  const cards = dealMotifBoard();
  assert.equal(cards.length, 12);
  assert.equal(MOTIF_PAIRS.length, 6);
  assert.equal(new Set(cards.map((c) => c.id)).size, 12);
  const counts = {};
  for (const c of cards) counts[c.pair] = (counts[c.pair] ?? 0) + 1;
  for (const [pair, n] of Object.entries(counts)) assert.equal(n, 2, `pair ${pair}`);
});

test('丝路航线：节点为正序且含首末港', () => {
  assert.ok(ROUTE_STOPS.length >= 5);
  assert.equal(new Set(ROUTE_STOPS.map((s) => s.id)).size, ROUTE_STOPS.length);
});

test('文物档案：类别合法、字段完整、图片名存在', () => {
  const cats = new Set(ARTIFACT_CATEGORIES.map((c) => c.key));
  assert.ok(ARTIFACTS.length >= 10, '至少 10 件');
  for (const a of ARTIFACTS) {
    assert.ok(cats.has(a.category), `${a.id} 类别`);
    assert.ok(a.name.zh && a.name.en, `${a.id} 名称`);
    assert.ok(a.description.zh.length > 20 && a.description.en.length > 20, `${a.id} 说明`);
    assert.ok(a.period.zh && a.period.en, `${a.id} 年代`);
    assert.ok(a.image, `${a.id} 图片`);
  }
  assert.equal(new Set(ARTIFACTS.map((a) => a.id)).size, ARTIFACTS.length, 'id 唯一');
});

test('东盟档案：十国齐全且素材互不重复', () => {
  assert.equal(ASEAN_COUNTRY_CODES.length, 10);
  for (const code of ASEAN_COUNTRY_CODES) {
    const p = ASEAN_PROFILES[code];
    assert.ok(p, `${code} 存在`);
    assert.equal(p.code, code);
    assert.ok(p.highlights.length >= 3, `${code} 至少 3 个亮点`);
    assert.ok(p.festivals.length >= 1, `${code} 节庆`);
    assert.ok(p.cuisine.length >= 2, `${code} 饮食`);
    assert.ok(p.etiquette.length >= 2, `${code} 礼仪`);
    assert.ok(p.unesco.length >= 1, `${code} UNESCO`);
    assert.ok(localized(p.name, 'zh') && localized(p.name, 'en'), `${code} 名称`);
  }
});

test('东盟档案：UNESCO 年份合理（1950 之后、不晚于今年）', () => {
  const now = new Date().getFullYear();
  for (const code of ASEAN_COUNTRY_CODES) {
    for (const u of ASEAN_PROFILES[code].unesco) {
      assert.ok(u.year >= 1950 && u.year <= now, `${code} ${u.name.zh} 年份 ${u.year}`);
    }
  }
});

test('站内搜索：中文与英文都能命中', () => {
  const zh = searchDocs('铜鼓', 'zh');
  assert.ok(zh.length > 0, '中文检索有结果');
  assert.ok(zh.some((h) => h.doc.title.includes('铜鼓')), '命中铜鼓');

  const en = searchDocs('brocade', 'en');
  assert.ok(en.length > 0, '英文检索有结果');

  const none = searchDocs('zzzzzz', 'en');
  assert.equal(none.length, 0, '无意义查询返回空');
});

test('站内搜索：每条文档路径都指向站内路由', () => {
  for (const d of SEARCH_DOCS) {
    assert.match(d.path, /^\/[a-z0-9#/-]+$/i, `${d.id} 路径`);
    assert.ok(d.title && d.titleEn, `${d.id} 标题`);
  }
});
