import { create } from "zustand"
import { api } from "@/lib/api"
import { format as formatDt } from "date-fns"

export interface CategoryData {
  category_name: string
  category_color: string
  total: number
}

export interface AccumulatedData {
  label: string
  total: number
}

export interface TrendData {
  category_code: string
  category_name: string
  category_color: string
  history: number[]
  m: number
  b: number
  r2: number
  projected_total: number
}

interface AnalyticsStore {
  dateRange: { from: Date; to: Date }
  currentYear: number
  
  byCategoryData: CategoryData[]
  accumulatedData: AccumulatedData[]
  trendData: TrendData[]

  groupBy: "day" | "week"
  selectedCategoryIds: string[]
  
  isLoadingCategory: boolean
  isLoadingAccumulated: boolean
  isLoadingTrend: boolean
  
  errorCategory: string | null
  errorAccumulated: string | null
  errorTrend: string | null

  setDateRange: (range: { from: Date; to: Date }) => void
  setGroupBy: (groupBy: "day" | "week") => void
  addCategoryFilter: (id: string) => void
  removeCategoryFilter: (id: string) => void
  
  fetchByCategory: () => Promise<void>
  fetchAccumulated: () => Promise<void>
  fetchTrendByCategory: () => Promise<void>
}

// Inicializando com o mês atual para DateRange e Mensal isolado
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  dateRange: { from: firstDay, to: lastDay },
  
  // Usado ano base para o Trend Data
  currentYear: today.getFullYear(),
  
  byCategoryData: [],
  accumulatedData: [],
  trendData: [],

  groupBy: "day",
  selectedCategoryIds: [], // Deve inicializar vazio
  
  isLoadingCategory: false,
  isLoadingAccumulated: false,
  isLoadingTrend: false,

  errorCategory: null,
  errorAccumulated: null,
  errorTrend: null,

  setDateRange: (range) => {
    set({ dateRange: range })
    // Only re-fetch charts depending on dateRange
    get().fetchByCategory()
    get().fetchAccumulated()
  },

  setGroupBy: (groupBy) => {
    set({ groupBy })
    get().fetchAccumulated()
  },

  addCategoryFilter: (id) => {
    const current = get().selectedCategoryIds
    if (!current.includes(id)) {
      set({ selectedCategoryIds: [...current, id] })
      get().fetchTrendByCategory()
    }
  },

  removeCategoryFilter: (id) => {
    set({ selectedCategoryIds: get().selectedCategoryIds.filter(v => v !== id) })
    get().fetchTrendByCategory()
  },

  fetchByCategory: async () => {
    set({ isLoadingCategory: true, errorCategory: null })
    try {
      const { dateRange } = get()
      const startStr = formatDt(dateRange.from, "yyyy-MM-dd")
      const endStr = formatDt(dateRange.to, "yyyy-MM-dd")

      const { data } = await api.get<CategoryData[]>("/analytics/by-category", {
        params: { start_date: startStr, end_date: endStr }
      })
      set({ byCategoryData: data, isLoadingCategory: false })
    } catch (error: any) {
      set({ errorCategory: "Erro ao buscar dados", isLoadingCategory: false })
    }
  },

  fetchAccumulated: async () => {
    set({ isLoadingAccumulated: true, errorAccumulated: null })
    try {
      const { dateRange, groupBy } = get()
      const startStr = formatDt(dateRange.from, "yyyy-MM-dd")
      const endStr = formatDt(dateRange.to, "yyyy-MM-dd")

      const { data } = await api.get<AccumulatedData[]>("/analytics/accumulated", {
        params: { start_date: startStr, end_date: endStr, group_by: groupBy }
      })
      set({ accumulatedData: data, isLoadingAccumulated: false })
    } catch (error: any) {
      set({ errorAccumulated: "Erro ao buscar dados", isLoadingAccumulated: false })
    }
  },

  fetchTrendByCategory: async () => {
    set({ isLoadingTrend: true, errorTrend: null })
    try {
      const { currentYear, selectedCategoryIds } = get()
      
      // Se não houver categorias, limpamos o array e não buscamos
      if (selectedCategoryIds.length === 0) {
        set({ trendData: [], isLoadingTrend: false })
        return
      }
      
      const queryParams = new URLSearchParams()
      queryParams.append("year", currentYear.toString())
      
      selectedCategoryIds.forEach(id => {
        queryParams.append("category_codes", id)
      })

      const { data } = await api.get<TrendData[]>(`/analytics/trend-by-category?${queryParams.toString()}`)
      set({ trendData: data, isLoadingTrend: false })
    } catch (error: any) {
      set({ errorTrend: "Erro ao buscar dados", isLoadingTrend: false })
    }
  }
}))
