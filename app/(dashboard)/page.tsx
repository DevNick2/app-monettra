"use client"

import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart"
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart"

const currentMonth = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

export default function DashboardPage() {
  const totalIncome = 8500
  const totalExpense = 5230
  const predictedBalance = totalIncome - totalExpense

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground capitalize">
          {currentMonth}
        </h1>
        <p className="text-sm text-muted-foreground">
          Visao geral das suas financas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-lg font-bold text-foreground">
                {totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saidas</p>
              <p className="text-lg font-bold text-foreground">
                {totalExpense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Previsto</p>
              <p className="text-lg font-bold text-foreground">
                {predictedBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-base">Entradas vs Saidas</CardTitle>
            <CardDescription>Comparativo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-base">Gastos por Categoria</CardTitle>
            <CardDescription>Distribuicao do mes atual</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
