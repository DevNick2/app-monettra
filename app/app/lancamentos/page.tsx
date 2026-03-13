"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  DollarSign,
  Loader2,
  Pencil,
  Trash2,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Utensils,
  Zap,
  Wifi,
  Droplets,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTransactionsStore } from "@/stores/use-transactions-store"
import { useCategoriesStore } from "@/stores/use-categories-store"
import type { Transaction, TransactionType, CreateTransactionPayload } from "@/lib/types"

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const iconOptions = [
  { name: "Home", icon: Home },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Car", icon: Car },
  { name: "Heart", icon: Heart },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Briefcase", icon: Briefcase },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Utensils", icon: Utensils },
  { name: "Zap", icon: Zap },
  { name: "Wifi", icon: Wifi },
  { name: "Droplets", icon: Droplets },
  { name: "Phone", icon: Phone },
]

function getIconComponent(iconName: string) {
  const found = iconOptions.find((i) => i.name === iconName)
  return found ? found.icon : Home
}

export default function LancamentosPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // ─── Stores ────────────────────────────────────────────────
  const {
    transactions,
    isLoading,
    fetchTransactions,
    createTransaction,
    payTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionsStore()

  const { categories, fetchCategories } = useCategoriesStore()

  // ─── Dialog states ─────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // ─── Form states ───────────────────────────────────────────
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
  const [newValue, setNewValue] = useState("")
  const [newType, setNewType] = useState<TransactionType>("expense")
  const [newCategoryCode, setNewCategoryCode] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newIsPaid, setNewIsPaid] = useState(false)

  // ─── Inicialização ─────────────────────────────────────────
  useEffect(() => {
    fetchTransactions(currentMonth + 1, currentYear)
  }, [fetchTransactions, currentMonth, currentYear])

  // ─── Helpers de navegação de mês ───────────────────────────
  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Filtro aplicado no backend via query params month/year
  const filteredTransactions = transactions

  // ─── Resumo de Valores ──────────────────────────────────────
  const summary = useMemo(() => {
    let income = 0
    let expense = 0

    filteredTransactions.forEach((t: Transaction) => {
      const valStr = t.amount || "0"
      const clean = valStr.replace(/\./g, "").replace(",", ".")
      const val = parseFloat(clean) || 0

      if (t.type === "income") {
        income += val
      } else {
        expense += val
      }
    })

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [filteredTransactions])

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  // ─── Resetar formulário ────────────────────────────────────
  function resetForm() {
    setNewTitle("")
    setNewDate(new Date().toISOString().split("T")[0])
    setNewValue("")
    setNewType("expense")
    setNewCategoryCode(categories[0]?.code ?? "")
    setNewDescription("")
    setNewIsPaid(false)
    setEditingTransaction(null)
  }

  function openNewDialog() {
    resetForm()
    fetchCategories()
    setDialogOpen(true)
  }

  function openEditDialog(t: Transaction) {
    setEditingTransaction(t)
    setNewTitle(t.title)
    if (t.due_date && t.due_date.includes("/")) {
      const [dd, mm, yyyy] = t.due_date.split("/")
      setNewDate(`${yyyy}-${mm}-${dd}`)
    } else {
      setNewDate(t.due_date)
    }
    setNewValue(String(t.amount))
    setNewType(t.type)
    setNewCategoryCode(t.category_code ?? "")
    setNewDescription(t.description ?? "")
    setNewIsPaid(t.is_paid)
    setDialogOpen(true)
  }

  // ─── Submit do formulário (criar ou editar) ─────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const [yyyy, mm, dd] = newDate.split("-")
    const brDate = `${dd}/${mm}/${yyyy}`

    const payload: CreateTransactionPayload = {
      title: newTitle,
      amount: newValue,
      type: newType,
      due_date: brDate,
      description: newDescription || null,
      category_code: newCategoryCode || null,
      is_paid: newIsPaid,
    }

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.code, payload)
        toast.success("Lançamento atualizado com sucesso!")
      } else {
        await createTransaction(payload)
        toast.success("Lançamento criado com sucesso!")
      }
      setDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Erro ao salvar lançamento. Verifique os dados e tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Toggle status de pagamento ────────────────────────────
  async function handleTogglePay(t: Transaction) {
    try {
      await payTransaction(t.code)
      toast.success(t.is_paid ? "Marcado como pendente" : "Marcado como pago!")
    } catch {
      toast.error("Erro ao atualizar status do lançamento.")
    }
  }

  // ─── Remover lançamento ────────────────────────────────────
  async function handleDelete(code: string) {
    try {
      await deleteTransaction(code)
      toast.success("Lançamento removido.")
    } catch {
      toast.error("Erro ao remover lançamento.")
    }
  }

  const formatMonthNav = (monthIdx: number, year: number) => {
    const monthName = months[monthIdx].substring(0, 3)
    return `${monthName}/${year}`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Lançamentos</h1>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg transition-all hover:scale-105" onClick={openNewDialog}>
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
              </DialogTitle>
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
                      newType === "income"
                        ? "bg-success text-white hover:bg-success/90"
                        : "hover:bg-success/20 hover:text-success"
                    )}
                    onClick={() => setNewType("income")}
                  >
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "flex-1 cursor-pointer gap-2 transition-all",
                      newType === "expense"
                        ? "bg-destructive text-white hover:bg-destructive/90"
                        : "hover:bg-destructive/20 hover:text-destructive"
                    )}
                    onClick={() => setNewType("expense")}
                  >
                    Saída
                  </Button>
                </div>
              </div>

              {/* Linha 1: Valor + Data */}
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
                    value={newValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "")
                      if (!onlyDigits) {
                        setNewValue("")
                        return
                      }
                      const numericValue = parseInt(onlyDigits, 10) / 100
                      setNewValue(
                        numericValue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      )
                    }}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="date"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Data da Transação
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
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
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {/* Categoria */}
              {categories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categoria
                  </Label>
                  <Select value={newCategoryCode} onValueChange={setNewCategoryCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: { code: string; title: string }) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  value={newDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewDescription(e.target.value)
                  }
                  rows={3}
                  className="flex min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Já foi pago / Toggle Pago */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn("h-8 w-8 cursor-pointer rounded-full transition-colors", newIsPaid ? "border-success bg-success/10 text-success" : "text-muted-foreground")}
                  onClick={() => setNewIsPaid(!newIsPaid)}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
                <Label className="text-sm font-semibold cursor-pointer" onClick={() => setNewIsPaid(!newIsPaid)}>
                  Marcar como {newType === "income" ? "recebido" : "pago"}
                </Label>
              </div>

              <Button
                type="submit"
                className="mt-2 h-12 w-full text-base font-bold"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingTransaction ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Lançamento"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Navegador de mês e Resumos ──────────────────── */}
        {/* Navegador de mês limpo */}
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            aria-label="Mês anterior"
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[100px] text-center font-heading text-lg font-semibold uppercase tracking-widest text-foreground">
            {formatMonthNav(currentMonth, currentYear)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Resumos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Saldo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", summary.balance >= 0 ? "text-foreground" : "text-destructive")}>
                {formatCurrency(summary.balance)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(summary.income)}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.expense)}</div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabela de lançamentos ─────────────────────── */}
        <div className="flex flex-col gap-4">

          <Card className="overflow-hidden border-border bg-card">
            <CardContent className="p-0">
              {isLoading ? (
                /* Skeleton loading */
                <div className="flex flex-col gap-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
                    >
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-2 w-20 animate-pulse rounded bg-muted/60" />
                      </div>
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-muted-foreground">
                  <DollarSign className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Nenhum lançamento neste mês</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={openNewDialog}>
                    Adicionar primeiro lançamento
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {filteredTransactions.map((t: Transaction) => {
                        const cat = t.category
                        const CategoryIcon = getIconComponent(cat?.icon_name ?? "")
                        return (
                          <tr
                            key={t.code}
                            className="group border-b border-border transition-all last:border-b-0 hover:bg-secondary/30"
                          >
                            {/* Ícone da categoria / cor */}
                            <td className="px-4 py-4 text-center w-16">
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                style={{
                                  backgroundColor: cat ? cat.color + "20" : "var(--secondary)",
                                  color: cat?.color ?? "var(--muted-foreground)",
                                }}
                              >
                                <CategoryIcon className="h-5 w-5" style={{ color: cat?.color }} />
                              </div>
                            </td>

                            {/* Título e categoria */}
                            <td className="px-4 py-4">
                              <span
                                className="text-sm font-semibold leading-none text-foreground cursor-pointer transition-colors group-hover:text-primary"
                                onClick={() => openEditDialog(t)}
                              >
                                {t.title}
                              </span>
                            </td>

                            {/* Data */}
                            <td className="px-4 py-4 text-sm font-medium text-muted-foreground">
                              {t.due_date}
                            </td>

                            {/* Valor */}
                            <td
                              className={cn(
                                "px-4 py-4 text-right text-sm font-bold",
                                t.type === "income" ? "text-success" : "text-destructive"
                              )}
                            >
                              {t.type === "income" ? "+" : "-"}R$ {t.amount}
                            </td>

                            {/* Botão de status (pago/pendente) */}
                            <td className="px-4 py-4 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePay(t)}
                                title={t.is_paid ? "Marcar como pendente" : "Marcar como pago"}
                                className={cn(
                                  "h-8 w-8 cursor-pointer rounded-full transition-all",
                                  t.is_paid
                                    ? "bg-success/15 text-success shadow-sm shadow-success/20 hover:bg-success/25"
                                    : "bg-secondary text-muted-foreground hover:bg-secondary hover:text-foreground/80"
                                )}
                              >
                                <DollarSign className={cn("h-4 w-4 stroke-[2.5]", !t.is_paid && "opacity-60")} />
                              </Button>
                            </td>

                            {/* Ações: editar + remover */}
                            <td className="px-2 py-4 text-center">
                              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(t)}
                                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                                  aria-label="Editar lançamento"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                                      aria-label="Remover lançamento"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="font-heading">
                                        Remover lançamento
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover{" "}
                                        <span className="font-medium">{t.title}</span>? Esta ação
                                        não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(t.code)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
