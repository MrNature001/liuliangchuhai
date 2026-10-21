"use client"

import Link from "next/link"

import { useLocale } from "@/lib/i18n/LocaleProvider"
import styles from "@/features/products/products.module.css"

export default function ProductNotFound() {
  const { t } = useLocale()
  return (
    <main className={styles.page}>
      <div className={styles.state}>
        <p className={styles.eyebrow}>{t.notFound.eyebrow}</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.body}</p>
        <Link className={styles.button} href="/products">{t.notFound.browse}</Link>
      </div>
    </main>
  )
}
