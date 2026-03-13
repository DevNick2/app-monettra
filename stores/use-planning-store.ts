import { create } from "zustand"
import { api } from "@/lib/api"
import { 
  PlanningEntry, 
  CreatePlanningEntryPayload, 
  UpdatePlanningEntryPayload,
  PlanningHorizonMonthlyData
} from "@/lib/types"
import { format } from "date-fns"
import { startOfMonth, endOfMonth, addMonths } from "date-fns"

interface PlanningStore {
  entries: PlanningEntry[]
  horizon: PlanningHorizonMonthlyData[]
  isLoading: boolean
  error: string | null
  dateRange: { from: Date; to: Date }

  setDateRange: (range: { from: Date; to: Date }) => void
  fetchEntries: () => Promise<void>
  fetchHorizon: () => Promise<void>
  createEntry: (payload: CreatePlanningEntryPayload) => Promise<void>
  updateEntry: (code: string, payload: UpdatePlanningEntryPayload) => Promise<void>
  deleteEntry: (code: string, scope: "this" | "this_and_future") => Promise<void>
  materializeEntry: (code: string) => Promise<void>
}

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  entries: [],
  horizon: [],
  isLoading: false,
  error: null,
  dateRange: {
    from: startOfMonth(new Date()),
    to: addMonths(endOfMonth(new Date()), 12) // Default horizon is 12 months ahead
  },

  setDateRange: (range: { from: Date; to: Date }) => {
    set({ dateRange: range })
    get().fetchEntries()
    get().fetchHorizon()
  },

  fetchEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      const { from, to } = get().dateRange
      const start = format(from, "yyyy-MM-dd")
      const end = format(to, "yyyy-MM-dd")
      const response = await api.get<PlanningEntry[]>(`/planning?start_date=${start}&end_date=${end}`)
      set({ entries: response.data })
    } catch (error: any) {
      set({ error: error.message || "Erro ao carregar provisões." })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchHorizon: async () => {
    set({ isLoading: true, error: null })
    try {
      const { from, to } = get().dateRange
      const start = format(from, "yyyy-MM-dd")
      const end = format(to, "yyyy-MM-dd")
      const response = await api.get<{ horizon: PlanningHorizonMonthlyData[] }>(`/planning/horizon?start_date=${start}&end_date=${end}`)
      set({ horizon: response.data.horizon })
    } catch (error: any) {
      set({ error: error.message || "Erro ao carregar horizonte financeiro." })
    } finally {
      set({ isLoading: false })
    }
  },

  createEntry: async (payload: CreatePlanningEntryPayload) => {
    try {
      await api.post("/planning", payload)
      get().fetchEntries()
      get().fetchHorizon()
    } catch (error: any) {
      throw error
    }
  },

  updateEntry: async (code: string, payload: UpdatePlanningEntryPayload) => {
    try {
      await api.put(`/planning/${code}`, payload)
      get().fetchEntries()
      get().fetchHorizon()
    } catch (error: any) {
      throw error
    }
  },

  deleteEntry: async (code: string, scope: "this" | "this_and_future") => {
    try {
      await api.delete(`/planning/${code}?scope=${scope}`)
      get().fetchEntries()
      get().fetchHorizon()
    } catch (error: any) {
      throw error
    }
  },

  materializeEntry: async (code: string) => {
    try {
      await api.post(`/planning/${code}/materialize`)
      get().fetchEntries()
      get().fetchHorizon()
    } catch (error: any) {
      throw error
    }
  }
}))
