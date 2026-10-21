"use client"

import { useState } from "react"

import { useLocale } from "@/lib/i18n/LocaleProvider"

import { isUsableImageSource } from "./image-source"
import { ProductImage } from "./ProductImage"
import styles from "./products.module.css"

export function ProductGallery({ images, name }: {
  images: string[]
  name: string
}) {
  const { t } = useLocale()
  const [active, setActive] = useState(0)
  // Clamp so a shorter images array can never index out of range.
  const current = active < images.length ? active : 0

  return (
    <div className={styles.gallery}>
      {images.length > 0
        ? <ProductImage src={images[current]} name={name} index={current} />
        : <ProductImage name={name} />}
      {images.length > 1 && (
        <div className={styles.thumbnails} role="group" aria-label={t.images.galleryLabel.replace("{name}", name)}>
          {images.map((src, index) => (
            <button
              key={`${index}-${src}`}
              type="button"
              className={styles.thumbnail}
              aria-pressed={index === current}
              aria-label={t.images.showImage
                .replace("{index}", String(index + 1))
                .replace("{total}", String(images.length))}
              onClick={() => setActive(index)}
            >
              {isUsableImageSource(src) ? (
                // Decorative duplicate of the primary image; the button carries the name.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" loading="lazy" decoding="async" />
              ) : (
                <span aria-hidden="true" className={styles.thumbnailMark}>◇</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
