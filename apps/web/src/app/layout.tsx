import type { Metadata } from "next"
import { AssistantProvider } from "@/features/assistant/AssistantProvider"
import { Shell } from "@/lib/i18n/Shell"
import { LocaleProvider } from "@/lib/i18n/LocaleProvider"

import "./styles.css"

export const metadata: Metadata = {
  title: "liuliangchuhai",
  description:
    "AI-assisted market analysis and content planning for Guangxi products entering ASEAN markets.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh">
      <body>
        <LocaleProvider>
          <AssistantProvider>
            <Shell>{children}</Shell>
          </AssistantProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
