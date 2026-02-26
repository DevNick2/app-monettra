"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Landmark, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "email" | "otp" | "new-password"

export default function RecoverAccountPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep("otp")
    }, 1000)
  }

  function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep("new-password")
    }, 1000)
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/login")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-2xl font-bold tracking-wide text-foreground">
              Babylos Finance
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Recuperacao de conta
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm">
          {step === "email" && (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">
                  Recuperar conta
                </CardTitle>
                <CardDescription>
                  Informe seu e-mail para receber o codigo de verificacao
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar codigo"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {step === "otp" && (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">
                  Codigo de verificacao
                </CardTitle>
                <CardDescription>
                  {"Insira o codigo de 6 digitos enviado para "}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="flex flex-col items-center gap-6">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                    {isLoading ? "Verificando..." : "Verificar codigo"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar
                  </button>
                </form>
              </CardContent>
            </>
          )}

          {step === "new-password" && (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">
                  Nova senha
                </CardTitle>
                <CardDescription>
                  Defina sua nova senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Minimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">As senhas nao coincidem</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || newPassword !== confirmPassword}
                  >
                    {isLoading ? "Salvando..." : "Redefinir senha"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          <div className="px-6 pb-6">
            <p className="text-center text-sm text-muted-foreground">
              {"Lembrou a senha? "}
              <Link href="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
