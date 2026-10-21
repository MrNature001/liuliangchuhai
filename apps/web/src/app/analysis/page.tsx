import AnalysisWorkbench from "@/features/selection/AnalysisWorkbench"
import { AnalysisNavigation } from "@/features/selection/AnalysisNavigation"
import styles from "@/features/selection/analysis.module.css"

export default async function AnalysisPage({ searchParams }: {
  searchParams: Promise<{ product_id?: string | string[] }>
}) {
  const { product_id } = await searchParams
  const initialProductId = typeof product_id === "string" ? product_id : ""

  return (
    <main className={styles.page}>
      <AnalysisNavigation />
      <AnalysisWorkbench initialProductId={initialProductId} />
    </main>
  )
}
