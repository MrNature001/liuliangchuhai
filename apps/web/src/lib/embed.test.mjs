import assert from "node:assert/strict"
import { test } from "node:test"

import { buildEmbedSnippet, heightMessage, readEmbedParams } from "./embed.ts"

test("embed params read a product id and language", () => {
  assert.deepEqual(readEmbedParams("?product_id=wuzhou-liubao-tea&lang=EN"), {
    productId: "wuzhou-liubao-tea",
    locale: "en",
  })
})

test("embed params are optional and default to empty", () => {
  assert.deepEqual(readEmbedParams(""), { productId: "", locale: null })
  assert.deepEqual(readEmbedParams("?utm_source=newsletter"), { productId: "", locale: null })
})

test("embed params tolerate junk without failing the page", () => {
  const long = "x".repeat(500)
  const params = readEmbedParams(`?product_id=${long}&lang=`)

  assert.equal(params.productId.length, 120)
  assert.equal(params.locale, null)
})

test("the snippet points at the embed route with encoded query", () => {
  const snippet = buildEmbedSnippet({
    origin: "https://demo.example/",
    productId: "wuzhou-liubao-tea",
    locale: "vi",
  })

  assert.match(snippet, /src="https:\/\/demo\.example\/embed\?product_id=wuzhou-liubao-tea&lang=vi"/)
  assert.match(snippet, /<iframe/)
  assert.match(snippet, /loading="lazy"/)
})

test("the snippet omits an empty query string", () => {
  const snippet = buildEmbedSnippet({ origin: "https://demo.example" })

  assert.match(snippet, /src="https:\/\/demo\.example\/embed"/)
  assert.doesNotMatch(snippet, /embed\?/)
})

test("the snippet listener matches only the iframe that sent the message", () => {
  const snippet = buildEmbedSnippet({ origin: "https://demo.example" })

  assert.match(snippet, /contentWindow === event\.source/)
  assert.match(snippet, /liuliangchuhai:height/)
})

test("height messages are rounded and never collapse the frame", () => {
  assert.deepEqual(heightMessage(812.4), { type: "liuliangchuhai:height", height: 812 })
  assert.deepEqual(heightMessage(10), { type: "liuliangchuhai:height", height: 320 })
})
