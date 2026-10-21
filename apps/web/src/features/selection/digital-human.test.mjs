import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import {
  DigitalHumanApiError,
  digitalHumanErrorMessage,
  generateDigitalHuman,
} from "../../api/digital-human.ts"

const originalFetch = globalThis.fetch
const originalBaseUrl = process.env.NEXT_PUBLIC_API_URL

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL
  else process.env.NEXT_PUBLIC_API_URL = originalBaseUrl
})

test("generation trims the request and posts to the configured API", async () => {
  process.env.NEXT_PUBLIC_API_URL = "https://api.example/base/"
  const expected = { media_url: "https://cdn.example/v.mp4" }
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.example/base/digital-human")
    assert.equal(options.method, "POST")
    assert.equal(options.headers["Content-Type"], "application/json")
    assert.deepEqual(JSON.parse(options.body), { script: "Hello", language: "English" })
    assert.ok(options.signal instanceof AbortSignal)
    return Response.json(expected)
  }

  assert.deepEqual(
    await generateDigitalHuman({ script: "  Hello  ", language: " English " }),
    expected,
  )
})

test("blank input is rejected before any request is sent", async () => {
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    return Response.json({ media_url: "unused" })
  }

  await assert.rejects(
    generateDigitalHuman({ script: "   ", language: "English" }),
    DigitalHumanApiError,
  )
  assert.equal(calls, 0)
})

for (const [status, message] of [
  [422, "当前脚本无法生成数字人视频，请调整后重试。"],
  [504, "数字人渲染超时，请稍后再试。"],
  [503, digitalHumanErrorMessage],
]) {
  test(`HTTP ${status} surfaces a stable public error`, async () => {
    globalThis.fetch = async () => new Response("private backend details", { status })
    await assert.rejects(generateDigitalHuman({ script: "Hello", language: "English" }), {
      name: "DigitalHumanApiError",
      message,
    })
  })
}

test("network failure and unreadable bodies stay masked", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("offline")
  }
  await assert.rejects(generateDigitalHuman({ script: "Hello", language: "English" }), {
    message: digitalHumanErrorMessage,
  })

  globalThis.fetch = async () => new Response("not json", { status: 200 })
  await assert.rejects(generateDigitalHuman({ script: "Hello", language: "English" }), {
    message: digitalHumanErrorMessage,
  })
})
