"use client"

import { useRef, useState, type FormEvent } from "react"

import { ImageApiError, generateImage, type ImageResponse } from "@/api/image"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./analysis.module.css"

type ImageState =
  | { status: "ready" | "generating" }
  | { status: "error"; message: string }
  | { status: "success"; result: ImageResponse }

/**
 * Turns the plan's image prompt into one still. The prompt is the only input the
 * model gets, so the panel keeps it visible: it is what a designer would edit.
 */
export function ImageSection({
  prompt,
  headline,
  language,
}: {
  prompt: string
  headline: string
  language: string
}) {
  const { t } = useLocale()
  const [image, setImage] = useState<ImageState>({ status: "ready" })
  const inFlight = useRef(false)
  const generating = image.status === "generating"
  const isPlaceholder = image.status === "success" && image.result.media_url.startsWith("mock:")
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")
  const mediaSrc =
    image.status === "success" && !isPlaceholder
      ? image.result.media_url.startsWith("/")
        ? `${apiBase}${image.result.media_url}`
        : image.result.media_url
      : ""
  const fileName = mediaSrc ? (mediaSrc.split("/").pop() ?? "keyvisual.png") : "keyvisual.png"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || !prompt.trim()) return
    inFlight.current = true
    setImage({ status: "generating" })
    try {
      const result = await generateImage({ prompt, headline, language })
      setImage({ status: "success", result })
    } catch (error) {
      setImage({
        status: "error",
        message: error instanceof ImageApiError ? error.message : t.errors.image,
      })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <section className={styles.contentPlan} aria-labelledby="image-title" aria-busy={generating}>
      <h2 id="image-title">{t.image.title}</h2>
      <p className={styles.muted}>{t.image.intro}</p>
      <form onSubmit={submit}>
        <fieldset className={styles.fields} disabled={generating}>
          <button className={styles.submitButton} type="submit" disabled={generating || !prompt.trim()}>
            {generating ? t.image.generating : t.image.generate}
          </button>
        </fieldset>
      </form>
      <p className={styles.status} role="status" aria-live="polite">
        {generating
          ? t.image.statusGenerating
          : image.status === "success" ? t.image.statusReady : ""}
      </p>
      {image.status === "error" && <p className={styles.error} role="alert">{image.message}</p>}
      {image.status === "success" && (
        isPlaceholder ? (
          <p className={styles.muted} role="status">{t.image.mockNote}</p>
        ) : (
          <figure>
            {/* The still is generated at a fixed size; next/image would need a loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.keyVisual}
              src={mediaSrc}
              alt={t.image.imageLabel}
              width={1024}
              height={1536}
            />
            <figcaption className={styles.captionRow}>
              <span className={styles.muted}>
                {image.result.provider === "drawn" ? t.image.drawnNote : t.image.imageLabel}
              </span>
              <a className={styles.copyButton} href={mediaSrc} download={fileName}>
                {t.image.download}
              </a>
            </figcaption>
          </figure>
        )
      )}
    </section>
  )
}
