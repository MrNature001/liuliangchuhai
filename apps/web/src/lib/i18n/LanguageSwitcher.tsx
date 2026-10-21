"use client"

import { useEffect, useRef, useState } from "react"

import { localeLabels, locales, type Locale } from "@/lib/i18n/locales"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import styles from "./LanguageSwitcher.module.css"

/** Compact language picker: endonym labels, keyboard reachable, closes on outside click. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        trigger.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  function choose(next: Locale) {
    setLocale(next)
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }

  return (
    <div className={styles.switcher} ref={container}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.nav.switchLanguage}: ${localeLabels[locale]}`}
        onClick={() => setOpen((previous) => !previous)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className={styles.current}>{localeLabels[locale]}</span>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label={t.nav.language}>
          {locales.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === locale}
                lang={option}
                className={option === locale ? `${styles.option} ${styles.active}` : styles.option}
                onClick={() => choose(option)}
              >
                <span>{localeLabels[option]}</span>
                {option === locale && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
