"use client"

import { useRef, useState, type FormEvent } from "react"

import {
  ContentPlanApiError,
  createContentPlan,
  type ContentPlanRequest,
  type ContentPlanResponse,
} from "@/api/content-plan"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./analysis.module.css"

type ContentPlanState =
  | { status: "ready" | "generating" }
  | { status: "error"; message: string }
  | { status: "success"; result: ContentPlanResponse }

export default function ContentPlanSection({
  request,
}: {
  request: Omit<ContentPlanRequest, "target_language">
}) {
  const { t } = useLocale()
  // null means "follow the interface language"; a string is an explicit choice.
  const [languageOverride, setLanguageOverride] = useState<string | null>(null)
  const language = languageOverride ?? t.contentPlan.languages.en
  const [plan, setPlan] = useState<ContentPlanState>({ status: "ready" })
  const inFlight = useRef(false)
  const generating = plan.status === "generating"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current || !language.trim()) return
    inFlight.current = true
    setPlan({ status: "generating" })
    try {
      const result = await createContentPlan({ ...request, target_language: language.trim() })
      setPlan({ status: "success", result })
    } catch (error) {
      setPlan({
        status: "error",
        message: error instanceof ContentPlanApiError ? error.message : t.errors.contentPlan,
      })
    } finally {
      inFlight.current = false
    }
  }

  const textSections = plan.status === "success"
    ? [
        [t.contentPlan.imagePrompt, plan.result.image_prompt],
        [t.contentPlan.shortVideoIdea, plan.result.short_video_idea],
        [t.contentPlan.shortVideoPrompt, plan.result.short_video_prompt],
        [t.contentPlan.liveScript, plan.result.live_script],
        [t.contentPlan.socialCaption, plan.result.social_caption],
      ] as const
    : []

  return (
    <section className={styles.contentPlan} aria-labelledby="content-plan-title" aria-busy={generating}>
      <h2 id="content-plan-title">{t.contentPlan.title}</h2>
      <p className={styles.muted}>{t.contentPlan.intro}</p>
      <form onSubmit={submit}>
        <fieldset className={styles.fields} disabled={generating}>
          <label htmlFor="content-language">{t.contentPlan.language}</label>
          <input
            id="content-language"
            value={language}
            onChange={(event) => {
              setLanguageOverride(event.target.value)
              setPlan({ status: "ready" })
            }}
            required
          />
          <button className={styles.submitButton} type="submit" disabled={generating || !language.trim()}>
            {generating ? t.contentPlan.generating : t.contentPlan.generate}
          </button>
        </fieldset>
      </form>
      <p className={styles.status} role="status" aria-live="polite">
        {generating
          ? t.contentPlan.statusGenerating
          : plan.status === "success" ? t.contentPlan.statusReady : ""}
      </p>
      {plan.status === "error" && <p className={styles.error} role="alert">{plan.message}</p>}
      {plan.status === "success" && (
        <div className={styles.sections}>
          <section>
            <h3>{t.contentPlan.keySellingPoints}</h3>
            <ul>
              {plan.result.key_selling_points.map((point, index) => (
                <li key={`${index}-${point}`}>{point}</li>
              ))}
            </ul>
          </section>
          {textSections.map(([title, text]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
