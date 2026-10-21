"use client"

import { useMemo } from "react"

import { localizedText, type AnyProduct, type ProductText } from "./product-text"
import { useLocale } from "./LocaleProvider"

/** Resolves a product's display copy for the active interface language. */
export function useProductText(product: AnyProduct | null | undefined): ProductText | null {
  const { locale } = useLocale()
  return useMemo(() => (product ? localizedText(product, locale) : null), [product, locale])
}

/** Non-null variant for components that render only once a product exists. */
export function useRequiredProductText(product: AnyProduct): ProductText {
  const { locale } = useLocale()
  return useMemo(() => localizedText(product, locale), [product, locale])
}

export { localizedText }
export type { ProductText }
