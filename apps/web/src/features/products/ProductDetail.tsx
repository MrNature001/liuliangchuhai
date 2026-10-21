"use client"

import Link from "next/link"

import type { ProductResponse } from "@/api/products"
import { useProductText } from "@/lib/i18n/use-product-text"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { ProductGallery } from "./ProductGallery"
import styles from "./products.module.css"

export function ProductDetail({ product }: { product: ProductResponse }) {
  const { t } = useLocale()
  const text = useProductText(product)
  const purchaseUrl = product.purchase_url && /^https?:\/\//i.test(product.purchase_url)
    ? product.purchase_url
    : null

  if (!text) return null

  return (
    <main className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/products">{t.detail.breadcrumb}</Link>
      </nav>
      <article className={styles.detail}>
        <ProductGallery images={product.images} name={text.name} />
        <div className={styles.detailBody}>
          <header>
            <p className={styles.eyebrow}>{text.category}</p>
            <h1>{text.name}</h1>
            <p className={styles.origin}>{t.detail.origin} · {text.origin}</p>
            <p className={styles.fullDescription}>{text.description}</p>
            {product.price !== null && <p className={styles.price}>{t.detail.price}: {product.price}</p>}
            <p>
              <Link className={styles.button} href={{ pathname: "/analysis", query: { product_id: product.id } }}>
                {t.detail.analyze}
              </Link>
            </p>
            {purchaseUrl && (
              <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
                {t.detail.visitSeller} ↗{" "}
                <span className={styles.newTab}>{t.detail.newTab}</span>
              </a>
            )}
          </header>
          {text.culturalBackground && (
            <section className={styles.section}>
              <h2>{t.detail.culturalBackground}</h2>
              <p>{text.culturalBackground}</p>
            </section>
          )}
          {text.usage && (
            <section className={styles.section}>
              <h2>{t.detail.howToUse}</h2>
              <p>{text.usage}</p>
            </section>
          )}
          {text.ingredients.length > 0 && (
            <section className={styles.section}>
              <h2>{t.detail.ingredients}</h2>
              <ul className={styles.ingredients}>
                {text.ingredients.map((ingredient, index) => (
                  <li key={`${index}-${ingredient}`} className={styles.ingredient}>{ingredient}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </main>
  )
}
