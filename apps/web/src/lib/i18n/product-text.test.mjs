import assert from "node:assert/strict"
import { test } from "node:test"

import { localizedText } from "./product-text.ts"

const base = {
  id: "wuzhou-liubao-tea",
  name: "梧州六堡茶",
  category: "茶叶",
  description: "中文描述",
  origin: "广西梧州",
  cultural_background: "中文文化背景",
  usage: "中文使用方法",
  ingredients: ["茶叶"],
}

test("the default locale returns the canonical Chinese copy untouched", () => {
  const text = localizedText({ ...base, name_en: "Wuzhou Liubao Tea" }, "zh")

  assert.equal(text.name, "梧州六堡茶")
  assert.equal(text.category, "茶叶")
  assert.equal(text.origin, "广西梧州")
  assert.equal(text.usage, "中文使用方法")
  assert.equal(text.culturalBackground, "中文文化背景")
})

test("a translated locale uses every localized field", () => {
  const text = localizedText(
    {
      ...base,
      name_en: "Wuzhou Liubao Tea",
      description_en: "English description",
      category_en: "Tea",
      origin_en: "Wuzhou, Guangxi",
      usage_en: "Brew to taste.",
      cultural_background_en: "Local tea culture.",
    },
    "en",
  )

  assert.equal(text.name, "Wuzhou Liubao Tea")
  assert.equal(text.description, "English description")
  assert.equal(text.category, "Tea")
  assert.equal(text.origin, "Wuzhou, Guangxi")
  assert.equal(text.usage, "Brew to taste.")
  assert.equal(text.culturalBackground, "Local tea culture.")
})

test("an absent or blank translation falls back to the canonical Chinese copy", () => {
  for (const value of [null, undefined, "   "]) {
    const text = localizedText(
      {
        ...base,
        category_en: value,
        origin_en: value,
        usage_en: value,
        cultural_background_en: value,
      },
      "en",
    )

    assert.equal(text.category, "茶叶")
    assert.equal(text.origin, "广西梧州")
    assert.equal(text.usage, "中文使用方法")
    assert.equal(text.culturalBackground, "中文文化背景")
  }
})

test("ingredients stay canonical because the contract has no translated list", () => {
  const text = localizedText({ ...base, name_en: "Tea" }, "en")
  assert.deepEqual(text.ingredients, ["茶叶"])
})
