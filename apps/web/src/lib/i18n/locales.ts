/**
 * UI locale registry. One entry per language the interface itself can render.
 * `code` values also act as the `lang` attribute and the persisted preference.
 */
export const locales = ["zh", "en", "vi", "th", "ms", "id"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "zh"

/** Endonym labels so each language is recognisable in its own script. */
export const localeLabels: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  vi: "Tiếng Việt",
  th: "ไทย",
  ms: "Bahasa Melayu",
  id: "Bahasa Indonesia",
}

/** Short tag for the compact switch control. */
export const localeShortLabels: Record<Locale, string> = {
  zh: "中",
  en: "EN",
  vi: "VI",
  th: "ไทย",
  ms: "MS",
  id: "ID",
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale
}
