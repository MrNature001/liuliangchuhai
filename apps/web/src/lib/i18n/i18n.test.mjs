import assert from "node:assert/strict"
import { test } from "node:test"

import { dictionaries } from "./dictionaries.ts"
import { defaultLocale, isLocale, localeLabels, localeShortLabels, locales, resolveLocale } from "./locales.ts"

// Flatten to dotted paths so a missing nested key is compared, not just a missing group.
// Arrays are leaves: some entries are tuples of strings (steps) or pairs (items).
function flatten(value, prefix = "") {
  const keys = []
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      keys.push(...flatten(entry, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

// Collect every string reachable from a leaf, so array-of-array copy is checked too.
function leafStrings(value) {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(leafStrings)
  return []
}

test("every locale ships a dictionary with the same key set as the default", () => {
  const expected = new Set(flatten(dictionaries[defaultLocale]))
  assert.ok(expected.size > 100, "sanity: the default dictionary should be substantial")

  for (const locale of locales) {
    const actual = new Set(flatten(dictionaries[locale]))
    const missing = [...expected].filter((key) => !actual.has(key))
    const extra = [...actual].filter((key) => !expected.has(key))
    assert.deepEqual(missing, [], `${locale} is missing keys`)
    assert.deepEqual(extra, [], `${locale} has unexpected keys`)
  }
})

test("no locale leaves a user-visible string blank", () => {
  for (const locale of locales) {
    for (const key of flatten(dictionaries[locale])) {
      const value = key.split(".").reduce((node, part) => node?.[part], dictionaries[locale])
      const parts = leafStrings(value)
      assert.ok(parts.length > 0, `${locale}.${key} should contain strings`)
      for (const part of parts) {
        assert.ok(part.trim().length > 0, `${locale}.${key} must not contain a blank string`)
      }
    }
  }
})

test("every locale has a label and a short label", () => {
  for (const locale of locales) {
    assert.ok(localeLabels[locale]?.trim(), `${locale} needs an endonym label`)
    assert.ok(localeShortLabels[locale]?.trim(), `${locale} needs a short label`)
  }
})

test("unknown or malformed stored values fall back to the default locale", () => {
  assert.equal(resolveLocale("en"), "en")
  assert.equal(resolveLocale("klingon"), defaultLocale)
  assert.equal(resolveLocale(null), defaultLocale)
  assert.equal(resolveLocale(undefined), defaultLocale)
  assert.equal(resolveLocale(42), defaultLocale)
  assert.equal(isLocale("th"), true)
  assert.equal(isLocale("TH"), false)
})
