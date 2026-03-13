// ============================================================
// Monettra — Auth Store (Zustand)
// Gerencia autenticação JWT ponta-a-ponta
// ============================================================

import { create } from "zustand"
import { api, TOKEN_KEY } from "@/lib/api"
import type { User, LoginPayload, LoginResponse } from "@/lib/types"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

function setAuthCookie(token: string) {
  // Salva o token em cookie não-HttpOnly para o middleware SSR conseguir ler
  const maxAge = 60 * 60 * 24 * 7 // 7 dias
  document.cookie = `monettra_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearAuthCookie() {
  document.cookie = "monettra_auth_token=; path=/; max-age=0"
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // ── Login ─────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // 1. Autenticar e obter token
      const { data: authData } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      } satisfies LoginPayload)

      const token = authData.access_token

      // 2. Persistir token no localStorage + cookie (para middleware SSR)
      localStorage.setItem(TOKEN_KEY, token)
      setAuthCookie(token)

      // 3. Buscar dados do usuário logado
      const { data: userData } = await api.get<User>("/auth/me")

      set({ token, user: userData, isLoading: false })
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Credenciais inválidas"
      set({ isLoading: false, error: message, token: null, user: null })
      throw new Error(message)
    }
  },

  // ── Logout ────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    clearAuthCookie()
    set({ user: null, token: null, error: null })
  },

  // ── Hidratar do Storage ───────────────────────────────────
  // Chamado no layout raiz do app para restaurar sessão
  loadFromStorage: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null

    if (!token) {
      set({ isLoading: false })
      return
    }

    set({ isLoading: true, token })
    try {
      const { data: userData } = await api.get<User>("/auth/me")
      set({ user: userData, isLoading: false })
    } catch {
      // Token inválido ou expirado — limpar tudo
      localStorage.removeItem(TOKEN_KEY)
      clearAuthCookie()
      set({ user: null, token: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
