// ============================================================
// Monettra — Subscriptions Store (Zustand)
// CRUD de assinaturas integrado à API real
// ============================================================

import { create } from "zustand"
import { api } from "@/lib/api"
import type {
  Subscription,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from "@/lib/types"

interface SubscriptionsState {
  subscriptions: Subscription[]
  isLoading: boolean
  error: string | null
}

interface SubscriptionsActions {
  fetchSubscriptions: () => Promise<void>
  createSubscription: (data: CreateSubscriptionPayload) => Promise<void>
  toggleSubscription: (code: string) => Promise<void>
  updateSubscription: (code: string, data: UpdateSubscriptionPayload) => Promise<void>
  deleteSubscription: (code: string) => Promise<void>
  clearError: () => void
}

type SubscriptionsStore = SubscriptionsState & SubscriptionsActions

export const useSubscriptionsStore = create<SubscriptionsStore>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  // ── Fetch ─────────────────────────────────────────────────
  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Subscription[]>("/subscriptions/")
      set({ subscriptions: data, isLoading: false })
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao carregar assinaturas"
      set({ isLoading: false, error: message })
    }
  },

  // ── Create ────────────────────────────────────────────────
  createSubscription: async (data: CreateSubscriptionPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.post("/subscriptions/", data)
      await get().fetchSubscriptions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao criar assinatura"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Toggle Active ─────────────────────────────────────────
  toggleSubscription: async (code: string) => {
    set({ error: null })
    try {
      const { data } = await api.patch<Subscription>(`/subscriptions/${code}/toggle`)
      set((state) => ({
        subscriptions: state.subscriptions.map((s) => (s.code === code ? data : s)),
      }))
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao atualizar assinatura"
      set({ error: message })
      throw err
    }
  },

  // ── Update ────────────────────────────────────────────────
  updateSubscription: async (code: string, data: UpdateSubscriptionPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.put(`/subscriptions/${code}`, data)
      await get().fetchSubscriptions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao atualizar assinatura"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Delete ────────────────────────────────────────────────
  deleteSubscription: async (code: string) => {
    set({ error: null })
    try {
      await api.delete(`/subscriptions/${code}`)
      await get().fetchSubscriptions()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao remover assinatura"
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
