import { create } from "zustand"
import { api } from "@/lib/api"
import type {
  CreditCard,
  Invoice,
  CreateCreditCardPayload,
  UpdateCreditCardPayload,
  CreateCreditCardChargePayload,
} from "@/lib/types"

interface CreditCardsState {
  cards: CreditCard[]
  invoices: Invoice[]
  isLoading: boolean
  isLoadingInvoices: boolean

  fetchCards: () => Promise<void>
  createCard: (payload: CreateCreditCardPayload) => Promise<void>
  updateCard: (code: string, payload: UpdateCreditCardPayload) => Promise<void>
  deleteCard: (code: string) => Promise<void>

  fetchInvoices: (cardCode: string) => Promise<void>
  createCharge: (payload: CreateCreditCardChargePayload) => Promise<Invoice[]>
  payInvoice: (invoiceCode: string) => Promise<void>
}

export const useCreditCardsStore = create<CreditCardsState>((set, get) => ({
  cards: [],
  invoices: [],
  isLoading: false,
  isLoadingInvoices: false,

  fetchCards: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get<CreditCard[]>("/credit-cards/")
      set({ cards: res.data })
    } finally {
      set({ isLoading: false })
    }
  },

  createCard: async (payload) => {
    const res = await api.post<CreditCard>("/credit-cards/", payload)
    set((s) => ({ cards: [...s.cards, res.data] }))
  },

  updateCard: async (code, payload) => {
    const res = await api.put<CreditCard>(`/credit-cards/${code}`, payload)
    set((s) => ({
      cards: s.cards.map((c) => (c.code === code ? res.data : c)),
    }))
  },

  deleteCard: async (code) => {
    await api.delete(`/credit-cards/${code}`)
    set((s) => ({ cards: s.cards.filter((c) => c.code !== code) }))
  },

  fetchInvoices: async (cardCode) => {
    set({ isLoadingInvoices: true })
    try {
      const res = await api.get<Invoice[]>(`/credit-cards/${cardCode}/invoices`)
      set({ invoices: res.data })
    } finally {
      set({ isLoadingInvoices: false })
    }
  },

  createCharge: async (payload) => {
    const res = await api.post<Invoice[]>("/credit-cards/charge", payload)
    return res.data
  },

  payInvoice: async (invoiceCode) => {
    const res = await api.patch<Invoice>(`/credit-cards/invoices/${invoiceCode}/pay`)
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.code === invoiceCode ? res.data : inv
      ),
    }))
  },
}))
