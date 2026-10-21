"use client"

import Link from "next/link"

import { useLocale } from "@/lib/i18n/LocaleProvider"
import styles from "./analysis.module.css"

export function AnalysisNavigation() {
  const { t } = useLocale()
  return (
    <nav className={styles.navigation} aria-label={t.nav.demoNav}>
      <Link href="/">{t.nav.home}</Link>
      <Link href="/products">{t.nav.browseProducts}</Link>
    </nav>
  )
}
