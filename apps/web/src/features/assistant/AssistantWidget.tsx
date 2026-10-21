"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { createAssistantRequest, replyToAssistant } from "@/api/assistant"
import type { AssistantSuggestedAction } from "@/api/assistant"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import type { AssistantProduct } from "./AssistantProvider"
import { assistantActionHref } from "./navigation"
import styles from "./assistant.module.css"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  suggestedAction?: AssistantSuggestedAction
}

export function AssistantWidget({ product, conversationKey }: {
  product: AssistantProduct | null
  conversationKey: string
}) {
  const { locale, t } = useLocale()
  const [open, setOpen] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  function close() {
    setOpen(false)
    launcher.current?.focus({ preventScroll: true })
  }

  return (
    <aside lang={locale} aria-label={t.assistant.label} className={styles.widget}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation()
          close()
        }
      }}>
      <section id="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title"
        aria-describedby="assistant-scope" hidden={!open} className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.assistant.eyebrow}</p>
            <h2 id="assistant-title">{t.assistant.title}</h2>
            <p className={styles.subtitle}>{t.assistant.subtitle}</p>
          </div>
          <button type="button" className={styles.close} onClick={close} aria-label={t.assistant.close}>×</button>
        </header>
        <p id="assistant-scope" className={styles.scope}>{t.assistant.scope}</p>
        {product && <p className={styles.context}>{t.assistant.contextProduct} · {product.name}</p>}
        <Conversation key={conversationKey} product={product} open={open} onNavigate={close} />
      </section>
      <button ref={launcher} className={styles.launcher} type="button"
        aria-label={open ? t.assistant.collapse : t.assistant.expand}
        aria-expanded={open} aria-controls="assistant-panel"
        onClick={() => open ? close() : setOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>AI</span>
      </button>
    </aside>
  )
}

function Conversation({ product, open, onNavigate }: {
  product: AssistantProduct | null
  open: boolean
  onNavigate: () => void
}) {
  const { t } = useLocale()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [failedMessage, setFailedMessage] = useState<string | null>(null)
  const inFlight = useRef(false)
  const mounted = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])
  useEffect(() => {
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, sending, failedMessage, open])

  async function submit(value: string, retry = false) {
    const message = value.trim()
    if (!message || inFlight.current) return
    inFlight.current = true
    setSending(true)
    setFailedMessage(null)
    if (!retry) {
      setMessages((previous) => [...previous, { role: "user", content: message }])
      setInput("")
    }
    try {
      const reply = await replyToAssistant(createAssistantRequest(message, product?.id))
      if (!mounted.current) return
      setMessages((previous) => [...previous, {
        role: "assistant", content: reply.message,
        suggestedAction: reply.suggested_action ?? undefined,
      }])
    } catch {
      if (mounted.current) setFailedMessage(message)
    } finally {
      inFlight.current = false
      if (mounted.current) setSending(false)
    }
  }

  const prompts = product ? t.assistant.promptsProduct : t.assistant.promptsGeneric

  return (
    <>
      <div ref={logRef} className={styles.conversation}>
        {messages.length === 0 && <div className={styles.empty}>
          <span className={styles.welcomeMark} aria-hidden="true">桂</span>
          <h3>{t.assistant.welcomeTitle}</h3>
          <p>{product ? t.assistant.welcomeProduct : t.assistant.welcomeGeneric}</p>
          <div className={styles.prompts}>
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => void submit(prompt)} disabled={sending}>
                {prompt}<span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>}
        <div role="log" aria-label={t.assistant.conversationLabel} aria-live="polite" aria-relevant="additions"
          className={styles.messages}>
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? styles.userMessage : styles.assistantMessage}>
              <span className={styles.role}>
                {message.role === "user" ? t.assistant.you : t.assistant.title}
              </span>
              <p>{message.content}</p>
              {message.suggestedAction && (
                <Link className={styles.action} href={assistantActionHref(message.suggestedAction)} onClick={onNavigate}>
                  {message.suggestedAction.type === "view_product"
                    ? t.assistant.viewProduct : t.assistant.startAnalysis}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          ))}
        </div>
        {sending && <p role="status" className={styles.thinking}>{t.assistant.thinking}</p>}
        {failedMessage && <div role="alert" className={styles.error}>
          <p>{t.errors.assistant}</p>
          <button type="button" onClick={() => void submit(failedMessage, true)} className={styles.retry}>
            {t.assistant.retry}
          </button>
        </div>}
      </div>
      <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); void submit(input) }}>
        <label htmlFor="assistant-input">{t.assistant.composerLabel}</label>
        <div className={styles.inputRow}>
          <input ref={inputRef} id="assistant-input" value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.assistant.composerPlaceholder} autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault()
            }} />
          <button className={styles.send} type="submit" disabled={sending || !input.trim()}>
            {t.assistant.send}
          </button>
        </div>
      </form>
    </>
  )
}
