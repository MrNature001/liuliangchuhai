"use client"

import { useRef, useState, type FormEvent } from "react"

import { VideoApiError, generateVideo, type VideoResponse } from "@/api/video"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./analysis.module.css"

type VideoState =
  | { status: "ready" | "generating" }
  | { status: "error"; message: string }
  | { status: "success"; result: VideoResponse }

/**
 * Renders a short clip from the plan's visual prompt. The request is one
 * bounded long-running call, so the control stays disabled until it settles.
 */
export function VideoSection({
  prompt,
  imagePath,
}: {
  prompt: string
  /** The key visual already on screen; animating it beats redrawing one. */
  imagePath?: string | null
}) {
  const { t } = useLocale()
  const [clip, setClip] = useState<VideoState>({ status: "ready" })
  const inFlight = useRef(false)
  const generating = clip.status === "generating"
  const isPlaceholder = clip.status === "success" && clip.result.media_url.startsWith("mock:")
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")
  const mediaSrc =
    clip.status === "success" && !isPlaceholder
      ? clip.result.media_url.startsWith("/")
        ? `${apiBase}${clip.result.media_url}`
        : clip.result.media_url
      : ""
  const fileName = mediaSrc ? (mediaSrc.split("/").pop() ?? "clip.mp4") : "clip.mp4"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || !prompt.trim()) return
    inFlight.current = true
    setClip({ status: "generating" })
    try {
      const result = await generateVideo({ prompt, image_path: imagePath ?? undefined })
      setClip({ status: "success", result })
    } catch (error) {
      setClip({
        status: "error",
        message: error instanceof VideoApiError ? error.message : t.errors.video,
      })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <section className={styles.contentPlan} aria-labelledby="video-title" aria-busy={generating}>
      <h2 id="video-title">{t.video.title}</h2>
      <p className={styles.muted}>{t.video.intro}</p>
      <form onSubmit={submit}>
        <fieldset className={styles.fields} disabled={generating}>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={generating || !prompt.trim()}
          >
            {generating ? t.video.generating : t.video.generate}
          </button>
        </fieldset>
      </form>
      <p className={styles.status} role="status" aria-live="polite">
        {generating
          ? t.video.statusGenerating
          : clip.status === "success" ? t.video.statusReady : ""}
      </p>
      {clip.status === "error" && <p className={styles.error} role="alert">{clip.message}</p>}
      {clip.status === "success" && (
        isPlaceholder ? (
          <p className={styles.muted} role="status">{t.video.mockNote}</p>
        ) : (
          <figure>
            <video
              className={styles.digitalHumanVideo}
              src={mediaSrc}
              controls
              playsInline
              aria-label={t.video.videoLabel}
            />
            <figcaption className={styles.captionRow}>
              <span className={styles.muted}>{t.video.note}</span>
              <a className={styles.copyButton} href={mediaSrc} download={fileName}>
                {t.video.download}
              </a>
            </figcaption>
          </figure>
        )
      )}
    </section>
  )
}
