"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Landmark } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/use-auth-store"
import { api, TOKEN_KEY } from "@/lib/api"
import type { LoginResponse, User } from "@/lib/types"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleInitialized = useRef(false)

  // Carregar Google Identity Services SDK
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || googleInitialized.current) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      })
      googleInitialized.current = true
    }
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGoogleResponse(response: { credential: string }) {
    setGoogleLoading(true)
    try {
      const { data: authData } = await api.post<LoginResponse>("/auth/google/callback", {
        id_token: response.credential,
      })

      const token = authData.access_token
      localStorage.setItem(TOKEN_KEY, token)
      document.cookie = `monettra_auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

      const { data: userData } = await api.get<User>("/auth/me")
      useAuthStore.setState({ token, user: userData, isLoading: false })

      toast.success("Login com Google realizado com sucesso!")
      router.push("/")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao autenticar com Google"
      toast.error(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  function triggerGoogleLogin() {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google OAuth não configurado. Defina NEXT_PUBLIC_GOOGLE_CLIENT_ID no .env.local")
      return
    }
    if (!googleInitialized.current) {
      toast.error("SDK do Google ainda está carregando. Tente novamente.")
      return
    }
    window.google?.accounts.id.prompt()
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    clearError()

    try {
      await login(email, password)
      toast.success("Login realizado com sucesso!")
      router.push("/")
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Credenciais inválidas. Verifique seu e-mail e senha."
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-2xl font-bold tracking-wide text-foreground">
              Monettra
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Sabedoria financeira da antiga Babilônia</p>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta para gerenciar suas finanças</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full transition-all hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            <Button
              id="google-login-btn"
              variant="outline"
              className="w-full cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              disabled={isLoading || googleLoading}
              onClick={triggerGoogleLogin}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Autenticando..." : "Entrar com Google"}
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Não tem uma conta? "}
              <Link href="/" className="text-primary hover:underline">
                Conheça nossos planos
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
