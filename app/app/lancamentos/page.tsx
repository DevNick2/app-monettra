"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Transaction {
  id: string
  title: string
  date: string
  value: number
  type: "entrada" | "saida"
  status: "pago" | "pendente"
}

const initialTransactions: Transaction[] = [
  { id: "1", title: "Salario", date: "2026-02-05", value: 8500, type: "entrada", status: "pago" },
  { id: "2", title: "Aluguel", date: "2026-02-10", value: 1800, type: "saida", status: "pago" },
  { id: "3", title: "Supermercado", date: "2026-02-12", value: 650, type: "saida", status: "pago" },
  { id: "4", title: "Conta de Luz", date: "2026-02-15", value: 280, type: "saida", status: "pendente" },
  { id: "5", title: "Internet", date: "2026-02-18", value: 120, type: "saida", status: "pendente" },
  { id: "6", title: "Freelance", date: "2026-02-20", value: 2000, type: "entrada", status: "pendente" },
  { id: "7", title: "Academia", date: "2026-02-22", value: 150, type: "saida", status: "pendente" },
  { id: "8", title: "Restaurante", date: "2026-02-25", value: 230, type: "saida", status: "pago" },
]

const months = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export default function LancamentosPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newType, setNewType] = useState<"entrada" | "saida">("saida")

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

  function toggleStatus(id: string) {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "pago" ? "pendente" : "pago" }
          : t
      )
    )
  }

  function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    const transaction: Transaction = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      value: parseFloat(newValue),
      type: newType,
      status: "pendente",
    }
    setTransactions([...transactions, transaction])
    setNewTitle("")
    setNewDate("")
    setNewValue("")
    setNewType("saida")
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Lancamentos
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Lancamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Novo Lancamento</DialogTitle>
              <DialogDescription>
                Adicione uma nova transacao ao seu controle financeiro
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  placeholder="Ex: Conta de agua"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as "entrada" | "saida")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[180px] text-center font-heading text-lg font-semibold text-foreground">
          {months[currentMonth]} {currentYear}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Proximo mes">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Transacoes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Titulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acao
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {t.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${
                      t.type === "entrada" ? "text-success" : "text-destructive"
                    }`}>
                      {t.type === "entrada" ? "+" : "-"}
                      {t.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={t.status === "pago" ? "default" : "secondary"}
                        className={t.status === "pago"
                          ? "bg-success/10 text-success hover:bg-success/20 border-0"
                          : "bg-accent/20 text-accent-foreground border-0"
                        }
                      >
                        {t.status === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(t.id)}
                        className={`gap-1 text-xs ${
                          t.status === "pago"
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-success hover:text-success"
                        }`}
                      >
                        {t.status === "pago" ? (
                          <>
                            <Clock className="h-3 w-3" />
                            Desfazer
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3" />
                            Pagar
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-2 p-4 md:hidden">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{t.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                  </span>
                  <Badge
                    variant={t.status === "pago" ? "default" : "secondary"}
                    className={`w-fit text-[10px] ${t.status === "pago"
                      ? "bg-success/10 text-success hover:bg-success/20 border-0"
                      : "bg-accent/20 text-accent-foreground border-0"
                    }`}
                  >
                    {t.status === "pago" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-sm font-bold ${
                    t.type === "entrada" ? "text-success" : "text-destructive"
                  }`}>
                    {t.type === "entrada" ? "+" : "-"}
                    {t.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(t.id)}
                    className={`h-7 gap-1 px-2 text-[10px] ${
                      t.status === "pago"
                        ? "text-muted-foreground"
                        : "text-success"
                    }`}
                  >
                    {t.status === "pago" ? (
                      <>
                        <Clock className="h-3 w-3" />
                        Desfazer
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        Pagar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
