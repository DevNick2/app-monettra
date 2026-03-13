// ============================================================
// Monettra — Transactions Store (Zustand)
// CRUD de lançamentos integrado à API real
// ============================================================

import { create } from "zustand"
import { api } from "@/lib/api"
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "@/lib/types"

interface TransactionsState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  activeMonth: number | null
  activeYear: number | null
}

interface TransactionsActions {
  fetchTransactions: (month?: number, year?: number) => Promise<void>
  createTransaction: (data: CreateTransactionPayload) => Promise<void>
  payTransaction: (code: string) => Promise<void>
  updateTransaction: (code: string, data: UpdateTransactionPayload) => Promise<void>
  deleteTransaction: (code: string) => Promise<void>
  clearError: () => void
}

type TransactionsStore = TransactionsState & TransactionsActions

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  activeMonth: null,
  activeYear: null,

  // ── Fetch ─────────────────────────────────────────────────
  fetchTransactions: async (month?: number, year?: number) => {
    const params: Record<string, number> = {}
    const m = month ?? get().activeMonth
    const y = year ?? get().activeYear
    if (m !== null && m !== undefined) params.month = m
    if (y !== null && y !== undefined) params.year = y

    set({ isLoading: true, error: null, activeMonth: m ?? null, activeYear: y ?? null })
    try {
      const { data } = await api.get<Transaction[]>("/transactions", { params })
      set({ transactions: data, isLoading: false })
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao carregar lançamentos"
      set({ isLoading: false, error: message })
    }
  },

  // ── Create ────────────────────────────────────────────────
  createTransaction: async (data: CreateTransactionPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.post("/transactions", data)
      await get().fetchTransactions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao criar lançamento"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Pay (toggle is_paid) ──────────────────────────────────
  payTransaction: async (code: string) => {
    set({ error: null })
    try {
      const { data } = await api.patch<Transaction>(`/transactions/${code}/pay`)
      set((state) => ({
        transactions: state.transactions.map((t) => (t.code === code ? data : t)),
      }))
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao atualizar status"
      set({ error: message })
      throw err
    }
  },

  // ── Update ────────────────────────────────────────────────
  updateTransaction: async (code: string, data: UpdateTransactionPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.put(`/transactions/${code}`, data)
      await get().fetchTransactions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao atualizar lançamento"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Delete ────────────────────────────────────────────────
  deleteTransaction: async (code: string) => {
    set({ error: null })
    try {
      await api.delete(`/transactions/${code}`)
      await get().fetchTransactions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao remover lançamento"
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
