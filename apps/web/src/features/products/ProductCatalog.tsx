"use client"

import Link from "next/link"

import type { ProductListResponse } from "@/api/products"
import { useProductText } from "@/lib/i18n/use-product-text"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { ProductImage } from "./ProductImage"
import styles from "./products.module.css"

export function ProductCatalog({ products }: { products: ProductListResponse["items"] }) {
  const { t } = useLocale()

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t.catalog.eyebrow}</p>
        <h1>{t.catalog.title}</h1>
        <p className={styles.intro}>{t.catalog.intro}</p>
      </header>
      {products.length === 0 ? (
        <section className={styles.state} role="status">
          <h2>{t.catalog.emptyTitle}</h2>
          <p>{t.catalog.emptyBody}</p>
        </section>
      ) : (
        <>
          <p className={styles.count}>
            {products.length} {products.length === 1 ? t.catalog.countOne : t.catalog.countMany}
          </p>
          <ul className={styles.grid}>
            {products.map((product) => (
              <li key={product.id}>
                <CatalogCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

function CatalogCard({ product }: { product: ProductListResponse["items"][number] }) {
  const { t } = useLocale()
  const text = useProductText(product)
  if (!text) return null

  return (
    <Link href={`/products/${encodeURIComponent(product.id)}`} className={styles.card}>
      <ProductImage src={product.images[0]} name={text.name} />
      <div className={styles.cardBody}>
        <div className={styles.tags}>
          <span className={styles.category}>{text.category}</span>
          <span className={styles.tagOrigin}>{text.origin}</span>
        </div>
        <h2>{text.name}</h2>
        <p className={styles.description}>{text.description}</p>
        <div className={styles.cardFooter}>
          {product.price !== null && <span>{t.catalog.price}: {product.price}</span>}
          <span className={styles.view}>
            {t.catalog.viewProduct} <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
