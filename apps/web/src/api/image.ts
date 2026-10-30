import type { paths } from "./generated/schema"

type Operation = paths["/image"]["post"]
export type ImageRequest = Operation["requestBody"]["content"]["application/json"]
export type ImageResponse = Operation["responses"][200]["content"]["application/json"]

export const imageErrorMessage = "暂时无法生成配图，请稍后再试。"

export class ImageApiError extends Error {
  name = "ImageApiError"
}

const statusMessages: Partial<Record<number, string>> = {
  422: "当前图片提示词无法生成配图，请调整后重试。",
}

export async function generateImage(request: ImageRequest): Promise<ImageResponse> {
  const prompt = request.prompt.trim()
  const language = request.language.trim()
  const headline = request.headline.trim()
  if (!prompt || !language || !headline) throw new ImageApiError(imageErrorMessage)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, language, headline }),
      signal: AbortSignal.timeout(150_000),
    })
    if (!response.ok) {
      throw new ImageApiError(statusMessages[response.status] ?? imageErrorMessage)
    }
    return (await response.json()) as ImageResponse
  } catch (error) {
    if (error instanceof ImageApiError) throw error
    throw new ImageApiError(imageErrorMessage)
  }
}
