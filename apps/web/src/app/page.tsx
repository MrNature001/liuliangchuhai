"use client"

import Link from "next/link"
import { Suspense } from "react"

import { FeaturedProducts, HeroExample } from "@/features/landing/CatalogShowcase"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import styles from "./page.module.css"

export default function Home() {
  const { t } = useLocale()

  return (
    <div className={styles.landing}>
      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span className={styles.dot} /> {t.hero.eyebrow}</p>
            <h1 id="hero-title">
              {t.hero.title1}<br /><em>{t.hero.titleAccent}</em><br />{t.hero.title2}
            </h1>
            <p className={styles.intro}>{t.hero.intro}</p>
          </div>
          <div className={styles.heroVisual}>
            <Suspense fallback={
              <div className={styles.visualLoading} role="status">
                {t.hero.loadingTitle}<span>{t.hero.loadingCatalog}</span>
              </div>
            }>
              <HeroExample />
            </Suspense>
          </div>
          <div className={styles.heroActions}>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/analysis">
                {t.hero.startAnalysis} <span aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.secondary} href="/products">
                {t.hero.exploreProducts} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className={styles.heroNote}>{t.hero.note}</p>
          </div>
        </section>

        <section className={styles.workflow} aria-labelledby="workflow-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>{t.workflow.eyebrow}</p>
            <h2 id="workflow-title">{t.workflow.title}</h2>
          </div>
          <ol className={styles.steps}>
            {t.workflow.steps.map(([title, description], index) => (
              <li key={title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.featured} aria-labelledby="featured-title">
          <div className={styles.featuredHeading}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>{t.featured.eyebrow}</p>
              <h2 id="featured-title">{t.featured.title}</h2>
              <p>{t.featured.subtitle}</p>
            </div>
            <Link className={styles.textLink} href="/products">
              {t.featured.exploreAll} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <Suspense fallback={<div className={styles.catalogState} role="status">{t.featured.loading}</div>}>
            <FeaturedProducts />
          </Suspense>
        </section>

        <section className={styles.outputs} aria-labelledby="outputs-title">
          <div className={styles.outputIntro}>
            <p className={styles.eyebrow}>{t.outputs.eyebrow}</p>
            <h2 id="outputs-title">{t.outputs.title1}<br /><em>{t.outputs.title2}</em></h2>
            <p>{t.outputs.intro}</p>
            <p className={styles.demoNote}>{t.outputs.demoNote}</p>
          </div>
          <ul className={styles.outputList}>
            {t.outputs.items.map(([title, description], index) => (
              <li key={title}>
                <span aria-hidden="true">0{index + 1}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
                <span className={styles.outputArrow} aria-hidden="true">↗</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.finalCta} aria-labelledby="cta-title">
          <p className={styles.eyebrow}>{t.cta.eyebrow}</p>
          <h2 id="cta-title">{t.cta.title}</h2>
          <p>{t.cta.body}</p>
          <Link className={styles.primary} href="/analysis">
            {t.cta.start} <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
    </div>
  )
}
