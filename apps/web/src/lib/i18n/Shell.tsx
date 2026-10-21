"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import { LanguageSwitcher } from "./LanguageSwitcher"
import { useLocale } from "./LocaleProvider"
import ui from "@/app/ui.module.css"

/** Translated page chrome: skip link, header navigation and footer. */
export function Shell({ children }: { children: ReactNode }) {
  const { t } = useLocale()

  return (
    <>
      <a className={ui.skipLink} href="#main-content">{t.nav.skip}</a>
      <header className={ui.navigation}>
        <Link href="/" className={ui.brand} aria-label={`${t.brand.name} ${t.nav.home}`}>
          <span className={ui.brandMark} aria-hidden="true">↗</span>
          <span>
            {t.brand.name}
            <span className={ui.brandCaption}>{t.brand.caption}</span>
          </span>
        </Link>
        <nav aria-label={t.nav.mainNav}>
          <Link className={ui.navProducts} href="/products">{t.nav.products}</Link>
          <Link className={ui.navAction} href="/analysis">
            {t.nav.startAnalysis} <span aria-hidden="true">↗</span>
          </Link>
          <LanguageSwitcher />
        </nav>
      </header>
      <div id="main-content" className={ui.content} tabIndex={-1}>{children}</div>
      <footer className={ui.footer}>
        <span>
          {t.brand.name} <span className={ui.footerChinese}>{t.brand.footerTagline}</span>
        </span>
        <span>{t.brand.footerRoute}</span>
        <span>{t.brand.footerNote}</span>
      </footer>
    </>
  )
}
