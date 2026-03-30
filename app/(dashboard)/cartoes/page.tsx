"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  BadgeCheck,
  Clock,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCreditCardsStore } from "@/stores/use-credit-cards-store"
import type {
  CreditCard as CreditCardType,
  Invoice,
  CreateCreditCardPayload,
  UpdateCreditCardPayload,
} from "@/lib/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

function parseCentsFromDisplay(val: string): number {
  if (!val) return 0
  const clean = val.replace(/\./g, "").replace(",", ".")
  return Math.round(parseFloat(clean) * 100) || 0
}

function formatCurrencyBR(val: string | number): string {
  if (typeof val === "string") {
    if (val.includes(",")) return val
    const n = parseFloat(val)
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }
  return (val / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ─── Sub-componente: Visualização de Faturas ──────────────────────────────────

function InvoicePanel({ card }: { card: CreditCardType }) {
  const { invoices, isLoadingInvoices, fetchInvoices, payInvoice } = useCreditCardsStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices(card.code)
  }, [card.code, fetchInvoices])

  async function handlePay(invoiceCode: string) {
    setPaying(invoiceCode)
    try {
      await payInvoice(invoiceCode)
      toast.success("Fatura paga com sucesso!")
      fetchInvoices(card.code)
    } catch {
      toast.error("Erro ao pagar fatura.")
    } finally {
      setPaying(null)
    }
  }

  if (isLoadingInvoices) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando faturas...
      </div>
    )
  }

  if (!invoices.length) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhuma fatura encontrada para este cartão.
      </p>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      {invoices.map((inv) => (
        <div
          key={inv.code}
          className="rounded-lg border border-border bg-card overflow-hidden"
        >
          {/* Header da fatura */}
          <div
            className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-secondary/40 transition-colors"
            onClick={() => setExpanded(expanded === inv.code ? null : inv.code)}
          >
            <div className="flex items-center gap-3">
              <button className="text-muted-foreground">
                {expanded === inv.code ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <span className="font-medium text-sm text-foreground">
                Fatura {MONTH_NAMES[inv.reference_month - 1]}/{inv.reference_year}
              </span>
              {inv.is_paid ? (
                <Badge className="bg-success/15 text-success border-success/30 text-xs">
                  <BadgeCheck className="h-3 w-3 mr-1" /> Paga
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-400/30 text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Pendente
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-destructive">
                {inv.total_amount}
              </span>
              {!inv.is_paid && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePay(inv.code)
                  }}
                  disabled={paying === inv.code}
                >
                  {paying === inv.code ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Pagar"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Transações expandidas */}
          {expanded === inv.code && (
            <div className="border-t border-border bg-background/50">
              {inv.transactions.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">
                  Nenhuma compra nesta fatura.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-4 py-2 text-left font-normal">Compra</th>
                      <th className="px-4 py-2 text-left font-normal">Vencimento</th>
                      <th className="px-4 py-2 text-right font-normal">Valor</th>
                      <th className="px-4 py-2 text-center font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.transactions.map((tx) => (
                      <tr
                        key={tx.code}
                        className="border-b border-border/30 last:border-0 hover:bg-secondary/20"
                      >
                        <td className="px-4 py-2 text-foreground">{tx.title}</td>
                        <td className="px-4 py-2 text-muted-foreground">{tx.due_date}</td>
                        <td className="px-4 py-2 text-right font-mono text-destructive">
                          {tx.amount}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {tx.is_paid ? (
                            <span className="text-success">✓</span>
                          ) : (
                            <span className="text-muted-foreground">–</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export default function CartoesPage() {
  const { cards, isLoading, fetchCards, createCard, updateCard, deleteCard } =
    useCreditCardsStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCardCode, setActiveCardCode] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [creditLimit, setCreditLimit] = useState("")
  const [closingDay, setClosingDay] = useState("")
  const [dueDay, setDueDay] = useState("")

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const resetForm = useCallback(() => {
    setName("")
    setCreditLimit("")
    setClosingDay("")
    setDueDay("")
    setEditingCard(null)
  }, [])

  function openNewDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(card: CreditCardType) {
    setEditingCard(card)
    setName(card.name)
    setCreditLimit(card.credit_limit)
    setClosingDay(String(card.closing_day))
    setDueDay(String(card.due_day))
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !creditLimit || !closingDay || !dueDay) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }
    setIsSaving(true)
    try {
      if (editingCard) {
        await updateCard(editingCard.code, {
          name,
          credit_limit: creditLimit,
          closing_day: Number(closingDay),
          due_day: Number(dueDay),
        } as UpdateCreditCardPayload)
        toast.success("Cartão atualizado com sucesso!")
      } else {
        await createCard({
          name,
          credit_limit: creditLimit,
          closing_day: Number(closingDay),
          due_day: Number(dueDay),
        } as CreateCreditCardPayload)
        toast.success("Cartão cadastrado com sucesso!")
      }
      setDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Erro ao salvar cartão. Verifique os dados.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(code: string) {
    try {
      await deleteCard(code)
      toast.success("Cartão removido com sucesso!")
      if (activeCardCode === code) setActiveCardCode(null)
    } catch {
      toast.error("Erro ao remover cartão.")
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Cartões de Crédito
            </h1>
            <p className="text-xs text-muted-foreground">
              Gerencie seus cartões e visualize as faturas
            </p>
          </div>
        </div>
        <Button
          onClick={openNewDialog}
          className="gap-2 cursor-pointer bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Cartão
        </Button>
      </div>

      {/* ─── Listagem de Cartões ────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cards.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhum cartão cadastrado ainda.
              <br />
              Adicione seu primeiro cartão para controlar seus gastos.
            </p>
            <Button onClick={openNewDialog} variant="outline" className="mt-2 cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card
              key={card.code}
              className={cn(
                "border transition-shadow",
                activeCardCode === card.code
                  ? "border-primary/40 shadow-md"
                  : "border-border hover:border-border/80"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {/* Card visual */}
                  <div
                    className="cursor-pointer flex items-center gap-4"
                    onClick={() =>
                      setActiveCardCode(activeCardCode === card.code ? null : card.code)
                    }
                  >
                    <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-primary/60 shadow-sm">
                      <CreditCard className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-base text-foreground">
                        {card.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          Limite: <span className="font-medium text-foreground ml-1">
                            R$&nbsp;{card.credit_limit}
                          </span>
                        </span>
                        <span>•</span>
                        <span>Fecha dia <strong>{card.closing_day}</strong></span>
                        <span>•</span>
                        <span>Vence dia <strong>{card.due_day}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(card)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover cartão?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o cartão{" "}
                            <strong>{card.name}</strong>? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="cursor-pointer bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(card.code)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 cursor-pointer text-xs text-muted-foreground hover:text-primary"
                      onClick={() =>
                        setActiveCardCode(activeCardCode === card.code ? null : card.code)
                      }
                    >
                      {activeCardCode === card.code ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Faturas
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Painel de faturas expandido */}
              {activeCardCode === card.code && (
                <CardContent className="pt-0">
                  <div className="border-t border-border/50 pt-4">
                    <InvoicePanel card={card} />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ─── Dialog de Criar/Editar ─────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm() } else setDialogOpen(true) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {editingCard ? "Editar Cartão" : "Novo Cartão de Crédito"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="card-name">Nome do Cartão *</Label>
              <Input
                id="card-name"
                placeholder="Ex: Nubank, Itaú Visa Gold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-limit">Limite (R$) *</Label>
              <Input
                id="card-limit"
                placeholder="Ex: 5.000,00"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="closing-day">Dia de Fechamento *</Label>
                <Input
                  id="closing-day"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex: 20"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due-day">Dia de Vencimento *</Label>
                <Input
                  id="due-day"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex: 27"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              Compras feitas até o dia de fechamento entram na fatura do mês atual.
              Após o fechamento, vão para a fatura do próximo mês.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => { setDialogOpen(false); resetForm() }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-primary hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingCard ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Cartão"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
