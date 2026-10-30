import type { paths } from "./generated/schema"

type Operation = paths["/video"]["post"]
export type VideoRequest = Operation["requestBody"]["content"]["application/json"]
export type VideoResponse = Operation["responses"][200]["content"]["application/json"]

export const videoErrorMessage = "暂时无法生成短视频，请稍后再试。"

export class VideoApiError extends Error {
  name = "VideoApiError"
}

const statusMessages: Partial<Record<number, string>> = {
  422: "当前内容无法生成短视频，请调整后重试。",
  504: "短视频渲染超时，请稍后再试。",
}

export async function generateVideo(request: VideoRequest): Promise<VideoResponse> {
  const prompt = request.prompt.trim()
  if (!prompt) throw new VideoApiError(videoErrorMessage)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_url: request.image_url }),
      // Rendering is a long remote job; let the server-side deadline decide.
      signal: AbortSignal.timeout(640_000),
    })
    if (!response.ok) {
      throw new VideoApiError(statusMessages[response.status] ?? videoErrorMessage)
    }
    return (await response.json()) as VideoResponse
  } catch (error) {
    if (error instanceof VideoApiError) throw error
    throw new VideoApiError(videoErrorMessage)
  }
}
