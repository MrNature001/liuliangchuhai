"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import {
  analyzeProduct,
  listProducts,
  SelectionApiError,
  type ProductAnalysisRequest,
  type ProductAnalysisResponse,
  type ProductListResponse,
} from "@/api/selection"
import { useProductText } from "@/lib/i18n/use-product-text"
import { useLocale } from "@/lib/i18n/LocaleProvider"

import ContentPlanSection from "./ContentPlanSection"
import { CopyButton } from "./CopyButton"
import { resolveProductSelection } from "./product-selection"
import styles from "./analysis.module.css"

type CatalogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: ProductListResponse["items"] }

type AnalysisState =
  | { status: "idle" | "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; result: ProductAnalysisResponse; request: ProductAnalysisRequest }

// Market names stay in English so the backend prompt and stored analysis are stable.
const marketPresets = ["Vietnam", "Thailand", "Malaysia", "Indonesia"] as const

function AnalysisReport({ result }: { result: ProductAnalysisResponse }) {
  const { t } = useLocale()
  const sections = [
    [t.analysis.targetAudiences, result.target_audiences],
    [t.analysis.strengths, result.strengths],
    [t.analysis.risks, result.risks],
    [t.analysis.culturalAdvantages, result.cultural_advantages],
    [t.analysis.marketingSuggestions, result.marketing_suggestions],
    [t.analysis.contentDirections, result.content_directions],
  ] as const

  return (
    <>
      <p className={styles.recommendation}>{t.analysis.recommendations[result.recommendation]}</p>
      <p className={styles.score}>{t.analysis.heuristic}: {result.score} / 100</p>
      <p className={styles.muted}>{t.analysis.heuristicNote}</p>
      <div className={styles.sectionHeading}>
        <h3>{t.analysis.summary}</h3>
        <CopyButton text={result.summary} />
      </div>
      <p>{result.summary}</p>
      <div className={styles.sections}>
        {sections.map(([title, items]) => (
          <section key={title}>
            <h3>{title}</h3>
            {items.length ? (
              <ul>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
            ) : <p className={styles.muted}>{t.analysis.noneProvided}</p>}
          </section>
        ))}
      </div>
    </>
  )
}

function ProductOptions({ products }: { products: ProductListResponse["items"] }) {
  return products.map((product) => <ProductOption key={product.id} product={product} />)
}

function ProductOption({ product }: { product: ProductListResponse["items"][number] }) {
  const text = useProductText(product)
  return <option value={product.id}>{text?.name ?? product.name}</option>
}

export default function AnalysisWorkbench({ initialProductId = "" }: { initialProductId?: string }) {
  const { t } = useLocale()
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" })
  const [catalogAttempt, setCatalogAttempt] = useState(0)
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" })
  // null means untouched; an explicit empty selection must override preselection.
  const [selectedProductId, setProductId] = useState<string | null>(null)
  const [country, setCountry] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [marketNotes, setMarketNotes] = useState("")
  const inFlight = useRef(false)

  useEffect(() => {
    let active = true
    listProducts().then(
      (response) => {
        if (active) setCatalog({ status: "ready", products: response.items })
      },
      () => {
        if (active) setCatalog({ status: "error", message: t.errors.catalog })
      },
    )
    return () => { active = false }
    // `t` is intentionally excluded: a language switch must not refetch the catalog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogAttempt])

  const products = catalog.status === "ready" ? catalog.products : []
  const productId = resolveProductSelection(products, initialProductId, selectedProductId)
  const catalogReady = catalog.status === "ready" && products.length > 0
  const submitting = analysis.status === "submitting"
  const canSubmit = catalogReady && Boolean(productId.trim() && country.trim()) && !submitting

  function retryCatalog() {
    setCatalog({ status: "loading" })
    setAnalysis({ status: "idle" })
    setCatalogAttempt((attempt) => attempt + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return

    const request: ProductAnalysisRequest = {
      product_id: productId.trim(),
      country: country.trim(),
      target_audience: targetAudience.trim() || null,
      market_notes: marketNotes.trim() || null,
    }
    if (!catalogReady || !request.product_id || !request.country) {
      setAnalysis({ status: "error", message: t.analysis.checkInputs })
      return
    }

    inFlight.current = true
    setAnalysis({ status: "submitting" })
    try {
      const result = await analyzeProduct(request)
      setAnalysis({ status: "success", result, request })
    } catch (error) {
      setAnalysis({
        status: "error",
        message: error instanceof SelectionApiError ? error.message : t.errors.analysis,
      })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{t.analysis.eyebrow}</p>
        <h1>{t.analysis.title}</h1>
        <p>{t.analysis.intro}</p>
      </header>
      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="analysis-form-title">
          <h2 id="analysis-form-title">{t.analysis.formTitle}</h2>
          <p className={styles.muted}>{t.analysis.formHint}</p>
          {catalog.status === "loading" && <p className={styles.status} role="status">{t.analysis.loadingProducts}</p>}
          {catalog.status === "error" && (
            <div>
              <p className={styles.error} role="alert">{catalog.message}</p>
              <button className={styles.secondaryButton} onClick={retryCatalog}>{t.analysis.retryCatalog}</button>
            </div>
          )}
          {catalog.status === "ready" && !products.length && (
            <div>
              <p className={styles.status} role="status">{t.analysis.noProducts}</p>
              <button className={styles.secondaryButton} onClick={retryCatalog}>{t.analysis.reloadCatalog}</button>
            </div>
          )}
          <form
            onSubmit={submit}
            onChange={() => { if (!inFlight.current) setAnalysis({ status: "idle" }) }}
            noValidate
          >
            <fieldset className={styles.fields} disabled={!catalogReady || submitting}>
              <label htmlFor="analysis-product">{t.analysis.product}</label>
              <select id="analysis-product" value={productId} onChange={(e) => setProductId(e.target.value)} required>
                <option value="">{t.analysis.selectProduct}</option>
                <ProductOptions products={products} />
              </select>
              <label htmlFor="analysis-country">{t.analysis.country}</label>
              <input id="analysis-country" value={country} onChange={(e) => setCountry(e.target.value)} required />
              <div className={styles.presets} role="group" aria-label={t.analysis.presetsLabel}>
                {marketPresets.map((preset) => (
                  <button
                    key={preset}
                    className={styles.presetButton}
                    type="button"
                    aria-pressed={country.trim() === preset}
                    onClick={() => {
                      setCountry(preset)
                      // A button click raises no change event, so mirror the form reset.
                      if (!inFlight.current) setAnalysis({ status: "idle" })
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <label htmlFor="analysis-audience">
                {t.analysis.audience} <span>({t.analysis.optional})</span>
              </label>
              <input id="analysis-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
              <label htmlFor="analysis-notes">
                {t.analysis.notes} <span>({t.analysis.optional})</span>
              </label>
              <textarea id="analysis-notes" rows={4} value={marketNotes} onChange={(e) => setMarketNotes(e.target.value)} />
              <button className={styles.submitButton} type="submit" disabled={!canSubmit}>
                {submitting ? t.analysis.analyzing : t.analysis.analyze}
              </button>
            </fieldset>
          </form>
          <p className={styles.status} role="status" aria-live="polite">
            {submitting
              ? t.analysis.statusAnalyzing
              : analysis.status === "success" ? t.analysis.statusComplete : ""}
          </p>
          {analysis.status === "error" && <p className={styles.error} role="alert">{analysis.message}</p>}
        </section>
        <section className={`${styles.panel} ${styles.report}`} aria-labelledby="analysis-result-title" aria-busy={submitting}>
          <h2 id="analysis-result-title">{t.analysis.reportTitle}</h2>
          {analysis.status === "success" ? (
            <>
              <AnalysisReport result={analysis.result} />
              <ContentPlanSection request={{ ...analysis.request, analysis: analysis.result }} />
            </>
          ) : (
            <p className={styles.muted}>
              {submitting ? t.analysis.reportPreparing : t.analysis.reportIdle}
            </p>
          )}
        </section>
      </div>
    </>
  )
}
