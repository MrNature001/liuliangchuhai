"use client"

import { useRef, useState, type FormEvent } from "react"

import {
  DigitalHumanApiError,
  generateDigitalHuman,
  type DigitalHumanResponse,
} from "@/api/digital-human"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./analysis.module.css"

type VideoState =
  | { status: "ready" | "generating" }
  | { status: "error"; message: string }
  | { status: "success"; result: DigitalHumanResponse }

/**
 * Renders the digital-human video for a finished script. The request is one
 * bounded long-running call, so the control stays disabled until it settles and
 * a failure leaves the previous result untouched.
 */
export function DigitalHumanSection({ script }: { script: string }) {
  const { t } = useLocale()
  const [language, setLanguage] = useState<string>(t.digitalHuman.language)
  const [video, setVideo] = useState<VideoState>({ status: "ready" })
  const inFlight = useRef(false)
  const generating = video.status === "generating"
  const isPlaceholder = video.status === "success" && video.result.media_url.startsWith("mock:")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || !script.trim() || !language.trim()) return
    inFlight.current = true
    setVideo({ status: "generating" })
    try {
      const result = await generateDigitalHuman({ script: script.trim(), language: language.trim() })
      setVideo({ status: "success", result })
    } catch (error) {
      setVideo({
        status: "error",
        message: error instanceof DigitalHumanApiError ? error.message : t.errors.digitalHuman,
      })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <section className={styles.contentPlan} aria-labelledby="digital-human-title" aria-busy={generating}>
      <h2 id="digital-human-title">{t.digitalHuman.title}</h2>
      <p className={styles.muted}>{t.digitalHuman.intro}</p>
      <form onSubmit={submit}>
        <fieldset className={styles.fields} disabled={generating}>
          <label htmlFor="digital-human-language">{t.digitalHuman.language}</label>
          <input
            id="digital-human-language"
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value)
              setVideo({ status: "ready" })
            }}
            required
          />
          <button
            className={styles.submitButton}
            type="submit"
            disabled={generating || !language.trim() || !script.trim()}
          >
            {generating ? t.digitalHuman.generating : t.digitalHuman.generate}
          </button>
        </fieldset>
      </form>
      <p className={styles.status} role="status" aria-live="polite">
        {generating
          ? t.digitalHuman.statusGenerating
          : video.status === "success" ? t.digitalHuman.statusReady : ""}
      </p>
      {video.status === "error" && <p className={styles.error} role="alert">{video.message}</p>}
      {video.status === "success" && (
        isPlaceholder ? (
          <p className={styles.muted} role="status">
            {t.digitalHuman.mockNote}
          </p>
        ) : (
          <figure>
            <video
              className={styles.digitalHumanVideo}
              src={video.result.media_url}
              controls
              playsInline
              aria-label={t.digitalHuman.videoLabel}
            />
            <figcaption className={styles.muted}>{t.digitalHuman.videoLabel}</figcaption>
          </figure>
        )
      )}
    </section>
  )
}
