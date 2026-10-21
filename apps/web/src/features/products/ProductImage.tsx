"use client"

import { useState } from "react"

import { useLocale } from "@/lib/i18n/LocaleProvider"

import { isUsableImageSource } from "./image-source"
import styles from "./products.module.css"

export function ProductImage({ src, name, index = 0 }: {
  src?: string
  name: string
  index?: number
}) {
  const { t } = useLocale()
  const [failedSource, setFailedSource] = useState<string>()
  const usable = isUsableImageSource(src) && failedSource !== src
  const alt = t.images.productAlt.replace("{name}", name).replace("{index}", String(index + 1))

  return (
    <div className={styles.image}>
      {usable ? (
        // Catalog-owned local and remote sources need no global Next.js image configuration.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={(image) => {
            // A cached image failure can happen before React attaches onError.
            if (image?.complete && image.naturalWidth === 0) setFailedSource(src)
          }}
          src={src}
          alt={alt}
          loading={index === 0 ? "eager" : "lazy"}
          onError={() => setFailedSource(src)}
        />
      ) : (
        <span className={styles.imagePlaceholder}>
          <span aria-hidden="true" className={styles.imageMark}>◇</span>
          {t.images.unavailable}
        </span>
      )}
    </div>
  )
}
