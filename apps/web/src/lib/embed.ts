/**
 * Embed contract, kept free of React so it can be unit tested and reused by both
 * the embeddable page and the snippet generator.
 *
 * The embed is a plain iframe: the host page only needs a URL. Because the page
 * is cross-origin there, sizing cannot be measured by the parent, so the embed
 * reports its own height with `postMessage` and the snippet listens for it.
 */

export const EMBED_HEIGHT_MESSAGE = "liuliangchuhai:height"

/** Longest product id the catalog can legitimately hold; longer input is junk. */
const MAX_PRODUCT_ID_LENGTH = 120

export type EmbedParams = {
  /** Preselected catalog product, or "" when the visitor should choose. */
  productId: string
  /** Requested interface language, or null when the embed should use its own default. */
  locale: string | null
}

/**
 * Read the two supported query parameters.
 *
 * Unknown parameters are ignored rather than rejected: an embed URL may carry
 * tracking parameters added by the host site, and failing the whole page over
 * those would be hostile.
 */
export function readEmbedParams(search: string): EmbedParams {
  const params = new URLSearchParams(search)
  const productId = (params.get("product_id") ?? "").trim().slice(0, MAX_PRODUCT_ID_LENGTH)
  const locale = (params.get("lang") ?? "").trim().toLowerCase() || null
  return { productId, locale }
}

export type EmbedSnippetOptions = {
  /** Absolute site origin, e.g. `https://example.com`. */
  origin: string
  productId?: string
  locale?: string | null
  width?: number | string
  height?: number
  title?: string
}

/**
 * Build the copy-paste HTML a host site inserts.
 *
 * The listener is scoped to the iframe that sent the message so two embeds on
 * one page cannot resize each other.
 */
export function buildEmbedSnippet(options: EmbedSnippetOptions): string {
  const origin = options.origin.replace(/\/+$/, "")
  const query = new URLSearchParams()
  if (options.productId) query.set("product_id", options.productId)
  if (options.locale) query.set("lang", options.locale)
  const suffix = query.toString() ? `?${query.toString()}` : ""
  const src = `${origin}/embed${suffix}`
  const width = options.width ?? "100%"
  const height = options.height ?? 900
  const title = options.title ?? "liuliangchuhai"

  return `<iframe
  src="${src}"
  width="${width}"
  height="${height}"
  style="border:0;width:100%;max-width:100%"
  title="${title}"
  loading="lazy"
  allow="fullscreen"
></iframe>
<script>
  addEventListener("message", function (event) {
    var data = event.data
    if (!data || data.type !== "${EMBED_HEIGHT_MESSAGE}") return
    var frames = document.querySelectorAll('iframe[src*="/embed"]')
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === event.source) {
        frames[i].style.height = data.height + "px"
      }
    }
  })
</script>`
}

/** Payload the embed posts to its host. Kept tiny and versionless by design. */
export function heightMessage(height: number): { type: string; height: number } {
  return { type: EMBED_HEIGHT_MESSAGE, height: Math.max(320, Math.round(height)) }
}
