"use client"

import React, { useEffect, useState } from "react"
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePlanningStore } from "@/stores/use-planning-store"
import { useCategoriesStore } from "@/stores/use-categories-store"
import { TransactionEntryModal, TransactionEntryData } from "@/components/TransactionEntryModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

export default function PlanningPage() {
  const {
    horizon,
    isLoading,
    setDateRange,
    fetchHorizon,
    createEntry,
  } = usePlanningStore()

  const { categories, fetchCategories } = useCategoriesStore()

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch data when month/year changes
  useEffect(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    setDateRange({ from: firstDay, to: lastDay })
    fetchHorizon()
  }, [currentMonth, currentYear, setDateRange, fetchHorizon])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleCreate = async (data: TransactionEntryData) => {
    setIsSaving(true)
    try {
      const parts = data.dueDate.split("-")
      const brDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : data.dueDate

      const payload: any = {
        title: data.title,
        amount: data.amount,
        type: data.type,
        due_date: brDate,
        description: data.description || null,
        category_code: data.categoryCode !== "none" ? data.categoryCode : null,
        installments: data.installments,
      }

      await createEntry(payload)
      toast.success("Provisão criada com sucesso.")
      setIsModalOpen(false)
      fetchHorizon()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar provisão.")
    } finally {
      setIsSaving(false)
    }
  }

  // Extracted current month string "Março"
  const currentMonthName = months[currentMonth]
  
  // Parse data
  const currentData = horizon?.[0] || { categories: [], net_balance: 0 }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ScrollText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Planejamento</h1>
            <p className="text-muted-foreground text-sm">Visão do horizonte consolidado</p>
          </div>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg transition-all hover:scale-105">
          <Plus className="h-4 w-4" />
          Adicionar Valor
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Navegador de mês */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-2 border-b border-border border-dashed pb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center rounded-lg bg-secondary/30 p-1">
              {months.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setCurrentMonth(idx)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    currentMonth === idx
                      ? "bg-background shadow-sm text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hidden md:block" // Hide non-selected on mobile to fit
                  )}
                >
                  {m}
                </button>
              ))}
              {/* Show only selected on mobile */}
              <button className="px-3 py-1.5 text-sm font-medium rounded-md transition-all bg-background shadow-sm text-foreground font-semibold md:hidden">
                {currentMonthName}
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={currentYear.toString()} onValueChange={(val) => setCurrentYear(parseInt(val))}>
            <SelectTrigger className="w-24 border-border font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Categorias */}
        <Card className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">Carregando...</div>
          ) : currentData.categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <CalendarIcon className="h-10 w-10 opacity-20 mb-2" />
              <p>Nenhum registro encontrado para {currentMonthName} de {currentYear}.</p>
            </div>
          ) : (
            <div className="min-w-[400px]">
              {/* Cabeçalho */}
              <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] min-w-max border-b border-border bg-muted/40">
                <div className="p-4 font-semibold text-muted-foreground border-r border-border">Categoria</div>
                <div className="p-4 text-center font-heading font-medium tracking-wider uppercase">Balanço ({currentMonthName})</div>
              </div>

              {/* Linhas */}
              {currentData.categories.map((cat, idx) => {
                const net = (cat.real_income + cat.projected_income) - (cat.real_expense + cat.projected_expense)
                return (
                  <div key={idx} className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] min-w-max border-b border-border hover:bg-muted/10 transition-colors">
                    <div className="p-3 font-medium text-sm text-foreground bg-secondary/20 flex items-center gap-2 border-r border-border">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: cat.category_color || 'currentColor', opacity: cat.category_color ? 1 : 0.2 }}
                      />
                      {cat.category_name}
                    </div>
                    <div className={cn("p-3 text-center font-mono text-sm", net >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {net.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </div>
                )
              })}

              {/* Saldo Acumulado */}
              <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] min-w-max bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="p-3 font-medium text-sm text-foreground flex items-center gap-2 border-r border-primary/20">
                  Saldo Acumulado do Mês
                </div>
                <div className="p-3 flex flex-col items-center justify-center gap-1">
                  <span className={cn("font-mono text-base font-semibold", currentData.net_balance >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {currentData.net_balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <TransactionEntryModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode="create"
        module="planning"
        categories={categories}
        onSubmit={handleCreate}
        isSaving={isSaving}
      />
    </div>
  )
}
