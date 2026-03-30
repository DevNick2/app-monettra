"use client"

import { useState, useRef, useEffect } from "react"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/use-chat-store"

// ─── Componente de Importação OFX ─────────────────────────────
function OFXImportSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { importOfx, importStatus, isImporting, fetchImportStatus } =
    useChatStore()

  // Polling de status enquanto processando
  useEffect(() => {
    fetchImportStatus()
  }, [fetchImportStatus])

  useEffect(() => {
    if (
      importStatus &&
      (importStatus.status === "pending" ||
        importStatus.status === "processing")
    ) {
      const interval = setInterval(() => {
        fetchImportStatus()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [importStatus, fetchImportStatus])

  const isProcessing =
    isImporting ||
    importStatus?.status === "pending" ||
    importStatus?.status === "processing"

  function handleFileSelect(file: File | null) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".ofx")) {
      toast.error("Formato inválido. Por favor, selecione um arquivo .OFX.")
      return
    }
    setSelectedFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelect(e.target.files?.[0] ?? null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files?.[0] ?? null)
  }

  async function handleUpload() {
    if (!selectedFile || isProcessing) return

    try {
      await importOfx(selectedFile)
      toast.success(
        "Importação iniciada! Você será notificado ao término do processamento."
      )
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      toast.error(
        "Erro ao iniciar importação. Verifique se o arquivo OFX é válido."
      )
    }
  }

  function handleClearFile() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Importar Transações via OFX
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Importe extratos bancários no formato OFX. A IA classificará as
          transações automaticamente em segundo plano.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Status de importação em andamento */}
        {importStatus &&
          importStatus.status !== "completed" &&
          importStatus.status !== "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Processando: {importStatus.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {importStatus.status === "pending"
                    ? `Aguardando início do processamento... Origem: ${translateImportSource(importStatus.source)}`
                    : `Classificando transações... (${importStatus.processed_transactions ?? 0}/${importStatus.total_transactions ?? "?"}) • Origem: ${translateImportSource(importStatus.source)}`}
                </p>
              </div>
              <RefreshCw
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors animate-spin"
                onClick={fetchImportStatus}
              />
            </div>
          )}

        {/* Status concluído */}
        {importStatus && importStatus.status === "completed" && (
          <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3">
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Importação concluída!
              </p>
              <p className="text-xs text-muted-foreground">
                {importStatus.processed_transactions ?? 0} transações
                classificadas e importadas de {importStatus.filename}. Origem:{" "}
                {translateImportSource(importStatus.source)}.
              </p>
            </div>
          </div>
        )}

        {/* Status com erro */}
        {importStatus && importStatus.status === "error" && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Erro na importação
              </p>
              <p className="text-xs text-muted-foreground">
                {importStatus.error_message ??
                  "Erro desconhecido ao processar o arquivo."}{" "}
                Origem: {translateImportSource(importStatus.source)}.
              </p>
            </div>
          </div>
        )}

        {/* Área de drop */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
            isProcessing && "opacity-50 pointer-events-none",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx"
            className="hidden"
            onChange={handleInputChange}
            disabled={isProcessing}
          />

          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              isDragging
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Upload className="h-6 w-6" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {isDragging
                ? "Solte o arquivo aqui"
                : "Arraste e solte seu arquivo OFX"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou clique para selecionar — apenas arquivos{" "}
              <span className="font-mono font-bold">.ofx</span>
            </p>
          </div>
        </div>

        {/* Arquivo selecionado */}
        {selectedFile && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-semibold text-foreground truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClearFile()
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Remover
            </button>
          </div>
        )}

        {/* Botão de upload */}
        <Button
          className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors"
          disabled={!selectedFile || isProcessing}
          onClick={handleUpload}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando em segundo plano...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar Arquivo OFX
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          O arquivo será processado em segundo plano. A IA classificará cada
          transação com base nas suas categorias existentes.
        </p>
      </CardContent>
    </Card>
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

// ─── Página Principal de Configurações ────────────────────────
export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Configurações
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OFXImportSection />
      </div>
    </div>
  )
}
