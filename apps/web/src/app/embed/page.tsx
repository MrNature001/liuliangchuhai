import type { Metadata } from "next"

import { EmbedHeightReporter } from "@/features/selection/EmbedSnippet"
import AnalysisWorkbench from "@/features/selection/AnalysisWorkbench"
import { readEmbedParams } from "@/lib/embed"

// The embed reads its query string per request; it must never be statically cached.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "liuliangchuhai · 嵌入演示",
  description: "Embeddable market-analysis demo for Guangxi products entering ASEAN markets.",
  // An embeddable page is meant to be framed by the host site, so it must not
  // ship a frame-blocking policy of its own.
  robots: { index: false, follow: false },
}

/**
 * Chrome-free variant of the analysis page, sized for an iframe.
 *
 * The root layout still renders the translated header and footer, which is
 * deliberate: a host site gets the demo's own navigation and language switch,
 * and the visitor is never stranded inside a bare form.
 */
export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ product_id?: string | string[]; lang?: string | string[] }>
}) {
  const params = await searchParams
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value
    if (typeof first === "string") search.set(key, first)
  }
  const { productId } = readEmbedParams(search.toString())

  return (
    <>
      <EmbedHeightReporter />
      <AnalysisWorkbench initialProductId={productId} />
    </>
  )
}
