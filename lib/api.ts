// ============================================================
// Monettra — Cliente HTTP Axios
// Interceptors de autenticação JWT e tratamento de erros
// ============================================================

import axios, { AxiosError } from "axios"

const TOKEN_KEY = "monettra_token"

export const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

// ── Interceptor de Request ────────────────────────────────────
// Injeta o token JWT do localStorage em todas as requisições
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Interceptor de Response ───────────────────────────────────
// Trata erros globais de forma padronizada
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as Record<string, unknown> | undefined

    // Outros erros → repassar a message/detail da resposta padronizada
    const message =
      (data?.message as string) ||
      (data?.detail as string) ||
      error.message ||
      "Ocorreu um erro inesperado"

    // 401 → Limpar token e redirecionar para /login (apenas se não estiver no login)
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY)
        // Limpar também o cookie de auth usado pelo middleware
        document.cookie = "monettra_auth_token=; path=/; max-age=0; SameSite=Lax"
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
      return Promise.reject({ error: true, status: 401, message })
    }

    // 422 → Repassar os detalhes de validação
    if (status === 422 && data) {
      const apiError = {
        error: true,
        status: 422,
        message: (data.message as string) || (data.detail as string) || "Dados de entrada inválidos",
        details: data.details,
      }
      return Promise.reject(apiError)
    }

    return Promise.reject({
      error: true,
      status: status ?? 500,
      message,
    })
  }
)

export { TOKEN_KEY }
