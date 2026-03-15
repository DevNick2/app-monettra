"use client"

import React, { useEffect, useState } from "react"
import { BarChart2, PieChart as PieChartIcon, TrendingUp, X, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart } from "@mui/x-charts/PieChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { LineChart } from "@mui/x-charts/LineChart"
import { useAnalyticsStore } from "@/stores/use-analytics-store"
import { useCategoriesStore } from "@/stores/use-categories-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format as formatDt } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {
  const {
    dateRange,
    byCategoryData,
    accumulatedData,
    trendData,
    groupBy,
    selectedCategoryIds,
    isLoadingCategory,
    isLoadingAccumulated,
    isLoadingTrend,
    errorCategory,
    errorAccumulated,
    errorTrend,
    setDateRange,
    setGroupBy,
    addCategoryFilter,
    removeCategoryFilter,
    fetchByCategory,
    fetchAccumulated,
    fetchTrendByCategory,
  } = useAnalyticsStore()

  const { categories, fetchCategories } = useCategoriesStore()
  const [catToAdd, setCatToAdd] = useState<string>("")

  // Local state para o Calendar Picker (para evitar requisições a cada clique do range)
  const [localRange, setLocalRange] = useState<{ from?: Date; to?: Date } | undefined>()

  useEffect(() => {
    if (dateRange) {
      setLocalRange(dateRange)
    }
  }, [dateRange])

  useEffect(() => {
    fetchByCategory()
    fetchAccumulated()
    fetchTrendByCategory()
    fetchCategories()
  }, [fetchByCategory, fetchAccumulated, fetchTrendByCategory, fetchCategories])

  // Aplicar Range
  const applyDateRange = () => {
    if (localRange?.from && localRange?.to) {
      setDateRange({ from: localRange.from, to: localRange.to })
    }
  }

  // Prepared data for charts
  const top5Categories = [...byCategoryData].sort((a, b) => b.total - a.total).slice(0, 5)
  const pieData = top5Categories.map((d, i) => ({
    id: i,
    value: d.total,
    label: d.category_name,
    color: d.category_color,
  }))

  const barXAxis = accumulatedData.map(d => d.label)
  const barSeriesData = accumulatedData.map(d => d.total)

  // O chart de linhas com x-axis categórico
  const lineXAxis = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const lineSeries = trendData.map(d => ({
    data: d.history,
    label: `${d.category_name} (R²: ${(d.r2 * 100).toFixed(0)}%)`,
    color: d.category_color,
  }))

  const handleAddCategory = () => {
    if (catToAdd) {
      addCategoryFilter(catToAdd)
      setCatToAdd("")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          Gráficos e Relatórios
        </h1>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal cursor-pointer bg-card hover:bg-card/80",
                  !localRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localRange?.from ? (
                  localRange.to ? (
                    <>
                      {formatDt(localRange.from, "dd MMM", { locale: ptBR })} -{" "}
                      {formatDt(localRange.to, "dd MMM", { locale: ptBR })}
                    </>
                  ) : (
                    formatDt(localRange.from, "dd MMM", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={localRange?.from}
                selected={localRange as any}
                onSelect={(range) => setLocalRange(range as any)}
                numberOfMonths={2}
                locale={ptBR}
              />
              <div className="p-3 border-t border-border flex justify-end">
                <Button size="sm" onClick={applyDateRange} disabled={!localRange?.from || !localRange?.to}>
                  Aplicar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto,auto] gap-6">
        
        {/* GRÁFICO 1: Distribuição por Categoria (Pie) */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg font-heading text-foreground">
              <span className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Gastos por Categoria
              </span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="text-xs italic bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Exibindo as 5 categorias de maior gasto</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
            {isLoadingCategory ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : errorCategory ? (
              <div className="text-destructive text-sm font-semibold">{errorCategory}</div>
            ) : pieData.length === 0 ? (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <PieChartIcon className="h-10 w-10 opacity-20" />
                Sem gastos registrados neste período
              </div>
            ) : (
              <div className="w-full h-[300px] max-w-lg">
                <PieChart
                  series={[{ data: pieData, innerRadius: 30, paddingAngle: 5, cornerRadius: 5 }]}
                  margin={{ right: 5 }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* GRÁFICO 2: Acumulado do Mês (Bar) */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-heading text-foreground">
                <BarChart2 className="h-5 w-5 text-primary" />
                Acumulado do Período
              </CardTitle>
              <CardDescription>
                Evolução dos gastos ao longo do tempo.
              </CardDescription>
            </div>
            
            <div className="flex rounded-lg bg-secondary/50 p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 px-3 text-xs font-semibold cursor-pointer transition-colors", groupBy === "day" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setGroupBy("day")}
              >
                Dia
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 px-3 text-xs font-semibold cursor-pointer transition-colors", groupBy === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setGroupBy("week")}
              >
                Semana
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            {isLoadingAccumulated ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : errorAccumulated ? (
              <div className="text-destructive text-sm font-semibold">{errorAccumulated}</div>
            ) : barSeriesData.length === 0 ? (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <BarChart2 className="h-10 w-10 opacity-20" />
                Não há dados suficientes neste período
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <BarChart
                  xAxis={[{ scaleType: 'band', data: barXAxis, tickLabelStyle: { fill: 'var(--foreground)' } }]}
                  yAxis={[{ tickLabelStyle: { fill: 'var(--foreground)' } }]}
                  series={[{ data: barSeriesData, color: 'var(--primary)' }]}
                  margin={{ left: 60, bottom: 30 }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* GRÁFICO 3: Tendência por Categoria (Line) */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-heading text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendência por Categoria
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>Evolução das despesas ao longo dos 12 meses do ano e projeção em linha de tendência usando Mínimos Quadrados.</span>
              <span className="text-xs italic bg-secondary/50 p-1 rounded w-fit">
                Baseado no Ano Atual e isolado de outros filtros. (R² mede a previsibilidade de 0% a 100%)
              </span>
            </CardDescription>
            
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 max-w-sm">
                <Select value={catToAdd} onValueChange={setCatToAdd}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="Selecione uma categoria para visualizar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="secondary" onClick={handleAddCategory} disabled={!catToAdd} className="cursor-pointer">
                  Visualizar
                </Button>
              </div>
              
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategoryIds.map(id => {
                    const cat = categories.find(c => c.code === id)
                    if (!cat) return null
                    return (
                      <div key={id} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                        {cat.title}
                        <button onClick={() => removeCategoryFilter(id)} className="ml-1 rounded-full p-0.5 hover:bg-black/10 cursor-pointer transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            {isLoadingTrend ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : errorTrend ? (
              <div className="text-destructive text-sm font-semibold">{errorTrend}</div>
            ) : selectedCategoryIds.length === 0 ? (
               <div className="text-muted-foreground text-sm flex flex-col items-center gap-3 bg-secondary/20 p-8 rounded-xl border border-dashed border-border w-full max-w-md">
                 <Select value="" onValueChange={() => {}}>
                   <SelectTrigger className="w-0 h-0 opacity-0 absolute"></SelectTrigger>
                 </Select>
                 <TrendingUp className="h-12 w-12 text-primary/40" />
                 <p className="text-center font-medium">Nenhuma categoria selecionada</p>
                 <p className="text-center text-xs opacity-70">Adicione categorias no filtro acima para visualizar a linha de tendência (OLS) do ano atual.</p>
               </div>
            ) : lineSeries.length === 0 ? (
              <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                <TrendingUp className="h-10 w-10 opacity-20" />
                Sem dados para as categorias selecionadas
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <LineChart
                  xAxis={[{ scaleType: 'point', data: lineXAxis, tickLabelStyle: { fill: 'var(--foreground)' } }]}
                  yAxis={[{ tickLabelStyle: { fill: 'var(--foreground)' } }]}
                  series={lineSeries}
                  margin={{ left: 60, bottom: 30 }}
                />
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
