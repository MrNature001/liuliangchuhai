"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import type { ReactNode } from "react"

import { getDictionary, type Dictionary } from "./dictionaries"
import { defaultLocale, isLocale, type Locale } from "./locales"

const STORAGE_KEY = "liuliangchuhai.locale"

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// A tiny external store keeps the persisted preference out of render-phase
// effects: getSnapshot is the current value, getServerSnapshot pins the
// server (and first client) render so hydration always matches.
const listeners = new Set<() => void>()
let current: Locale | null = null

function readStored(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isLocale(stored) ? stored : null
  } catch {
    // Private mode or blocked storage: fall back to the default locale.
    return null
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): Locale {
  current ??= readStored()
  return current ?? defaultLocale
}

function getServerSnapshot(): Locale {
  return defaultLocale
}

function writeLocale(next: Locale) {
  current = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Persisting is best-effort; the in-memory switch still applies.
  }
  for (const listener of listeners) listener()
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => writeLocale(next), [])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: getDictionary(locale) }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used within a LocaleProvider")
  return context
}
