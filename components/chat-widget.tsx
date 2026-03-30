"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileUp,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { ChatMessage, ChatUIBlock } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/use-chat-store"

export function ChatWidget() {
  const {
    messages,
    isStreaming,
    isOpen,
    toggleOpen,
    sendMessage,
    sendMessageWithFile,
    clearChat,
    importStatus,
    fetchImportStatus,
  } = useChatStore()

  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
      fetchImportStatus()
    }
  }, [isOpen, fetchImportStatus])

  useEffect(() => {
    if (
      importStatus &&
      (importStatus.status === "pending" || importStatus.status === "processing")
    ) {
      const interval = setInterval(() => {
        fetchImportStatus()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [importStatus, fetchImportStatus])

  async function handleSend() {
    if ((!input.trim() && !selectedFile) || isStreaming) return

    const message = input
    const file = selectedFile

    setInput("")
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    if (file) {
      await sendMessageWithFile(message, file)
      return
    }

    await sendMessage(message)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const importInProgress =
    importStatus?.status === "pending" || importStatus?.status === "processing"

  return (
    <>
      <button
        onClick={toggleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "cursor-pointer shadow-lg transition-all duration-300",
          "hover:scale-110 hover:shadow-xl active:scale-95",
          isOpen
            ? "rotate-90 bg-foreground text-background"
            : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Fechar chat" : "Abrir assistente IA"}
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-pulse text-amber-300" />
          </div>
        )}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex max-h-[650px] w-[400px] flex-col overflow-hidden rounded-2xl",
          "border border-border bg-card shadow-2xl transition-all duration-300",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        )}
      >
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold leading-tight text-foreground">
                  Escriba Real
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Conselheiro financeiro do teu império
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Limpar conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={toggleOpen}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="border border-border/70 bg-secondary/60">
              {isStreaming ? "Ativo" : "Pronto"}
            </Badge>
            {importInProgress && (
              <Badge className="border border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Importação {importStatus?.source === "chat" ? "via chat" : "em andamento"}
              </Badge>
            )}
          </div>
        </div>

        {importStatus && (
          <div className="border-b border-border/70 bg-secondary/20 px-4 py-2">
            <div className="flex items-start gap-2">
              {importStatus.status === "completed" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : importStatus.status === "error" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  {importStatus.status === "completed"
                    ? "Importação concluída"
                    : importStatus.status === "error"
                      ? "Importação com erro"
                      : "Importação em andamento"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Origem: {translateImportSource(importStatus.source)} • {importStatus.filename}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="scrollbar-thin min-h-[320px] max-h-[430px] flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  O Escriba Real está à disposição.
                </p>
                <p className="mt-1 max-w-[280px] text-xs text-muted-foreground">
                  Consulta teus registros, resume teu mês e executa ações assistidas
                  com base nos teus dados reais.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {[
                  "Resuma meu mês atual",
                  "Liste minhas assinaturas",
                  "Crie uma categoria de Mercado",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className={cn(
                      "cursor-pointer rounded-full border border-border px-3 py-1.5 text-[11px]",
                      "text-muted-foreground transition-all hover:border-primary/30",
                      "hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageBubble
              key={message.id ?? `${message.role}-${message.timestamp}`}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-card px-3 py-3">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2">
              <FileUp className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-destructive"
              >
                Remover
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ofx,.png,.jpg,.jpeg,.gif,.webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={isStreaming}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border",
                "cursor-pointer bg-secondary/40 text-muted-foreground transition-colors",
                "hover:bg-secondary hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
              title="Anexar arquivo"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva tua solicitação..."
              disabled={isStreaming}
              rows={1}
              className={cn(
                "scrollbar-thin max-h-[80px] flex-1 resize-none rounded-xl border border-border bg-secondary/30 px-3 py-2.5",
                "text-sm text-foreground placeholder:text-muted-foreground transition-all",
                "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30",
                "disabled:opacity-50"
              )}
              style={{ minHeight: "40px" }}
              onInput={(event) => {
                const target = event.target as HTMLTextAreaElement
                target.style.height = "auto"
                target.style.height = `${Math.min(target.scrollHeight, 80)}px`
              }}
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!input.trim() && !selectedFile) || isStreaming}
              className={cn(
                "h-10 w-10 shrink-0 cursor-pointer rounded-xl bg-primary text-primary-foreground",
                "transition-all hover:bg-primary/90 disabled:opacity-40"
              )}
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Respostas podem usar teus dados reais e blocos visuais no chat.
            </p>
            {importInProgress && (
              <span className="text-[10px] text-primary">
                Importação em acompanhamento
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.kind === "system") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2">
        <Clock3 className="h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{message.content}</p>
          {message.tool_name && (
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {message.tool_name}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (message.kind === "ui" && message.ui_block) {
    return <ChatUiBlock block={message.ui_block} />
  }

  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          message.role === "user"
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/50 bg-secondary/60 text-foreground"
        )}
      >
        {message.role === "assistant" && !message.content ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}
      </div>
    </div>
  )
}

function ChatUiBlock({ block }: { block: ChatUIBlock }) {
  if (block.type === "financial-summary") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <p className="font-heading text-sm font-semibold text-foreground">{block.title}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="Entradas" value={block.summary.income} positive />
          <MetricCard label="Saídas" value={block.summary.expense} negative />
          <MetricCard label="Saldo" value={block.summary.balance} />
        </div>
        {block.summary.top_categories.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              {block.summary.top_categories.slice(0, 3).map((category) => (
                <div key={category.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className="font-medium text-foreground">{category.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (block.type === "transactions-list") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-foreground">{block.title}</p>
          <Badge variant="secondary">{block.count}</Badge>
        </div>
        <div className="space-y-2">
          {block.items.slice(0, 4).map((item) => (
            <div
              key={item.code}
              className="rounded-xl border border-border/70 bg-secondary/20 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.category?.title ?? "Sem categoria"} • {item.due_date}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    item.type === "income" ? "text-success" : "text-destructive"
                  )}
                >
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (block.type === "categories-list") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-foreground">{block.title}</p>
          <Badge variant="secondary">{block.count}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {block.items.slice(0, 8).map((item) => (
            <span
              key={item.code}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-[11px] text-foreground"
            >
              {item.title}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (block.type === "subscriptions-list") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-foreground">{block.title}</p>
          <Badge variant="secondary">{block.count}</Badge>
        </div>
        <div className="space-y-2">
          {block.items.slice(0, 4).map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/20 px-3 py-2"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">{item.provider}</p>
                <p className="text-[10px] text-muted-foreground">{item.recurrence}</p>
              </div>
              <span className="text-xs font-semibold text-foreground">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border border-success/30 bg-success/10 p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">{block.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{block.description}</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold",
          positive && "text-success",
          negative && "text-destructive",
          !positive && !negative && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function translateImportSource(source: string) {
  switch (source) {
    case "chat":
      return "Chat"
    case "whatsapp":
      return "WhatsApp"
    case "settings":
      return "Configurações"
    default:
      return source
  }
}
