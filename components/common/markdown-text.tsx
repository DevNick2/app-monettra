import { Fragment } from "react"
import { cn } from "@/lib/utils"

/**
 * Renderiza um subconjunto de Markdown utilizado pelo assistente de IA (chat).
 * Suporta: headings (##, ###), negrito (**), itálico (*), listas (-), código inline (`).
 * Não requer dependências externas — apenas React + Tailwind.
 */

interface MarkdownTextProps {
  content: string
  className?: string
}

export function MarkdownText({ content, className }: MarkdownTextProps) {
  const lines = content.split("\n")

  return (
    <div className={cn("space-y-1.5", className)}>
      {lines.map((line, i) => (
        <MarkdownLine key={i} line={line} />
      ))}
    </div>
  )
}

function MarkdownLine({ line }: { line: string }) {
  const trimmed = line.trimStart()

  if (trimmed === "") return <div className="h-1" />

  if (trimmed.startsWith("### ")) {
    return (
      <p className="font-heading text-xs font-semibold text-foreground mt-2 mb-0.5">
        <InlineMarkdown text={trimmed.slice(4)} />
      </p>
    )
  }

  if (trimmed.startsWith("## ")) {
    return (
      <p className="font-heading text-sm font-semibold text-foreground mt-2 mb-0.5">
        <InlineMarkdown text={trimmed.slice(3)} />
      </p>
    )
  }

  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return (
      <div className="flex items-start gap-1.5">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
        <p className="text-sm leading-relaxed">
          <InlineMarkdown text={trimmed.slice(2)} />
        </p>
      </div>
    )
  }

  const orderedMatch = trimmed.match(/^(\d+)\.\s(.+)/)
  if (orderedMatch) {
    return (
      <div className="flex items-start gap-1.5">
        <span className="shrink-0 text-xs font-semibold text-primary/80 mt-0.5 min-w-[1rem]">
          {orderedMatch[1]}.
        </span>
        <p className="text-sm leading-relaxed">
          <InlineMarkdown text={orderedMatch[2]} />
        </p>
      </div>
    )
  }

  if (trimmed === "---") {
    return <hr className="border-border/50 my-1" />
  }

  return (
    <p className="text-sm leading-relaxed">
      <InlineMarkdown text={line} />
    </p>
  )
}

/**
 * Processa inline tokens: **bold**, *italic*, `code`.
 * Usa divisão por regex para preservar a ordem e evitar aninhamento problemático.
 */
function InlineMarkdown({ text }: { text: string }) {
  const parts = splitInlineTokens(text)
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "bold") return <strong key={i} className="font-semibold">{part.value}</strong>
        if (part.type === "italic") return <em key={i} className="italic">{part.value}</em>
        if (part.type === "code") return (
          <code key={i} className="rounded bg-secondary/80 px-1 py-0.5 text-xs font-mono">
            {part.value}
          </code>
        )
        return <Fragment key={i}>{part.value}</Fragment>
      })}
    </>
  )
}

type Token = { type: "text" | "bold" | "italic" | "code"; value: string }

function splitInlineTokens(text: string): Token[] {
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g
  const tokens: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) })
    }
    if (match[2] !== undefined) tokens.push({ type: "bold", value: match[2] })
    else if (match[3] !== undefined) tokens.push({ type: "italic", value: match[3] })
    else if (match[4] !== undefined) tokens.push({ type: "code", value: match[4] })
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) })
  }

  return tokens
}
