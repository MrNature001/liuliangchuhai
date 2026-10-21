import assert from "node:assert/strict"
import { test } from "node:test"

import { dictionaries } from "./dictionaries.ts"
import { locales } from "./locales.ts"

// Placeholders are substituted at render time; an unknown token would render
// literally to the user, so each locale must ship exactly the same token set.
const IMAGE_KEYS = ["productAlt", "galleryLabel", "showImage"]

const EXPECTED_TOKENS = {
  productAlt: ["index", "name"],
  galleryLabel: ["name"],
  showImage: ["index", "total"],
}

function tokens(value) {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
}

test("image copy carries the placeholders its components substitute", () => {
  for (const locale of locales) {
    for (const key of IMAGE_KEYS) {
      const value = dictionaries[locale].images[key]
      assert.deepEqual(tokens(value), EXPECTED_TOKENS[key], `${locale}.images.${key} placeholders`)
      assert.ok(value.trim().length > 0, `${locale}.images.${key} must not be blank`)
    }
  }
})

test("copy-confirmation labels stay short enough for the inline button", () => {
  for (const locale of locales) {
    for (const key of ["copy", "copied", "copyFailed"]) {
      const value = dictionaries[locale].contentPlan[key]
      assert.ok(value.trim().length > 0, `${locale}.contentPlan.${key} must not be blank`)
      assert.ok(value.length <= 24, `${locale}.contentPlan.${key} is too long for the button`)
    }
  }
})
