"use client"

import { useRef, useState } from "react"

import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./analysis.module.css"

/**
 * Copies one finished asset. The status text replaces the label in place so the
 * control keeps the same width and screen-reader users get a polite confirmation.
 */
export function CopyButton({ text }: { text: string }) {
  const { t } = useLocale()
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setState("copied")
    } catch {
      setState("failed")
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 2000)
  }

  return (
    <button type="button" className={styles.copyButton} onClick={() => void copy()}>
      <span aria-live="polite">
        {state === "copied"
          ? t.contentPlan.copied
          : state === "failed" ? t.contentPlan.copyFailed : t.contentPlan.copy}
      </span>
    </button>
  )
}
