// ============================================================
// Monettra — Categories Store (Zustand)
// CRUD de categorias integrado à API real
// ============================================================

import { create } from "zustand"
import { api } from "@/lib/api"
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/lib/types"

interface CategoriesState {
  categories: Category[]
  isLoading: boolean
  error: string | null
}

interface CategoriesActions {
  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryPayload) => Promise<void>
  updateCategory: (code: string, data: UpdateCategoryPayload) => Promise<void>
  deleteCategory: (code: string) => Promise<void>
  clearError: () => void
}

type CategoriesStore = CategoriesState & CategoriesActions

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  // ── Fetch ─────────────────────────────────────────────────
  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Category[]>("/categories")
      set({ categories: data, isLoading: false })
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao carregar categorias"
      set({ isLoading: false, error: message })
    }
  },

  // ── Create ────────────────────────────────────────────────
  createCategory: async (data: CreateCategoryPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.post("/categories", data)
      await get().fetchCategories()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao criar categoria"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Update ────────────────────────────────────────────────
  updateCategory: async (code: string, data: UpdateCategoryPayload) => {
    set({ isLoading: true, error: null })
    try {
      await api.put(`/categories/${code}`, data)
      await get().fetchCategories()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao atualizar categoria"
      set({ isLoading: false, error: message })
      throw err
    }
  },

  // ── Delete ────────────────────────────────────────────────
  deleteCategory: async (code: string) => {
    set({ error: null })
    try {
      await api.delete(`/categories/${code}`)
      await get().fetchCategories()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao remover categoria"
      set({ error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
