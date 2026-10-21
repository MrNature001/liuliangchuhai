import type { paths } from "./generated/schema"

type Operation = paths["/digital-human"]["post"]
export type DigitalHumanRequest = Operation["requestBody"]["content"]["application/json"]
export type DigitalHumanResponse = Operation["responses"][200]["content"]["application/json"]

export const digitalHumanErrorMessage =
  "暂时无法生成数字人视频，请稍后再试。"

export class DigitalHumanApiError extends Error {
  name = "DigitalHumanApiError"
}

const statusMessages: Partial<Record<number, string>> = {
  422: "当前脚本无法生成数字人视频，请调整后重试。",
  504: "数字人渲染超时，请稍后再试。",
}

export async function generateDigitalHuman(
  request: DigitalHumanRequest,
): Promise<DigitalHumanResponse> {
  const script = request.script.trim()
  const language = request.language.trim()
  if (!script || !language) throw new DigitalHumanApiError(digitalHumanErrorMessage)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/digital-human`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script, language }),
      // Rendering is a long remote job; let the server-side deadline decide.
      signal: AbortSignal.timeout(330_000),
    })
    if (!response.ok) {
      throw new DigitalHumanApiError(
        statusMessages[response.status] ?? digitalHumanErrorMessage,
      )
    }
    return (await response.json()) as DigitalHumanResponse
  } catch (error) {
    if (error instanceof DigitalHumanApiError) throw error
    throw new DigitalHumanApiError(digitalHumanErrorMessage)
  }
}
