/**
 * Pure localized-field resolution, kept free of React so it can run under
 * `node --test` and be reasoned about without a component tree.
 */

import type { ProductListResponse, ProductResponse } from "@/api/products"
import type { Locale } from "./locales"

export type AnyProduct = ProductListResponse["items"][number] | ProductResponse

export type ProductText = {
  name: string
  description: string
  category: string
  origin: string
  usage: string
  culturalBackground: string
  ingredients: string[]
}

const SUFFIXES: Record<Locale, string> = {
  zh: "", en: "_en", vi: "_vi", th: "_th", ms: "_ms", id: "_id",
}

/**
 * Locale-suffixed copy is optional on the contract. When a translation is
 * absent the canonical Chinese record stays authoritative, so the catalog is
 * never blank in a language that has no data yet.
 */
function pick(localized: string | null | undefined, fallback: string): string {
  return localized && localized.trim() ? localized : fallback
}

export function localizedText(product: AnyProduct, locale: Locale): ProductText {
  const suffix = SUFFIXES[locale]
  // Indexing stays explicit so TypeScript keeps the optional-field contract.
  const record = product as unknown as Record<string, string | null | undefined>

  return {
    name: suffix ? pick(record[`name${suffix}`], product.name) : product.name,
    description: suffix
      ? pick(record[`description${suffix}`], product.description)
      : product.description,
    category: suffix ? pick(record[`category${suffix}`], product.category) : product.category,
    origin: suffix ? pick(record[`origin${suffix}`], product.origin) : product.origin,
    usage: suffix ? pick(record[`usage${suffix}`], product.usage) : product.usage,
    culturalBackground: suffix
      ? pick(record[`cultural_background${suffix}`], product.cultural_background)
      : product.cultural_background,
    ingredients: product.ingredients,
  }
}
