"use client"

import React, { useState, useEffect } from "react"
import { Loader2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface TransactionEntryData {
  title: string
  amount: string
  type: "income" | "expense"
  dueDate: string // DD/MM/YYYY or YYYY-MM-DD ? Wait, we used YYYY-MM-DD for input `type="date"`.
  categoryCode: string | null
  description: string
  isPaid?: boolean
  installments?: number
  editScope?: "this" | "this_and_future"
}

export interface TransactionEntryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  module: "transactions" | "planning"
  initialData?: Partial<TransactionEntryData>
  categories: { code: string; title: string }[]
  onSubmit: (data: TransactionEntryData) => Promise<void>
  isSaving: boolean
  groupCode?: string | null // For planning scope
}

export function TransactionEntryModal({
  isOpen,
  onOpenChange,
  mode,
  module,
  initialData,
  categories,
  onSubmit,
  isSaving,
  groupCode,
}: TransactionEntryModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [categoryCode, setCategoryCode] = useState<string>("")
  const [description, setDescription] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [installments, setInstallments] = useState(1)
  const [editScope, setEditScope] = useState<"this" | "this_and_future">("this")

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "")
        setDate(initialData.dueDate || new Date().toISOString().split("T")[0])
        setAmount(initialData.amount || "")
        setType(initialData.type || "expense")
        setCategoryCode(initialData.categoryCode || "none")
        setDescription(initialData.description || "")
        setIsPaid(initialData.isPaid ?? false)
        setInstallments(initialData.installments || 1)
        setEditScope(initialData.editScope || "this")
      } else {
        setTitle("")
        setDate(new Date().toISOString().split("T")[0])
        setAmount("")
        setType("expense")
        setCategoryCode("none")
        setDescription("")
        setIsPaid(false)
        setInstallments(1)
        setEditScope("this")
      }
    }
  }, [isOpen, initialData])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "")
    if (!onlyDigits) {
      setAmount("")
      return
    }
    const numericValue = parseInt(onlyDigits, 10) / 100
    setAmount(
      numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      title,
      amount,
      type,
      dueDate: date,
      categoryCode: categoryCode !== "none" ? categoryCode : null,
      description,
      isPaid,
      installments,
      editScope,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {mode === "create"
              ? module === "transactions"
                ? "Novo Lançamento"
                : "Criar Provisão (Fantasma)"
              : module === "transactions"
              ? "Editar Lançamento"
              : "Editar Provisão"}
          </DialogTitle>
          {module === "planning" && (
            <DialogDescription>
              Lance um valor que deseja planejar, e ele constará no Horizonte.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          {/* Tipo de transação */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo
            </Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/50 p-1">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "flex-1 cursor-pointer gap-2 transition-all",
                  type === "income"
                    ? "bg-success text-white hover:bg-success/90"
                    : "hover:bg-success/20 hover:text-success"
                )}
                onClick={() => setType("income")}
              >
                Entrada
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "flex-1 cursor-pointer gap-2 transition-all",
                  type === "expense"
                    ? "bg-destructive text-white hover:bg-destructive/90"
                    : "hover:bg-destructive/20 hover:text-destructive"
                )}
                onClick={() => setType("expense")}
              >
                Saída
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="value"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Valor (R$)
              </Label>
              <Input
                id="value"
                type="text"
                placeholder="0,00"
                className="text-lg font-bold"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {'Data ' + (module === 'transactions' ? 'da Transação' : 'de Vencimento')}
              </Label>
              <Input
                id="date"
                type="date"
                className="text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Título */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Título
            </Label>
            <Input
              id="title"
              placeholder="Ex: Compra Mensal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Categoria */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categoria
              </Label>
              <Select value={categoryCode} onValueChange={setCategoryCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Planning Installments */}
          {module === "planning" && mode === "create" && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantidade de Parcelas (Opcional)</Label>
              <Input 
                type="number" 
                min="1" 
                max="360" 
                value={installments} 
                onChange={(e) => setInstallments(parseInt(e.target.value) || 1)} 
              />
              {installments > 1 && (
                <span className="text-xs text-muted-foreground mt-1">
                  Serão criadas {installments} provisões de {amount ? `R$ ${amount}` : "valor base"}.
                </span>
              )}
            </div>
          )}

          {module === "planning" && mode === "edit" && groupCode && (
            <div className="flex flex-col gap-2 mt-2 border-t border-border pt-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aplicar alteração em</Label>
              <RadioGroup value={editScope} onValueChange={(v) => setEditScope(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="this" id="scope-this" />
                  <Label htmlFor="scope-this" className="font-normal cursor-pointer">Apenas nesta provisão</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="this_and_future" id="scope-this_and_future" />
                  <Label htmlFor="scope-this_and_future" className="font-normal cursor-pointer">Nesta e em todas as futuras do grupo</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Descrição */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="desc"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Descrição (Opcional)
            </Label>
            <textarea
              id="desc"
              placeholder="Detalhes adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Já foi pago / Toggle Pago */}
          {module === "transactions" && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-8 w-8 cursor-pointer rounded-full transition-colors",
                  isPaid ? "border-success bg-success/10 text-success" : "text-muted-foreground"
                )}
                onClick={() => setIsPaid(!isPaid)}
              >
                <DollarSign className="h-4 w-4" />
              </Button>
              <Label
                className="text-sm font-semibold cursor-pointer"
                onClick={() => setIsPaid(!isPaid)}
              >
                Marcar como {type === "income" ? "recebido" : "pago"}
              </Label>
            </div>
          )}

          <Button type="submit" className="mt-2 h-12 w-full text-base font-bold" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : mode === "edit" ? (
              "Salvar Alterações"
            ) : (
              module === "transactions" ? "Criar Lançamento" : "Criar Provisão"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
