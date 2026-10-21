"use client"

import Link from "next/link"
import { useEffect } from "react"

import { useLocale } from "@/lib/i18n/LocaleProvider"
import styles from "@/features/products/products.module.css"

export default function ProductsError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useLocale()
  // There is no telemetry backend in the demo, so surface the cause for support.
  useEffect(() => {
    console.error("Product catalog failed to render", error)
  }, [error])

  return (
    <main className={styles.page}>
      <div className={styles.state} role="alert">
        <p className={styles.eyebrow}>{t.productsError.eyebrow}</p>
        <h1>{t.productsError.title}</h1>
        <p>{t.productsError.body}</p>
        <div className={styles.actions}>
          <button className={styles.button} onClick={() => reset()}>{t.productsError.retry}</button>
          <Link className={styles.secondaryButton} href="/products">{t.productsError.back}</Link>
        </div>
      </div>
    </main>
  )
}
