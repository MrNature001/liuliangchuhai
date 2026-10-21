import assert from "node:assert/strict"
import { test } from "node:test"

import { localizedText } from "./product-text.ts"

const base = {
  id: "wuzhou-liubao-tea",
  name: "梧州六堡茶",
  category: "茶叶",
  description: "用于展示广西茶文化的演示商品。",
  origin: "广西梧州",
  cultural_background: "六堡茶与梧州地方茶文化相联系。",
  usage: "冲泡饮用。",
  ingredients: ["茶叶"],
  price: null,
  purchase_url: null,
  name_en: "Wuzhou Liubao Tea",
  name_vi: "Trà Lục Bảo Ngô Châu",
  name_th: "ชาหลิวเป่าอู๋โจว",
  name_ms: "Teh Liubao Wuzhou",
  name_id: "Teh Liubao Wuzhou",
  description_en: "A Liubao dark tea.",
  description_vi: "Trà đen Lục Bảo.",
  description_th: "ชาดำหลิวเป่า",
  description_ms: "Teh hitam Liubao.",
  description_id: "Teh hitam Liubao.",
}

test("each locale prefers its own localized name and description", () => {
  const expectations = {
    zh: "梧州六堡茶",
    en: "Wuzhou Liubao Tea",
    vi: "Trà Lục Bảo Ngô Châu",
    th: "ชาหลิวเป่าอู๋โจว",
    ms: "Teh Liubao Wuzhou",
    id: "Teh Liubao Wuzhou",
  }
  for (const [locale, name] of Object.entries(expectations)) {
    assert.equal(localizedText(base, locale).name, name, `${locale} name`)
  }
  assert.equal(localizedText(base, "en").description, "A Liubao dark tea.")
})

test("the canonical record survives when a translation is absent", () => {
  const bare = {
    ...base,
    name_en: null, name_vi: null, name_th: null, name_ms: null, name_id: null,
    description_en: null, description_vi: null, description_th: null,
    description_ms: null, description_id: null,
  }
  for (const locale of ["en", "vi", "th", "ms", "id"]) {
    const text = localizedText(bare, locale)
    assert.equal(text.name, "梧州六堡茶", `${locale} falls back to the canonical name`)
    assert.equal(text.description, base.description, `${locale} falls back to the canonical description`)
  }
})

test("whitespace-only translations never replace real content", () => {
  const padded = { ...base, name_en: "   ", description_en: "\n\t" }
  const text = localizedText(padded, "en")
  assert.equal(text.name, "梧州六堡茶")
  assert.equal(text.description, base.description)
})

test("fields without a localized variant keep the canonical value in every locale", () => {
  for (const locale of ["zh", "en", "vi", "th", "ms", "id"]) {
    const text = localizedText(base, locale)
    assert.equal(text.category, "茶叶")
    assert.equal(text.origin, "广西梧州")
    assert.equal(text.usage, "冲泡饮用。")
    assert.equal(text.culturalBackground, base.cultural_background)
    assert.deepEqual(text.ingredients, ["茶叶"])
  }
})
