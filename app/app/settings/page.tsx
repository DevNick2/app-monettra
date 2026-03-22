"use client"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

// ─── Componente de Importação OFX ─────────────────────────────
function OFXImportSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(file: File | null) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".ofx")) {
      toast.error("Formato inválido. Por favor, selecione um arquivo .OFX.")
      return
    }
    setSelectedFile(file)
    setUploadStatus("idle")
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
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      await api.post("/transactions/import/ofx", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setUploadStatus("success")
      toast.success("Transações importadas com sucesso!")
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      setUploadStatus("error")
      toast.error("Erro ao importar o arquivo. Verifique se o arquivo OFX é válido.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleClearFile() {
    setSelectedFile(null)
    setUploadStatus("idle")
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
          Importe extratos bancários no formato OFX para registrar transações em massa automaticamente.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Área de drop */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx"
            className="hidden"
            onChange={handleInputChange}
          />

          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              isDragging ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            )}
          >
            <Upload className="h-6 w-6" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {isDragging ? "Solte o arquivo aqui" : "Arraste e solte seu arquivo OFX"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou clique para selecionar — apenas arquivos <span className="font-mono font-bold">.ofx</span>
            </p>
          </div>
        </div>

        {/* Arquivo selecionado */}
        {selectedFile && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
              uploadStatus === "success"
                ? "border-success/40 bg-success/10"
                : uploadStatus === "error"
                ? "border-destructive/40 bg-destructive/10"
                : "border-border bg-secondary/30"
            )}
          >
            {uploadStatus === "success" ? (
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
            ) : uploadStatus === "error" ? (
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            ) : (
              <FileText className="h-5 w-5 text-primary shrink-0" />
            )}

            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearFile() }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              Remover
            </button>
          </div>
        )}

        {/* Botão de upload */}
        <Button
          className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando transações...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar Arquivo OFX
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          O arquivo será processado e as transações serão criadas automaticamente.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Página Principal de Configurações ────────────────────────
export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Configurações</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OFXImportSection />
      </div>
    </div>
  )
}
