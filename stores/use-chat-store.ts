"use client"

import { generateId } from "ai"
import { create } from "zustand"
import { api } from "@/lib/api"
import type {
  ChatMessage,
  ChatSseEvent,
  OfxImportStatus,
} from "@/lib/types"

function createMessageId() {
  return generateId()
}

interface ChatStore {
  // Chat State
  messages: ChatMessage[]
  isStreaming: boolean
  isOpen: boolean

  // OFX Import State
  importStatus: OfxImportStatus | null
  isImporting: boolean

  // Chat Actions
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  sendMessage: (message: string) => Promise<void>
  sendMessageWithFile: (message: string, file: File) => Promise<void>
  clearChat: () => Promise<void>

  // OFX Actions
  importOfx: (file: File) => Promise<void>
  fetchImportStatus: () => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  isOpen: false,
  importStatus: null,
  isImporting: false,

  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),

  sendMessage: async (message: string) => {
    if (!message.trim() || get().isStreaming) return

    const formData = new FormData()
    formData.append("message", message)

    await streamChat("/ia/chat", formData, message)
  },

  sendMessageWithFile: async (message: string, file: File) => {
    if ((!message.trim() && !file) || get().isStreaming) return

    const formData = new FormData()
    formData.append("message", message)
    formData.append("file", file)

    const userMessage = message.trim()
      ? `${message}\n\n[Anexo: ${file.name}]`
      : `[Anexo: ${file.name}]`

    await streamChat("/ia/chat/upload", formData, userMessage)
  },

  clearChat: async () => {
    try {
      await api.delete("/ia/chat")
    } catch {
      // Silencioso
    }
    set({ messages: [] })
  },

  importOfx: async (file: File) => {
    set({ isImporting: true })
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("source", "settings")

      const response = await api.post("/ia/ofx/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      set({ importStatus: response.data })
    } catch (error) {
      console.error("OFX import error:", error)
      throw error
    } finally {
      set({ isImporting: false })
    }
  },

  fetchImportStatus: async () => {
    try {
      const response = await api.get("/ia/ofx/status")
      set({ importStatus: response.data })
    } catch {
      // Sem importação anterior
    }
  },
}))

async function streamChat(
  path: string,
  formData: FormData,
  userFacingMessage: string
) {
  const token = localStorage.getItem("monettra_token")
  const assistantMessageId = createMessageId()

  const userMessage: ChatMessage = {
    id: createMessageId(),
    role: "user",
    content: userFacingMessage,
    kind: "text",
    timestamp: new Date().toISOString(),
  }

  const assistantMessage: ChatMessage = {
    id: assistantMessageId,
    role: "assistant",
    content: "",
    kind: "text",
    timestamp: new Date().toISOString(),
  }

  useChatStore.setState((s) => ({
    messages: [...s.messages, userMessage],
    isStreaming: true,
    isOpen: true,
  }))

  try {
    const response = await fetch(`http://localhost:3000${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error("No reader available")

    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split("\n\n")
      buffer = chunks.pop() ?? ""

      for (const chunk of chunks) {
        const line = chunk
          .split("\n")
          .find((entry) => entry.startsWith("data: "))
        if (!line) continue

        const data = line.slice(6).trim()
        if (!data || data === "[DONE]") continue

        try {
          const parsed = JSON.parse(data) as ChatSseEvent
          handleChatEvent(parsed, assistantMessageId)
        } catch {
          // Ignora payloads inválidos de SSE
        }
      }
    }
  } catch (error) {
    console.error("Chat stream error:", error)

    useChatStore.setState((s) => {
      const hasAssistantMessage = s.messages.some(
        (message) => message.id === assistantMessageId
      )
      const baseMessages = hasAssistantMessage
        ? s.messages
        : [...s.messages, assistantMessage]
      const messages = baseMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              content:
                "Desculpe, ocorreu um erro ao processar tua mensagem. Tente novamente.",
            }
          : message
      )
      return { messages }
    })
  } finally {
    useChatStore.setState({ isStreaming: false })
  }
}

function handleChatEvent(event: ChatSseEvent, assistantMessageId: string) {
  if (event.type === "token" && event.token) {
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      kind: "text",
      timestamp: new Date().toISOString(),
    }

    useChatStore.setState((s) => {
      const hasAssistantMessage = s.messages.some(
        (message) => message.id === assistantMessageId
      )
      const baseMessages = hasAssistantMessage
        ? s.messages
        : [...s.messages, assistantPlaceholder]

      const messages = baseMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              content: `${message.content}${event.token}`,
            }
          : message
      )
      return { messages }
    })
    return
  }

  if (event.type === "import_status" && event.import) {
    useChatStore.setState({ importStatus: event.import })
    return
  }

  if (event.type === "ui_block" && event.block) {
    const uiMessage: ChatMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "",
      kind: "ui",
      ui_block: event.block,
      tool_name: event.tool_name ?? null,
      timestamp: new Date().toISOString(),
    }

    useChatStore.setState((s) => ({
      messages: [...s.messages, uiMessage],
    }))
    return
  }

  if (
    (event.type === "status" || event.type === "tool_started" || event.type === "tool_finished") &&
    event.label
  ) {
    const systemMessage: ChatMessage = {
      id: createMessageId(),
      role: "assistant",
      content: event.label,
      kind: "system",
      tool_name: event.tool_name ?? null,
      status: event.status ?? event.type,
      timestamp: new Date().toISOString(),
    }

    useChatStore.setState((s) => ({
      messages: [...s.messages, systemMessage],
    }))
  }
}
