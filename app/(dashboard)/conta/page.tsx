"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  UserPlus,
  Crown,
  UserX,
  Mail,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api"
import { useAuthStore } from "@/stores/use-auth-store"
import type { Account, AccountMember } from "@/lib/types"

export default function ContaPage() {
  const { user } = useAuthStore()
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [removingCode, setRemovingCode] = useState<string | null>(null)

  const fetchAccount = useCallback(async () => {
    try {
      const { data } = await api.get<Account>("/accounts/me")
      setAccount(data)
    } catch {
      // Usuário ainda não tem conta — pode criar
      setAccount(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccount()
  }, [fetchAccount])

  async function handleCreateAccount() {
    try {
      const { data } = await api.post<Account>("/accounts/", {
        name: `Conta de ${user?.name || user?.email}`,
      })
      setAccount(data)
      toast.success("Conta criada com sucesso!")
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao criar conta"
      toast.error(message)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setInviteLoading(true)
    try {
      await api.post("/accounts/invite", { email: inviteEmail })
      toast.success(`${inviteEmail} adicionado à conta!`)
      setInviteEmail("")
      fetchAccount()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao convidar membro"
      toast.error(message)
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemoveMember(memberUserCode: string, memberName: string) {
    setRemovingCode(memberUserCode)
    try {
      await api.delete(`/accounts/members/${memberUserCode}`)
      toast.success(`${memberName} removido da conta`)
      fetchAccount()
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao remover membro"
      toast.error(message)
    } finally {
      setRemovingCode(null)
    }
  }

  const isOwner = account?.members.some(
    (m) => m.user_code === user?.code && m.role === "owner"
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Minha Conta</h1>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Sem conta configurada
            </CardTitle>
            <CardDescription>
              Você ainda não possui uma conta. Crie uma para começar a gerenciar finanças
              compartilhadas com sua família ou sócios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button id="create-account-btn" onClick={handleCreateAccount} className="gap-2">
              <Users className="h-4 w-4" />
              Criar Minha Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Minha Conta</h1>

      {/* Card de status da conta */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-heading text-lg">{account.name}</CardTitle>
                <CardDescription>
                  {account.members.length} de {account.max_members} membros ativos
                </CardDescription>
              </div>
            </div>
            {isOwner && (
              <Badge variant="outline" className="border-primary/30 text-primary gap-1">
                <Crown className="h-3 w-3" />
                Administrador
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Lista de membros */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros ({account.members.length}/{account.max_members})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {account.members.map((member: AccountMember) => {
            const initials = (member.user_name || member.user_email)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
            const isSelf = member.user_code === user?.code
            const isThisOwner = member.role === "owner"

            return (
              <div
                key={member.code}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {member.user_name || member.user_email}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.user_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={isThisOwner ? "default" : "secondary"}
                    className="text-xs gap-1"
                  >
                    {isThisOwner ? (
                      <>
                        <Crown className="h-3 w-3" />
                        Dono
                      </>
                    ) : (
                      "Membro"
                    )}
                  </Badge>

                  {isOwner && !isSelf && !isThisOwner && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          id={`remove-member-${member.user_code}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                          disabled={removingCode === member.user_code}
                        >
                          {removingCode === member.user_code ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover membro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover{" "}
                            <strong>{member.user_name || member.user_email}</strong> da conta? Esta
                            ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() =>
                              handleRemoveMember(
                                member.user_code,
                                member.user_name || member.user_email
                              )
                            }
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Formulário de convite (apenas para owners) */}
      {isOwner && account.members.length < account.max_members && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Convidar Membro
            </CardTitle>
            <CardDescription>
              Adicione um usuário pelo e-mail cadastrado no Monettra. Slots disponíveis:{" "}
              <strong>{account.max_members - account.members.length}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="invite-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-mail do novo membro
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={inviteLoading}
                />
              </div>
              <Button
                id="invite-btn"
                type="submit"
                disabled={inviteLoading}
                className="gap-2 sm:w-auto w-full"
              >
                {inviteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {inviteLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isOwner && account.members.length >= account.max_members && (
        <Card className="border-border bg-card/50 border-dashed">
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            Limite de <strong>{account.max_members} membros</strong> atingido para o seu plano
            atual.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
