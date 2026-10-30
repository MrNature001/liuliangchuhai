import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import { ImageApiError, generateImage, imageErrorMessage } from "../../api/image.ts"

const originalFetch = globalThis.fetch
const originalBaseUrl = process.env.NEXT_PUBLIC_API_URL

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = originalBaseUrl
})

const request = {
  prompt: "A tea gift box on a wooden table",
  language: "English",
  headline: "A quiet gift",
}

test("generation trims the request and posts to the configured API", async () => {
  process.env.NEXT_PUBLIC_API_URL = "https://api.example/base/"
  const expected = { media_url: "/media/keyvisual-1.png", provider: "drawn" }
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.example/base/image")
    assert.equal(options.method, "POST")
    assert.deepEqual(JSON.parse(options.body), request)
    assert.ok(options.signal instanceof AbortSignal)
    return Response.json(expected)
  }

  assert.deepEqual(
    await generateImage({
      prompt: "  A tea gift box on a wooden table  ",
      language: " English ",
      headline: " A quiet gift ",
    }),
    expected,
  )
})

test("blank input is rejected before any request is sent", async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    return Response.json({ media_url: "unused", provider: "drawn" })
  }

  await assert.rejects(generateImage({ ...request, prompt: "   " }), ImageApiError)
  assert.equal(calls, 0)
})

for (const status of [422, 500]) {
  test(`HTTP ${status} surfaces a stable public error`, async () => {
    globalThis.fetch = async () => new Response("private backend details", { status })
    await assert.rejects(generateImage(request), { name: "ImageApiError" })
  })
}

test("network failure and unreadable bodies stay masked", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("offline")
  }
  await assert.rejects(generateImage(request), { message: imageErrorMessage })

  globalThis.fetch = async () => new Response("not json", { status: 200 })
  await assert.rejects(generateImage(request), { name: "ImageApiError" })
})
