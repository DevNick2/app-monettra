"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Home,
  ThumbsUp,
  RepeatIcon,
  CreditCard,
} from "lucide-react"
import * as iconOptions from "lucide-react"
import { toast } from "sonner"
import { format, getDaysInMonth } from "date-fns"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useTransactionsStore } from "@/stores/use-transactions-store"
import { useCategoriesStore } from "@/stores/use-categories-store"
import { useCreditCardsStore } from "@/stores/use-credit-cards-store"
import { useAccountsStore } from "@/stores/use-accounts-store"
import { useAuthStore } from "@/stores/use-auth-store"
import { MemberAvatar } from "@/components/common/member-avatar"
import type {
  Transaction,
  TransactionType,
  CreateTransactionPayload,
  RecurrenceScope,
  CreateCreditCardChargePayload,
} from "@/lib/types"

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

function getIconComponent(iconName: string) {
  const Icon = (iconOptions as any)[iconName]
  return Icon || Home
}

/** Gera a data padrão do modal: currentYear/currentMonth, dia = hoje (clampado ao limite do mês) */
function buildDefaultDate(month: number, year: number): string {
  const today = new Date()
  const todayDay = today.getDate()
  const daysInTargetMonth = getDaysInMonth(new Date(year, month))
  const clampedDay = Math.min(todayDay, daysInTargetMonth)
  return format(new Date(year, month, clampedDay), "yyyy-MM-dd")
}

// ─── Subcomponente: Modal de Escopo de Decisão ────────────────
// Intercepts delete/edit on recurring transactions
interface ScopeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (scope: RecurrenceScope) => void
  mode: "delete" | "edit"
  transactionTitle: string
}

function ScopeDialog({ open, onClose, onConfirm, mode, transactionTitle }: ScopeDialogProps) {
  const [selectedScope, setSelectedScope] = useState<RecurrenceScope>("single")

  const isDelete = mode === "delete"
  const color = isDelete ? "destructive" : "primary"

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <AlertDialogContent className="sm:max-w-[440px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-lg">
            {isDelete ? "Remover lançamento recorrente" : "Editar lançamento recorrente"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{transactionTitle}</span> faz parte de uma recorrência.
            Como você deseja aplicar esta {isDelete ? "remoção" : "edição"}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {[
            { value: "single" as RecurrenceScope, label: "Apenas este lançamento", desc: "Altera somente este registro." },
            { value: "forward" as RecurrenceScope, label: "Este e os próximos", desc: "Mantém o passado intocado. Afeta este e os lançamentos futuros da série." },
            { value: "all" as RecurrenceScope, label: "Todos da série", desc: "Aplica a toda a recorrência (passado, presente e futuro)." },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer",
                selectedScope === value
                  ? isDelete
                    ? "border-destructive bg-destructive/10"
                    : "border-primary bg-primary/10"
                  : "border-border bg-secondary/20 hover:bg-secondary/40"
              )}
              onClick={() => setSelectedScope(value)}
            >
              <span className={cn(
                "text-sm font-semibold",
                selectedScope === value
                  ? isDelete ? "text-destructive" : "text-primary"
                  : "text-foreground"
              )}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(selectedScope)}
            className={isDelete
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
          >
            {isDelete ? "Remover" : "Salvar Alterações"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Subcomponente: Tabela Anual ───────────────────────────────
interface AnnualTableProps {
  title: string
  rows: { category: any; months: number[]; type: string }[]
  onCellClick: (category: any, monthIndex: number, transactions: Transaction[]) => void
  planningTransactions: Transaction[]
  formatCurrency: (val: number) => string
}

function AnnualTable({ title, rows, onCellClick, planningTransactions, formatCurrency }: AnnualTableProps) {
  const monthTotals = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      rows.reduce((acc, row) => acc + row.months[i], 0)
    )
  }, [rows])

  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-base font-bold text-foreground px-1">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-[60px]">
              </th>
              {months.map((m) => (
                <th key={m} className="px-4 py-3 text-right font-semibold text-muted-foreground">
                  {m.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const cat = row.category
              const CategoryIcon = getIconComponent(cat?.icon_name ?? "")
              return (
                <tr
                  key={cat?.code ?? cat?.title}
                  className="group border-b border-border transition-colors hover:bg-secondary/30 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="relative group/tooltip flex items-center justify-center">
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-110 cursor-default"
                        style={{
                          backgroundColor: cat ? cat.color + "20" : "var(--secondary)",
                          color: cat?.color ?? "var(--muted-foreground)",
                        }}
                      >
                        <CategoryIcon className="h-3 w-3" style={{ color: cat?.color }} />
                      </div>
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 hidden group-hover/tooltip:block bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        {cat?.title ?? "Sem Categoria"}
                      </div>
                    </div>
                  </td>
                  {row.months.map((val, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3 text-right font-medium cursor-pointer hover:bg-primary/10 rounded transition-colors"
                      onClick={() => {
                        if (val > 0) onCellClick(cat, idx, planningTransactions)
                      }}
                    >
                      {val === 0 ? (
                        <span className="text-muted-foreground/30">-</span>
                      ) : (
                        <span className="hover:text-primary transition-colors">
                          {formatCurrency(val)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
            <tr className="border-t-2 border-border bg-secondary/40">
              <td className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total
              </td>
              {monthTotals.map((total, idx) => (
                <td
                  key={idx}
                  className="px-4 py-3 text-right text-xs font-bold text-foreground"
                >
                  {total === 0 ? (
                    <span className="text-muted-foreground/30">-</span>
                  ) : (
                    formatCurrency(total)
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Subcomponente: Modal de Drill-Down ────────────────────────
interface DrillDownModalProps {
  open: boolean
  onClose: () => void
  category: any
  monthIndex: number
  transactions: Transaction[]
  formatCurrency: (val: number) => string
}

function DrillDownModal({ open, onClose, category, monthIndex, transactions, formatCurrency }: DrillDownModalProps) {
  const filtered = useMemo(() => {
    if (!category || monthIndex < 0) return []
    return transactions.filter((t) => {
      const catKey = t.category?.code || t.category?.title || "sem-categoria"
      const catMatch =
        catKey === (category?.code || category?.title || "sem-categoria")

      let tMonthIndex = -1
      if (t.due_date?.includes("/")) {
        tMonthIndex = parseInt(t.due_date.split("/")[1], 10) - 1
      } else if (t.due_date?.includes("-")) {
        tMonthIndex = parseInt(t.due_date.split("-")[1], 10) - 1
      }
      return catMatch && tMonthIndex === monthIndex
    })
  }, [category, monthIndex, transactions])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {category?.title ?? "Categoria"} — {months[monthIndex] ?? ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum lançamento encontrado.</p>
          ) : (
            filtered.map((t) => {
              const CatIcon = getIconComponent(t.category?.icon_name ?? "")
              const valStr = String(t.amount || "0")
              const clean = valStr.replace(/\./g, "").replace(",", ".")
              const val = parseFloat(clean) || 0
              return (
                <div key={t.code} className="flex items-center gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: t.category ? t.category.color + "20" : "var(--secondary)",
                      color: t.category?.color ?? "var(--muted-foreground)",
                    }}
                  >
                    <CatIcon className="h-3.5 w-3.5" style={{ color: t.category?.color }} />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.due_date}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    t.type === "income" ? "text-success" : "text-destructive"
                  )}>
                    {t.type === "income" ? "+" : "-"}R$ {t.amount}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente Principal ──────────────────────────────────────
export default function LancamentosPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const [viewMode, setViewMode] = useState<"month" | "year">("month")
  const [planningYear, setPlanningYear] = useState<number>(new Date().getFullYear())

  // ─── Stores ────────────────────────────────────────────────
  const {
    transactions,
    planningTransactions,
    summary: apiSummary,
    isLoading,
    isLoadingPlanning,
    fetchTransactions,
    fetchPlanningTransactions,
    fetchSummary,
    createTransaction,
    createBatchTransaction,
    payTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionsStore()

  const { categories, fetchCategories } = useCategoriesStore()
  const { cards, fetchCards, createCharge } = useCreditCardsStore()
  const { account, fetchMyAccount } = useAccountsStore()
  const { user } = useAuthStore()

  // ─── Dialog states ─────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAndNew, setIsSavingAndNew] = useState(false)

  // ─── Scope Dialog (recorrência) ──────────────────────────────
  const [scopeDialog, setScopeDialog] = useState<{
    open: boolean
    mode: "delete" | "edit"
    transaction: Transaction | null
    pendingPayload?: any
  }>({ open: false, mode: "delete", transaction: null })

  // ─── Drill-Down Modal ──────────────────────────────────────
  const [drillDown, setDrillDown] = useState<{
    open: boolean
    category: any
    monthIndex: number
  }>({ open: false, category: null, monthIndex: -1 })

  // ─── Invoice accordion state ───────────────────────────────
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set())

  // ─── Form states ───────────────────────────────────────────
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState(() => buildDefaultDate(new Date().getMonth(), new Date().getFullYear()))
  const [newValue, setNewValue] = useState("")
  const [newType, setNewType] = useState<TransactionType>("expense")
  const [newCategoryCode, setNewCategoryCode] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newIsPaid, setNewIsPaid] = useState(false)
  // Recorrência
  const [enableRecurrence, setEnableRecurrence] = useState(false)
  // Cartão de crédito
  const [useCreditCard, setUseCreditCard] = useState(false)
  const [selectedCardCode, setSelectedCardCode] = useState("")
  const [installments, setInstallments] = useState(1)
  // Dono da transação
  const [ownerCode, setOwnerCode] = useState("")

  // ─── Inicialização ─────────────────────────────────────────
  useEffect(() => {
    fetchTransactions(currentMonth + 1, currentYear)
    fetchSummary(currentMonth + 1, currentYear)
  }, [fetchTransactions, fetchSummary, currentMonth, currentYear])

  useEffect(() => {
    if (viewMode === "year") {
      fetchPlanningTransactions(planningYear)
    }
  }, [fetchPlanningTransactions, viewMode, planningYear])

  // ─── Dados Anuais com separação income/expense ─────────────
  const { yearlyIncome, yearlyExpense } = useMemo(() => {
    if (!planningTransactions) return { yearlyIncome: [], yearlyExpense: [] }

    const incomeMap = new Map<string, { category: any; months: number[]; type: string }>()
    const expenseMap = new Map<string, { category: any; months: number[]; type: string }>()

    planningTransactions.forEach((t) => {
      const catKey = t.category?.code || t.category?.title || "sem-categoria"
      const targetMap = t.type === "income" ? incomeMap : expenseMap

      if (!targetMap.has(catKey)) {
        targetMap.set(catKey, {
          category: t.category ?? { title: "Sem Categoria", color: "var(--muted-foreground)" },
          months: Array(12).fill(0),
          type: t.type,
        })
      }

      const valStr = String(t.amount || "0")
      const clean = valStr.replace(/\./g, "").replace(",", ".")
      const val = parseFloat(clean) || 0

      let monthIndex = 0
      if (t.due_date?.includes("/")) {
        monthIndex = parseInt(t.due_date.split("/")[1], 10) - 1
      } else if (t.due_date?.includes("-")) {
        monthIndex = parseInt(t.due_date.split("-")[1], 10) - 1
      }

      targetMap.get(catKey)!.months[monthIndex] += val
    })

    return {
      yearlyIncome: Array.from(incomeMap.values()),
      yearlyExpense: Array.from(expenseMap.values()),
    }
  }, [planningTransactions])

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

  const filteredTransactions = transactions

  // ─── Agrupamento de Faturas (Cartão de Crédito) ─────────────
  /**
   * Separa as transações em dois grupos:
   * 1. regular: transações normais (sem invoice_code)
   * 2. invoiceGroups: transações de crédito agrupadas por invoice_code
   */
  const { regularTransactions, invoiceGroups } = useMemo(() => {
    const regular: Transaction[] = []
    const groups = new Map<
      string,
      {
        invoice_code: string
        month: number
        year: number
        card_name: string
        transactions: Transaction[]
        total: number
        is_paid: boolean
      }
    >()

    filteredTransactions.forEach((t: Transaction) => {
      if (t.type_of_transaction === "credit_card" && t.invoice_code) {
        const key = t.invoice_code
        if (!groups.has(key)) {
          groups.set(key, {
            invoice_code: key,
            month: t.invoice_reference_month ?? 0,
            year: t.invoice_reference_year ?? 0,
            card_name: t.credit_card_name ?? "Cartão",
            transactions: [],
            total: 0,
            is_paid: t.is_paid,
          })
        }
        const g = groups.get(key)!
        g.transactions.push(t)
        const amt = parseFloat((t.amount || "0").replace(/\./g, "").replace(",", ".")) || 0
        g.total += amt
        if (!t.is_paid) g.is_paid = false
      } else {
        regular.push(t)
      }
    })

    return { regularTransactions: regular, invoiceGroups: Array.from(groups.values()) }
  }, [filteredTransactions])

  function toggleInvoice(code: string) {
    setExpandedInvoices((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

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

    return { income, expense, balance: income - expense }
  }, [filteredTransactions])

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  // ─── Resetar formulário ────────────────────────────────────
  const resetForm = useCallback(() => {
    setNewTitle("")
    setNewDate(buildDefaultDate(currentMonth, currentYear))
    setNewValue("")
    setNewType("expense")
    setNewCategoryCode(categories[0]?.code ?? "")
    setNewDescription("")
    setNewIsPaid(false)
    setEnableRecurrence(false)
    setUseCreditCard(false)
    setSelectedCardCode("")
    setInstallments(1)
    setOwnerCode(user?.code ?? "")
    setEditingTransaction(null)
  }, [currentMonth, currentYear, categories, user])

  function openNewDialog() {
    setNewTitle("")
    setNewDate(buildDefaultDate(currentMonth, currentYear))
    setNewValue("")
    setNewType("expense")
    setNewCategoryCode(categories[0]?.code ?? "")
    setNewDescription("")
    setNewIsPaid(false)
    setEnableRecurrence(false)
    setUseCreditCard(false)
    setSelectedCardCode("")
    setInstallments(1)
    setOwnerCode(user?.code ?? "")
    setEditingTransaction(null)
    fetchCategories()
    fetchCards()
    fetchMyAccount()
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
    setOwnerCode(t.owner?.code ?? user?.code ?? "")
    setEnableRecurrence(false)
    fetchCategories()
    fetchMyAccount()
    setDialogOpen(true)
  }

  // ─── Monta payload ─────────────────────────────────────────
  function buildPayload(): CreateTransactionPayload {
    const [yyyy, mm, dd] = newDate.split("-")
    const brDate = `${dd}/${mm}/${yyyy}`
    return {
      title: newTitle,
      amount: newValue,
      type: newType,
      due_date: brDate,
      description: newDescription || null,
      category_code: newCategoryCode || null,
      is_paid: newIsPaid,
      owner_code: ownerCode || null,
    }
  }

  // ─── Submit do formulário (criar ou editar) ─────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingTransaction) {
        if (editingTransaction.recurrence_id) {
          const payload = buildPayload()
          setScopeDialog({ open: true, mode: "edit", transaction: editingTransaction, pendingPayload: payload })
          setIsSaving(false)
          return
        }
        await updateTransaction(editingTransaction.code, buildPayload())
        toast.success("Lançamento atualizado com sucesso!")
      } else if (useCreditCard && selectedCardCode) {
        // Lançamento via cartão de crédito
        const [yyyy, mm, dd] = newDate.split("-")
        const chargePayload: CreateCreditCardChargePayload = {
          title: newTitle,
          amount: newValue,
          purchase_date: `${dd}/${mm}/${yyyy}`,
          credit_card_code: selectedCardCode,
          installments,
          description: newDescription || null,
          category_code: newCategoryCode || null,
        }
        await createCharge(chargePayload)
        toast.success(
          installments > 1
            ? `Compra parcelada em ${installments}x registrada com sucesso!`
            : "Compra no cartão registrada com sucesso!"
        )
        fetchTransactions(currentMonth + 1, currentYear)
      } else {
        if (enableRecurrence) {
          const [yyyy, mm, dd] = newDate.split("-")
          await createBatchTransaction({
            title: newTitle,
            amount: newValue,
            type: newType,
            start_date: `${dd}/${mm}/${yyyy}`,
            description: newDescription || null,
            category_code: newCategoryCode || null,
            is_paid: newIsPaid,
            owner_code: ownerCode || null,
          })
          toast.success("Lançamentos recorrentes criados com sucesso!")
        } else {
          await createTransaction(buildPayload())
          toast.success("Lançamento criado com sucesso!")
        }
      }
      setDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Erro ao salvar lançamento. Verifique os dados e tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Salvar e criar outro ──────────────────────────────────
  async function handleSaveAndNew(e: React.MouseEvent) {
    e.preventDefault()
    if (!newTitle || !newValue || !newDate) {
      toast.error("Preencha os campos obrigatórios antes de salvar.")
      return
    }
    setIsSavingAndNew(true)

    try {
      if (enableRecurrence) {
        const [yyyy, mm, dd] = newDate.split("-")
        await createBatchTransaction({
          title: newTitle,
          amount: newValue,
          type: newType,
          start_date: `${dd}/${mm}/${yyyy}`,
          description: newDescription || null,
          category_code: newCategoryCode || null,
          is_paid: newIsPaid,
          owner_code: ownerCode || null,
        })
      } else {
        await createTransaction(buildPayload())
      }
      toast.success("Lançamento salvo! Formulário pronto para novo registro.")

      const savedDate = newDate
      setNewTitle("")
      setNewValue("")
      setNewType("expense")
      setNewCategoryCode(categories[0]?.code ?? "")
      setNewDescription("")
      setNewIsPaid(false)
      setEnableRecurrence(false)
      setNewDate(savedDate)
    } catch {
      toast.error("Erro ao salvar lançamento.")
    } finally {
      setIsSavingAndNew(false)
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

  // ─── Iniciar deleção (intercepta recorrências) ─────────────
  function initiateDelete(t: Transaction) {
    if (t.recurrence_id) {
      setScopeDialog({ open: true, mode: "delete", transaction: t })
    } else {
      handleDelete(t.code, "single")
    }
  }

  // ─── Confirmar escopo de decisão ──────────────────────────
  async function handleScopeConfirm(scope: RecurrenceScope) {
    const { mode, transaction, pendingPayload } = scopeDialog
    setScopeDialog({ open: false, mode: "delete", transaction: null })

    if (!transaction) return

    if (mode === "delete") {
      await handleDelete(transaction.code, scope)
    } else if (mode === "edit" && pendingPayload) {
      try {
        await updateTransaction(transaction.code, { ...pendingPayload, scope })
        toast.success(scope === "single"
          ? "Lançamento atualizado."
          : scope === "forward"
          ? "Este e os próximos lançamentos foram atualizados."
          : "Toda a série foi atualizada.")
        setDialogOpen(false)
        resetForm()
      } catch {
        toast.error("Erro ao atualizar lançamentos.")
      }
    }
  }

  // ─── Remover lançamento ────────────────────────────────────
  async function handleDelete(code: string, scope: RecurrenceScope = "single") {
    try {
      await deleteTransaction(code, scope)
      const msg = scope === "single"
        ? "Lançamento removido."
        : scope === "forward"
        ? "Este e os próximos lançamentos foram removidos."
        : "Toda a série de lançamentos foi removida."
      toast.success(msg)
    } catch {
      toast.error("Erro ao remover lançamento.")
    }
  }

  const formatMonthNav = (monthIdx: number, year: number) => {
    const monthName = months[monthIdx].substring(0, 3)
    return `${monthName}/${year}`
  }

  const isSubmitting = isSaving || isSavingAndNew

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">Lançamentos</h1>

          <div className="flex bg-secondary/50 rounded-lg p-1">
            <Button
              variant="ghost"
              className={cn("h-8 px-3 text-sm cursor-pointer transition-colors", viewMode === "month" ? "bg-background shadow-sm" : "hover:bg-background/50")}
              onClick={() => setViewMode("month")}
            >
              Visão Mensal
            </Button>
            <Button
              variant="ghost"
              className={cn("h-8 px-3 text-sm cursor-pointer transition-colors", viewMode === "year" ? "bg-background shadow-sm" : "hover:bg-background/50")}
              onClick={() => setViewMode("year")}
            >
              Visualização Anual
            </Button>
          </div>
        </div>

        {/* Botão fixo no topo da página (sticky) */}
        <div className="sticky top-4 z-10">
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="gap-2 shadow-lg transition-all hover:scale-105 bg-primary text-white hover:bg-primary/90"
                onClick={openNewDialog}
              >
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {editingTransaction?.owner && (
                    <MemberAvatar
                      name={editingTransaction.owner.name}
                      photoUrl={editingTransaction.owner.photo_url}
                      size="md"
                    />
                  )}
                  <DialogTitle className="font-heading text-xl">
                    {editingTransaction ? "Editar Lançamento" : "Novo Lançamento"}
                  </DialogTitle>
                </div>
                {editingTransaction?.owner && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Dono: <span className="font-medium text-foreground">{editingTransaction.owner.name}</span>
                  </p>
                )}
              </DialogHeader>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                {/* 1º Tipo de transação */}
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
                      Receitas
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
                      Despesas
                    </Button>
                  </div>
                </div>

                {/* Bloco Cartão de Crédito (apenas na criação, tipo despesa) */}
                {!editingTransaction && newType === "expense" && (
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                        useCreditCard
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-secondary/20 hover:bg-secondary/30"
                      }`}
                      htmlFor="credit-card-switch"
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">Cartão de Crédito</span>
                        <span className="text-xs text-muted-foreground">
                          Aloca a compra na fatura do cartão
                        </span>
                      </div>
                      <Switch
                        id="credit-card-switch"
                        checked={useCreditCard}
                        onCheckedChange={(v) => {
                          setUseCreditCard(v)
                          if (!v) { setSelectedCardCode(""); setInstallments(1) }
                        }}
                      />
                    </label>

                    {useCreditCard && (
                      <div className="grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Cartão
                          </Label>
                          {cards.length > 0 ? (
                            <Select value={selectedCardCode} onValueChange={setSelectedCardCode}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecionar cartão" />
                              </SelectTrigger>
                              <SelectContent>
                                {cards.map((card) => (
                                  <SelectItem key={card.code} value={card.code}>
                                    {card.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Nenhum cartão cadastrado.{" "}
                              <a href="/cartoes" className="text-primary underline">Cadastrar</a>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Parcelas
                          </Label>
                          <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n === 1 ? "À vista (1x)" : `${n}x`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2º Data + Categoria */}
                <div className="grid grid-cols-2 gap-4">
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value
                        setNewDate(val)
                        if (val) {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const picked = new Date(val + "T00:00:00")
                          setNewIsPaid(picked <= today)
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categoria
                    </Label>
                    {categories.length > 0 ? (
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
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">Nenhuma categoria</p>
                    )}
                  </div>
                </div>

                {/* 3º Valor + Toggle Pago */}
                <div className="flex items-end gap-3">
                  <div className="flex flex-1 flex-col gap-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 cursor-pointer transition-colors mb-0",
                      newIsPaid
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                    onClick={() => setNewIsPaid(!newIsPaid)}
                    title={newIsPaid ? "Marcar como pendente" : `Marcar como ${newType === "income" ? "recebido" : "pago"}`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                </div>

                {/* 4º Título */}
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

                {/* 5º Descrição */}
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
                    rows={2}
                    className="flex min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* Dono da Transação */}
                {account && account.members.length > 1 && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dono da Transação
                    </Label>
                    <Select value={ownerCode} onValueChange={setOwnerCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar membro" />
                      </SelectTrigger>
                      <SelectContent>
                        {account.members
                          .filter((m) => m.is_accepted)
                          .map((m) => (
                            <SelectItem key={m.user_code} value={m.user_code}>
                              <div className="flex items-center gap-2">
                                <MemberAvatar name={m.user_name} size="xs" />
                                <span>{m.user_name}</span>
                                {m.user_code === user?.code && (
                                  <span className="text-xs text-muted-foreground">(você)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Recorrência Fixa (apenas na criação) */}
                {!editingTransaction && (
                  <label
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2.5 cursor-pointer hover:bg-secondary/30 transition-colors"
                    htmlFor="recurrence-switch"
                  >
                    <RepeatIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">Recorrência Fixa</span>
                      <span className="text-xs text-muted-foreground">
                        Cria este lançamento nos meses restantes do ano (server-side)
                      </span>
                    </div>
                    <Switch
                      id="recurrence-switch"
                      checked={enableRecurrence}
                      onCheckedChange={setEnableRecurrence}
                    />
                  </label>
                )}

                {/* Botões de ação */}
                <div className="flex gap-2 mt-2">
                  {!editingTransaction && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 font-semibold cursor-pointer transition-colors"
                      disabled={isSubmitting}
                      onClick={handleSaveAndNew}
                    >
                      {isSavingAndNew ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="animate-pulse bg-muted rounded h-3 w-24 inline-block" />
                        </>
                      ) : (
                        "Salvar e Criar Outro"
                      )}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 h-11 text-base font-bold bg-success text-white hover:bg-success/90 cursor-pointer transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="animate-pulse bg-success/50 rounded h-3 w-20 inline-block" />
                      </>
                    ) : editingTransaction ? (
                      "Salvar Alterações"
                    ) : (
                      "Criar Lançamento"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {viewMode === "month" ? (
          <>
            {/* ── Navegador de mês e Resumos ──────────────────── */}
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
            <div className="flex flex-col gap-3">
              {/* Linha 1 — saldos gerais (todas as transações) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Saldo Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-2xl font-bold",
                      (apiSummary?.net_balance ?? summary.balance * 100) >= 0
                        ? "text-foreground"
                        : "text-destructive"
                    )}>
                      {apiSummary
                        ? formatCurrency(apiSummary.net_balance / 100)
                        : formatCurrency(summary.balance)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Receitas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">
                      {apiSummary
                        ? formatCurrency(apiSummary.total_income / 100)
                        : formatCurrency(summary.income)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Despesas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {apiSummary
                        ? formatCurrency(apiSummary.total_expense / 100)
                        : formatCurrency(summary.expense)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Linha 2 — saldos pagos (is_paid = true) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-border bg-card/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      Saldo Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-lg font-semibold",
                      (apiSummary?.paid_net_balance ?? 0) >= 0
                        ? "text-foreground/80"
                        : "text-destructive/80"
                    )}>
                      {apiSummary
                        ? formatCurrency(apiSummary.paid_net_balance / 100)
                        : "—"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      Recebidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-success/80">
                      {apiSummary
                        ? formatCurrency(apiSummary.paid_income / 100)
                        : "—"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-card/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                      Pagas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-destructive/80">
                      {apiSummary
                        ? formatCurrency(apiSummary.paid_expense / 100)
                        : "—"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Tabela de lançamentos ─────────────────────── */}
            <div className="flex flex-col gap-4">
              <Card className="overflow-hidden border-border bg-card">
                <CardContent className="p-0">
                  {isLoading ? (
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
                      <Plus className="h-10 w-10 opacity-20" />
                      <p className="text-sm">Nenhum lançamento neste mês</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={openNewDialog}>
                        Adicionar primeiro lançamento
                      </Button>
                    </div>
                  ) : (invoiceGroups.length > 0 || regularTransactions.length > 0) ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {/* ── Faturas de Cartão (agrupadas) ─────────── */}
                          {invoiceGroups.map((group) => {
                            const isExpanded = expandedInvoices.has(group.invoice_code)
                            const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
                            const monthLabel = group.month > 0 ? `${monthNames[group.month - 1]}/${group.year}` : ""
                            return (
                              <React.Fragment key={group.invoice_code}>
                                {/* Linha de cabeçalho da fatura */}
                                <tr
                                  className="group border-b border-border bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => toggleInvoice(group.invoice_code)}
                                >
                                  <td className="px-4 py-3 w-16">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                                      <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button className="text-muted-foreground">
                                        {isExpanded
                                          ? <ChevronDown className="h-4 w-4" />
                                          : <ChevronRight className="h-4 w-4" />
                                        }
                                      </button>
                                      <div>
                                        <span className="text-sm font-semibold text-foreground">
                                          Fatura {group.card_name}
                                        </span>
                                        {monthLabel && (
                                          <span className="ml-1 text-xs text-muted-foreground">{monthLabel}</span>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                          {group.transactions.length} compra{group.transactions.length !== 1 ? "s" : ""}
                                        </div>
                                      </div>
                                      {group.is_paid ? (
                                        <span className="rounded-sm bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                                          Paga
                                        </span>
                                      ) : (
                                        <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                          Pendente
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground" />
                                  <td className="px-4 py-3 text-right text-sm font-bold text-destructive">
                                    -R$ {group.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td colSpan={2} />
                                </tr>

                                {/* Sub-transações expandidas */}
                                {isExpanded && group.transactions.map((t) => (
                                  <tr
                                    key={t.code}
                                    className="border-b border-border/50 bg-primary/2 hover:bg-secondary/20 transition-colors"
                                  >
                                    <td className="w-16" />
                                    <td className="px-4 py-2.5 pl-12">
                                      <span className="text-sm text-foreground">{t.title}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                      {t.due_date}
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-sm font-medium text-destructive">
                                      -R$ {t.amount}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                      <span className={cn(
                                        "text-xs",
                                        t.is_paid ? "text-success" : "text-muted-foreground"
                                      )}>
                                        {t.is_paid ? "✓" : "–"}
                                      </span>
                                    </td>
                                    <td />
                                  </tr>
                                ))}
                              </React.Fragment>
                            )
                          })}

                          {/* ── Transações Regulares ─────────────────────── */}
                          {regularTransactions.map((t: Transaction) => {
                            const cat = t.category
                            const CategoryIcon = getIconComponent(cat?.icon_name ?? "")
                            const isRecurring = !!t.recurrence_id
                            return (
                              <tr
                                key={t.code}
                                className="group border-b border-border transition-all last:border-b-0 hover:bg-secondary/30"
                              >
                                {/* Ícone da categoria */}
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

                                {/* Título + badges */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    {t.owner && (
                                      <MemberAvatar
                                        name={t.owner.name}
                                        photoUrl={t.owner.photo_url}
                                        size="xs"
                                      />
                                    )}
                                    <span
                                      className="text-sm font-semibold leading-none text-foreground cursor-pointer transition-colors group-hover:text-primary"
                                      onClick={() => t.type_of_transaction !== "subscription" ? openEditDialog(t) : undefined}
                                    >
                                      {t.title}
                                    </span>
                                    {isRecurring && (
                                      <span title="Lançamento recorrente">
                                        <RepeatIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                                      </span>
                                    )}
                                    {t.type_of_transaction === "subscription" && t.subscription_payment_method === "credit_card" && (
                                      <span
                                        className="flex items-center gap-0.5 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                                        title="Pago via Cartão de Crédito"
                                      >
                                        <CreditCard className="h-2.5 w-2.5" />
                                        Cartão
                                      </span>
                                    )}
                                  </div>
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

                                {/* Botão ThumbsUp */}
                                <td className="px-4 py-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleTogglePay(t)}
                                    title={t.is_paid ? "Marcar como pendente" : "Marcar como pago"}
                                    className={cn(
                                      "h-8 w-8 cursor-pointer transition-all rounded-md",
                                      t.is_paid
                                        ? "bg-success/15 text-success shadow-sm shadow-success/20"
                                        : "bg-secondary text-muted-foreground",
                                      t.is_paid
                                        ? "hover:bg-secondary"
                                        : "hover:text-white hover:bg-success/75"
                                    )}
                                  >
                                    <ThumbsUp className={cn("h-4 w-4 stroke-[2.5]", "opacity-60")} />
                                  </Button>
                                </td>

                                {/* Ações: editar + remover */}
                                <td className="px-2 py-4 text-center">
                                  {t.type_of_transaction !== 'subscription' ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditDialog(t)}
                                        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                                        aria-label="Editar lançamento"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      {isRecurring ? (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                                          onClick={() => initiateDelete(t)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      ) : (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
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
                                                <span className="font-medium">{t.title}</span>?
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDelete(t.code, "single")}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Remover
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/50 italic px-2">Assinatura</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* ── Visualização Anual ──────────────────────────── */
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-muted-foreground">Ano da Visualização</Label>
                <Select value={String(planningYear)} onValueChange={(v) => setPlanningYear(Number(v))}>
                  <SelectTrigger className="w-[120px] font-heading font-bold cursor-pointer transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[planningYear - 2, planningYear - 1, planningYear, planningYear + 1, planningYear + 2].sort().map((y) => (
                      <SelectItem key={y} value={String(y)} className="cursor-pointer">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoadingPlanning ? (
              <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando visualização anual...
              </div>
            ) : (yearlyIncome.length === 0 && yearlyExpense.length === 0) ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>Nenhum dado encontrado para o ano {planningYear}.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <Card className="overflow-hidden border-border bg-card">
                  <CardContent className="p-4">
                    <AnnualTable
                      title="Receitas"
                      rows={yearlyIncome}
                      planningTransactions={planningTransactions}
                      formatCurrency={formatCurrency}
                      onCellClick={(cat, monthIndex) =>
                        setDrillDown({ open: true, category: cat, monthIndex })
                      }
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-border bg-card">
                  <CardContent className="p-4">
                    <AnnualTable
                      title="Despesas"
                      rows={yearlyExpense}
                      planningTransactions={planningTransactions}
                      formatCurrency={formatCurrency}
                      onCellClick={(cat, monthIndex) =>
                        setDrillDown({ open: true, category: cat, monthIndex })
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Drill-Down Modal ──────────────────────────────── */}
      <DrillDownModal
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, category: null, monthIndex: -1 })}
        category={drillDown.category}
        monthIndex={drillDown.monthIndex}
        transactions={planningTransactions}
        formatCurrency={formatCurrency}
      />

      {/* ── Scope Decision Dialog (Recorrências) ─────────── */}
      <ScopeDialog
        open={scopeDialog.open}
        onClose={() => setScopeDialog({ open: false, mode: "delete", transaction: null })}
        onConfirm={handleScopeConfirm}
        mode={scopeDialog.mode}
        transactionTitle={scopeDialog.transaction?.title ?? ""}
      />
    </div>
  )
}
