"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CreditCard,
} from "lucide-react"
import {
  SiTwitch,
  SiYoutube,
  SiSpotify,
  SiNetflix,
  SiApple,
  SiParamountplus,
  SiHbomax,
  SiGoogle
} from "@icons-pack/react-simple-icons"
import { toast } from "sonner"
import { format, parseISO, differenceInCalendarDays, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { cn } from "@/lib/utils"
import { useSubscriptionsStore } from "@/stores/use-subscriptions-store"
import type {
  Subscription,
  RecurrenceType,
  SubscriptionPaymentMethod,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from "@/lib/types"

// ─── Configurações ────────────────────────────────────────────
const recurrenceLabels: Record<RecurrenceType, string> = {
  monthly: "Mensal",
  yearly: "Anual",
}

// Ícones disponíveis para seleção — serviços conhecidos + genéricos
const ICON_OPTIONS = [
  { name: "YouTube", icon: SiYoutube },
  { name: "Netflix", icon: SiNetflix },
  { name: "Spotify", icon: SiSpotify },
  { name: "Twitch", icon: SiTwitch },
  { name: "HBO Max", icon: SiHbomax },
  { name: "Amazon Prime", icon: "" },
  { name: "Apple TV+", icon: SiApple },
  { name: "Disney+", icon: "" },
  { name: "Paramount+", icon: SiParamountplus },
  { name: "Globoplay", icon: "" },
  { name: "Google One", icon: SiGoogle },
]

// ─── Helpers de data ──────────────────────────────────────────
function parseBrDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  try {
    if (dateStr.includes("/")) {
      return parse(dateStr, "dd/MM/yyyy", new Date())
    }
    return parseISO(dateStr)
  } catch {
    return null
  }
}

function formatInputToIso(brDate: string): string {
  if (!brDate) return ""
  const [dd, mm, yyyy] = brDate.split("/")
  if (!dd || !mm || !yyyy) return ""
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplayDate(dateStr: string | null | undefined): string {
  const parsed = parseBrDate(dateStr)
  if (!parsed) return dateStr || ""
  const d = format(parsed, "d")
  const month = format(parsed, "MMMM", { locale: ptBR })
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
  return `${d} de ${capitalizedMonth}`
}

// ─── Componente: Status de Vencimento ─────────────────────────
function RenewalStatus({ billingDate, isActive }: { billingDate: string | null; isActive: boolean }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!billingDate || !isActive) return null

  const renewal = parseBrDate(billingDate)
  if (!renewal) return null

  const diff = differenceInCalendarDays(renewal, today)

  let icon, color, tooltip

  if (diff < 0) {
    icon = <AlertTriangle className="h-5 w-5" />
    color = "text-destructive"
    tooltip = "Já venceu"
  } else if (diff === 0) {
    icon = <AlertTriangle className="h-5 w-5" />
    color = "text-destructive"
    tooltip = "Vencendo hoje"
  } else if (diff <= 15) {
    icon = <Clock className="h-5 w-5" />
    color = "text-amber-500"
    tooltip = `Vence em ${diff} dia${diff === 1 ? "" : "s"}`
  } else {
    icon = <CheckCircle2 className="h-5 w-5" />
    color = "text-success"
    tooltip = `Renova em ${diff} dias`
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-default", color)}>{icon}</span>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Componente Principal ──────────────────────────────────────
export default function AssinaturasPage() {
  const {
    subscriptions,
    isLoading,
    fetchSubscriptions,
    createSubscription,
    toggleSubscription,
    updateSubscription,
    deleteSubscription,
    renewSubscription,
  } = useSubscriptionsStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAndNew, setIsSavingAndNew] = useState(false)
  const [renewingCode, setRenewingCode] = useState<string | null>(null)

  // ─── Form states ──────────────────────────────────────────────
  const [provider, setProvider] = useState("")
  const [amount, setAmount] = useState("")
  const [recurrence, setRecurrence] = useState<RecurrenceType>("monthly")
  const [billingDate, setBillingDate] = useState("") // valor do input[type=date] YYYY-MM-DD
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>("default")

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // ─── Resumo de custos (apenas ativas) ─────────────────────────
  const summary = useMemo(() => {
    let monthlyTotal = 0
    subscriptions.forEach((s) => {
      if (!s.is_active) return
      const valStr = s.amount || "0"
      const clean = valStr.replace(/\./g, "").replace(",", ".")
      const val = parseFloat(clean) || 0

      switch (s.recurrence) {
        case "monthly": monthlyTotal += val; break
        case "yearly": monthlyTotal += val / 12; break
      }
    })
    const activeCount = subscriptions.filter((s) => s.is_active).length
    const inactiveCount = subscriptions.filter((s) => !s.is_active).length
    return { monthlyTotal, activeCount, inactiveCount, total: subscriptions.length }
  }, [subscriptions])

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  // ─── Reset do formulário ──────────────────────────────────────
  const resetForm = useCallback(() => {
    setProvider("")
    setAmount("")
    setRecurrence("monthly")
    setBillingDate("")
    setDescription("")
    setPaymentMethod("default")
    setEditingSubscription(null)
  }, [])

  function openNewDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(s: Subscription) {
    setEditingSubscription(s)
    setProvider(s.provider)
    setAmount(s.amount)
    setRecurrence(s.recurrence)
    setBillingDate(s.billing_date ? formatInputToIso(s.billing_date) : "")
    setDescription(s.description ?? "")
    setPaymentMethod(s.payment_method ?? "default")
    setDialogOpen(true)
  }

  // ─── Build payload ─────────────────────────────────────────────
  function buildPayload(): CreateSubscriptionPayload | UpdateSubscriptionPayload {
    let brDate: string | null = null
    if (billingDate) {
      const [yyyy, mm, dd] = billingDate.split("-")
      brDate = `${dd}/${mm}/${yyyy}`
    }
    return {
      provider,
      amount,
      recurrence,
      billing_date: brDate,
      description: description || null,
      payment_method: paymentMethod,
    }
  }

  // ─── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.code, buildPayload() as UpdateSubscriptionPayload)
        toast.success("Assinatura atualizada com sucesso!")
      } else {
        await createSubscription(buildPayload() as CreateSubscriptionPayload)
        toast.success("Assinatura criada com sucesso!")
      }
      setDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Erro ao salvar assinatura. Verifique os dados.")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Salvar e Criar Outro ──────────────────────────────────────
  async function handleSaveAndNew(e: React.MouseEvent) {
    e.preventDefault()
    if (!provider || !amount) {
      toast.error("Preencha os campos obrigatórios antes de salvar.")
      return
    }
    setIsSavingAndNew(true)
    try {
      await createSubscription(buildPayload() as CreateSubscriptionPayload)
      toast.success("Assinatura salva! Formulário pronto para novo registro.")
      setProvider("")
      setAmount("")
      setDescription("")
      // Mantém recorrência, billing_date e ícone selecionado para agilizar
    } catch {
      toast.error("Erro ao salvar assinatura.")
    } finally {
      setIsSavingAndNew(false)
    }
  }

  async function handleToggle(s: Subscription) {
    try {
      await toggleSubscription(s.code)
      toast.success(s.is_active ? "Assinatura desativada" : "Assinatura ativada!")
    } catch {
      toast.error("Erro ao atualizar status.")
    }
  }

  async function handleDelete(code: string) {
    try {
      await deleteSubscription(code)
      toast.success("Assinatura removida.")
    } catch {
      toast.error("Erro ao remover assinatura.")
    }
  }

  async function handleRenew(code: string) {
    setRenewingCode(code)
    try {
      await renewSubscription(code)
      toast.success("Assinatura renovada!")
    } catch {
      toast.error("Erro ao renovar assinatura.")
    } finally {
      setRenewingCode(null)
    }
  }

  const isSubmitting = isSaving || isSavingAndNew

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            Assinaturas
          </h1>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="gap-2 shadow-lg transition-all hover:scale-105 bg-primary text-white hover:bg-primary/90 cursor-pointer"
                onClick={openNewDialog}
              >
                <Plus className="h-4 w-4" />
                Nova Assinatura
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {editingSubscription ? "Editar Assinatura" : "Nova Assinatura"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
                {/* 2. Serviço + Data da Assinatura */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="provider"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Serviço
                    </Label>

                    <Select
                      value={provider}
                      onValueChange={(val) => {
                        setProvider(val)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map((opt) => (
                          <SelectItem key={opt.name} value={opt.name}>
                            <div className="flex items-center gap-2">
                              {opt.icon && typeof opt.icon !== "string" ? <opt.icon className="h-4 w-4" /> : null}
                              <span>{opt.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="billing_date"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Data da Assinatura
                    </Label>
                    <Input
                      id="billing_date"
                      type="date"
                      value={billingDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBillingDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. Valor */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="amount"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Valor (R$)
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0,00"
                    className="text-lg font-bold"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "")
                      if (!onlyDigits) { setAmount(""); return }
                      const numericValue = parseInt(onlyDigits, 10) / 100
                      setAmount(numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                    }}
                    required
                  />
                </div>

                {/* 4. Recorrência — col-span-full */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recorrência
                  </Label>
                  <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
                    <SelectTrigger className="cursor-pointer w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(recurrenceLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="cursor-pointer">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. Notas (opcional) */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Notas (Opcional)
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Informações adicionais sobre a assinatura..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    rows={2}
                    className="flex min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {/* 5.5 Método de Pagamento */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === "credit_card" ? "default" : "credit_card")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer w-full",
                    paymentMethod === "credit_card"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/20 hover:bg-secondary/30"
                  )}
                >
                  <CreditCard
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      paymentMethod === "credit_card" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        paymentMethod === "credit_card" ? "text-primary" : "text-foreground"
                      )}
                    >
                      Pago via Cartão de Crédito
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {paymentMethod === "credit_card"
                        ? "Os lançamentos serão marcados com badge de cartão"
                        : "Despesa comum sem vinculação a cartão"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 transition-all shrink-0",
                      paymentMethod === "credit_card"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  />
                </button>

                {/* 6. Botões */}
                <div className="flex gap-2 mt-1">
                  {!editingSubscription && (
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
                    className="flex-1 h-11 text-base font-bold bg-primary text-white hover:bg-primary/90 cursor-pointer transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="animate-pulse bg-primary/50 rounded h-3 w-20 inline-block" />
                      </>
                    ) : editingSubscription ? (
                      "Salvar Alterações"
                    ) : (
                      "Criar Assinatura"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Custo Mensal Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(summary.monthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">baseado nas assinaturas ativas</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.activeCount}</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Desativadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{summary.inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de assinaturas */}
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col gap-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-2 w-20 animate-pulse rounded bg-muted/60" />
                    </div>
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-muted-foreground">
                <RefreshCw className="h-10 w-10 opacity-20" />
                <p className="text-sm">Nenhuma assinatura cadastrada</p>
                <Button variant="outline" size="sm" className="mt-2 cursor-pointer" onClick={openNewDialog}>
                  Adicionar primeira assinatura
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {subscriptions.map((s: Subscription) => (
                      <tr
                        key={s.code}
                        className={cn(
                          "group border-b border-border transition-all last:border-b-0",
                          s.is_active
                            ? "hover:bg-secondary/30"
                            : "opacity-50 hover:opacity-75 bg-secondary/10"
                        )}
                      >
                        {/* Ícone */}
                        <td className="px-4 py-4 text-center w-14">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-transform group-hover:scale-110",
                              s.is_active ? "bg-primary/10" : "bg-secondary"
                            )}
                            title={ICON_OPTIONS.find((o) => o.name === s.provider)?.name ?? "Serviço"}
                          >
                            {(() => {
                              const found = ICON_OPTIONS.find((o) => o.name === s.provider)
                              if (found && found.icon && typeof found.icon !== "string") {
                                return <found.icon className="h-5 w-5" />
                              }
                              return <span className="text-sm font-bold uppercase">{s.provider?.substring(0, 2) ?? "?"}</span>
                            })()}
                          </div>
                        </td>

                        {/* Provedor + recorrência */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground">{s.provider}</span>
                            <span className="text-xs text-muted-foreground">{recurrenceLabels[s.recurrence]}</span>
                          </div>
                        </td>

                        {/* Data com tooltip da data completa */}
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {s.billing_date ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-default">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span>Renova em {formatDisplayDate(s.billing_date)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{s.billing_date}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Valor + badge de cartão */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-bold text-destructive">R$ {s.amount}</span>
                            {s.payment_method === "credit_card" && (
                              <span className="flex items-center gap-1 text-xs text-primary/80 font-medium">
                                <CreditCard className="h-3 w-3" />
                                Cartão
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Coluna de vencimento */}
                        <td className="px-4 py-4 text-center w-10">
                          <RenewalStatus billingDate={s.billing_date} isActive={s.is_active} />
                        </td>

                        {/* Toggle ativo/inativo (maior para Fitts' Law) */}
                        <td className="px-4 py-4 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggle(s)}
                                className={cn(
                                  "cursor-pointer transition-all rounded-lg",
                                  s.is_active
                                    ? "text-success hover:bg-secondary"
                                    : "text-muted-foreground hover:text-success hover:bg-success/15"
                                )}
                              >
                                {s.is_active ? (
                                  <ToggleRight className="size-6" />
                                ) : (
                                  <ToggleLeft className="size-6" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p className="text-xs">{s.is_active ? "Desativar assinatura" : "Ativar assinatura"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>

                        {/* Ações: renovar + editar + remover */}
                        <td className="px-2 py-4 text-center">
                          <div className="flex items-center gap-1">
                            {s.is_active && s.billing_date && (() => {
                              const bd = parseBrDate(s.billing_date)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return bd && bd <= today
                            })() && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRenew(s.code)}
                                    disabled={renewingCode === s.code}
                                    className="h-7 w-7 cursor-pointer text-primary hover:text-primary hover:bg-primary/10"
                                    aria-label="Renovar assinatura"
                                  >
                                    {renewingCode === s.code ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p className="text-xs">Renovar assinatura</p>
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(s)}
                              className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                              aria-label="Editar assinatura"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                                  aria-label="Remover assinatura"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-heading">
                                    Remover assinatura
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover a assinatura{" "}
                                    <span className="font-medium">{s.provider}</span>? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(s.code)}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
