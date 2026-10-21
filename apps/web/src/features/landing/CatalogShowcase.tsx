"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { listProducts, type ProductListResponse } from "@/api/products"
import styles from "@/app/page.module.css"
import { localizedText } from "@/lib/i18n/product-text"
import { useRequiredProductText } from "@/lib/i18n/use-product-text"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { CatalogImage } from "./CatalogImage"
import { selectFeaturedProducts } from "./featured-products"

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; products: ProductListResponse["items"] }

// Both streamed sections share one catalog read per client mount.
let catalogPromise: Promise<ProductListResponse> | null = null
function loadCatalog(): Promise<ProductListResponse> {
  catalogPromise ??= listProducts()
  return catalogPromise
}

function useFeaturedProducts() {
  const [state, setState] = useState<CatalogState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    loadCatalog().then(
      (response) => {
        if (active) setState({ status: "ready", products: selectFeaturedProducts(response.items) })
      },
      () => {
        if (!active) return
        // A failed read must not be cached forever; let the retry refetch.
        catalogPromise = null
        setState({ status: "error" })
      },
    )
    return () => { active = false }
  }, [attempt])

  // Resetting here (not in the effect) keeps the effect free of synchronous setState.
  function retry() {
    setState({ status: "loading" })
    setAttempt((value) => value + 1)
  }

  return [state, retry] as const
}

export function HeroExample() {
  const { t } = useLocale()
  const [state] = useFeaturedProducts()
  const product = state.status === "ready" ? state.products[0] : undefined

  return (
    <div className={styles.example}>
      <div className={styles.exampleTop}>
        <span>{t.heroExample.topLeft}</span><span>{t.heroExample.topRight}</span>
      </div>
      {product ? (
        <HeroExampleProduct product={product} />
      ) : (
        <div className={styles.visualEmpty}>
          <span aria-hidden="true">↗</span>
          <h2>{t.heroExample.emptyTitle1}<br />{t.heroExample.emptyTitle2}</h2>
          <p>{t.heroExample.emptyBody}</p>
        </div>
      )}
      <p className={styles.exampleFoot}>
        {t.heroExample.footProduct} <span>→</span> {t.heroExample.footMarket}
        <span>→</span> {t.heroExample.footContent}
      </p>
    </div>
  )
}

function HeroExampleProduct({ product }: { product: ProductListResponse["items"][number] }) {
  const { t } = useLocale()
  const text = useRequiredProductText(product)

  return (
    <>
      <div className={styles.heroProduct}>
        <CatalogImage src={product.images[0]} name={text.name} priority />
        <div className={styles.productLabel}>
          <span>{text.origin} · {text.category}</span><h2>{text.name}</h2>
        </div>
      </div>
      <div className={styles.exampleReport}>
        <p className={styles.reportEyebrow}>
          {t.heroExample.exampleEyebrow} <span aria-hidden="true">↗</span>
        </p>
        <h3>{text.name} <span aria-hidden="true">→</span> {t.heroExample.toMalaysia}</h3>
        <div className={styles.reportRow}>
          <span>{t.heroExample.demoRecommendation}</span>
          <span className={styles.caution}>{t.heroExample.caution}</span>
        </div>
        <p className={styles.reportNote}>{t.heroExample.sampleNote}</p>
        <p className={styles.reportContent}>{t.heroExample.sampleBody}</p>
        <Link className={styles.textLink} href={`/analysis?product_id=${encodeURIComponent(product.id)}`}>
          {t.heroExample.tryProduct} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}

export function FeaturedProducts() {
  const { t } = useLocale()
  const [state, retry] = useFeaturedProducts()

  if (state.status === "loading") {
    return <div className={styles.catalogState} role="status"><h3>{t.featured.loading}</h3></div>
  }

  if (state.status === "error") {
    return (
      <div className={styles.catalogState} role="status">
        <h3>{t.featured.unavailableTitle}</h3>
        <p>{t.featured.unavailableBody}</p>
        <button type="button" className={styles.textLink} onClick={retry}>{t.productsError.retry}</button>
      </div>
    )
  }

  if (!state.products.length) {
    return (
      <div className={styles.catalogState} role="status">
        <h3>{t.featured.emptyTitle}</h3>
        <p>{t.featured.emptyBody}</p>
        <Link className={styles.textLink} href="/products">
          {t.featured.visitCatalog} <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  return (
    <ul className={styles.productGrid}>
      {state.products.map((product, index) => (
        <li key={product.id} className={styles.productCard}>
          <FeaturedCard product={product} index={index} />
        </li>
      ))}
    </ul>
  )
}

function FeaturedCard({ product, index }: {
  product: ProductListResponse["items"][number]
  index: number
}) {
  const { t } = useLocale()
  const text = useRequiredProductText(product)

  return (
    <>
      <div className={styles.cardImage}>
        <CatalogImage src={product.images[0]} name={text.name} />
        <span className={styles.cardNumber}>{t.featured.cardNumber}{index + 1}</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.tags}>
          <span className={styles.tag}>{text.category}</span><span className={styles.tag}>{text.origin}</span>
        </div>
        <h3>{text.name}</h3>
        <p className={styles.description}>{text.description}</p>
        <div className={styles.cardActions}>
          <Link className={styles.secondary} href={`/products/${encodeURIComponent(product.id)}`}
            aria-label={`${t.featured.viewProduct}: ${text.name}`}>
            {t.featured.viewProduct}
          </Link>
          <Link className={styles.primary} href={`/analysis?product_id=${encodeURIComponent(product.id)}`}
            aria-label={`${t.featured.startAnalysis}: ${text.name}`}>
            {t.featured.startAnalysis} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </>
  )
}

// Re-exported so other client components share one localized-field resolver.
export { localizedText }
