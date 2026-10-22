"use client"

import { useEffect, useRef, useState } from "react"

import { useLocale } from "@/lib/i18n/LocaleProvider"

import { heightMessage } from "@/lib/embed"
import styles from "./analysis.module.css"

/**
 * Copy-paste snippet for embedding the demo on another site.
 *
 * The snippet is generated in the browser because only the browser knows the
 * public origin the visitor actually reached this page through — a server-side
 * guess would produce a localhost URL in the clipboard.
 */
export function EmbedSnippet({ productId, locale }: { productId: string; locale: string }) {
  const { t } = useLocale()
  const [snippet, setSnippet] = useState("")
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    void import("@/lib/embed").then(({ buildEmbedSnippet }) => {
      if (cancelled) return
      setSnippet(
        buildEmbedSnippet({
          origin: window.location.origin,
          productId: productId || undefined,
          locale,
        }),
      )
    })
    return () => {
      cancelled = true
    }
  }, [productId, locale])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
    } catch {
      setCopied(false)
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className={styles.embedPanel} aria-labelledby="embed-title">
      <div className={styles.sectionHeading}>
        <h2 id="embed-title">{t.embed.title}</h2>
        <button
          type="button"
          className={styles.copyButton}
          onClick={() => void copy()}
          disabled={!snippet}
        >
          <span aria-live="polite">{copied ? t.embed.copied : t.embed.copy}</span>
        </button>
      </div>
      <p className={styles.muted}>{t.embed.intro}</p>
      <textarea
        className={styles.embedCode}
        readOnly
        rows={5}
        value={snippet}
        spellCheck={false}
        aria-label={t.embed.title}
        onFocus={(event) => event.currentTarget.select()}
      />
      <p>
        <a className={styles.secondaryButton} href={embedHref(productId, locale)} target="_blank" rel="noopener noreferrer">
          {t.embed.open} ↗
        </a>
      </p>
    </section>
  )
}

/** Relative link to the bare embed, used for a quick standalone preview. */
function embedHref(productId: string, locale: string): string {
  const query = new URLSearchParams()
  if (productId) query.set("product_id", productId)
  if (locale) query.set("lang", locale)
  const suffix = query.toString() ? `?${query.toString()}` : ""
  return `/embed${suffix}`
}

/**
 * Reports the embed's real height to the host page so an iframe can size itself.
 *
 * A ResizeObserver on <html> catches every layout change, including font
 * loading and the analysis report growing after a request finishes.
 */
export function EmbedHeightReporter() {
  useEffect(() => {
    if (window.parent === window) return

    function report() {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage(heightMessage(height), "*")
    }

    report()
    const observer = new ResizeObserver(report)
    observer.observe(document.documentElement)
    window.addEventListener("load", report)
    return () => {
      observer.disconnect()
      window.removeEventListener("load", report)
    }
  }, [])

  return null
}
