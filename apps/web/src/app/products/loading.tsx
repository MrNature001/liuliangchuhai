"use client"

import { useLocale } from "@/lib/i18n/LocaleProvider"
import styles from "@/features/products/products.module.css"

export default function LoadingProducts() {
  const { t } = useLocale()
  return (
    <main className={styles.page} aria-busy="true">
      <div className={styles.state} role="status">
        <p className={styles.eyebrow}>{t.productsLoading.eyebrow}</p>
        <h1>{t.productsLoading.title}</h1>
        <p>{t.productsLoading.body}</p>
      </div>
    </main>
  )
}
