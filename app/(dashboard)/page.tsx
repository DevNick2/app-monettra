"use client"

import { useEffect } from "react"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart"
import { useTransactionsStore } from "@/stores/use-transactions-store"
import { cn } from "@/lib/utils"

const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function DashboardPage() {
  const { summary, fetchSummary, isLoadingSummary } = useTransactionsStore()

  const now = new Date()
  useEffect(() => {
    fetchSummary(now.getMonth() + 1, now.getFullYear())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalIncome = summary?.total_income ?? 0
  const totalExpense = summary?.total_expense ?? 0
  const netBalance = summary?.net_balance ?? 0
  const paidNetBalance = summary?.paid_net_balance ?? 0

  const paidColorClass = isLoadingSummary
    ? "text-muted-foreground/50 animate-pulse"
    : paidNetBalance === 0
    ? "text-foreground"
    : paidNetBalance > 0
    ? "text-success"
    : "text-destructive"

  const paidSignal = paidNetBalance === 0 ? "zero" : paidNetBalance > 0 ? "positivo" : "negativo"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground capitalize">
          {currentMonthLabel}
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das suas finanças
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Entradas */}
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className={cn("text-lg font-bold", isLoadingSummary ? "text-muted-foreground/50 animate-pulse" : "text-foreground")}>
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saídas</p>
              <p className={cn("text-lg font-bold", isLoadingSummary ? "text-muted-foreground/50 animate-pulse" : "text-foreground")}>
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saldo — mesclado (Geral | Realizado) */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Saldo do Mês</p>
            </div>
            <div className="flex items-stretch gap-4">
              {/* Saldo Geral — opacidade reduzida */}
              <div className="flex-1 opacity-90">
                <p className="text-xs text-muted-foreground mb-0.5">Geral</p>
                <p className={cn(
                  "text-lg font-bold",
                  isLoadingSummary
                    ? "text-muted-foreground/50 animate-pulse"
                    : netBalance >= 0
                    ? "text-foreground"
                    : "text-destructive"
                )}>
                  {formatCurrency(netBalance)}
                </p>
              </div>

              <Separator orientation="vertical" className="self-stretch" />

              {/* Saldo Realizado — cor condicional */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Realizado</p>
                <p
                  className={cn("text-lg font-bold", paidColorClass)}
                  aria-label={`Saldo realizado: ${formatCurrency(paidNetBalance)}, ${paidSignal}`}
                >
                  {formatCurrency(paidNetBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-base">Entradas vs Saídas</CardTitle>
            <CardDescription>Comparativo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-base">Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição do mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
