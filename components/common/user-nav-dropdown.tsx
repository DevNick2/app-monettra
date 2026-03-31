"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, Settings, Tags, CreditCard, Users, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatar } from "@/components/common/member-avatar"
import { useAuthStore } from "@/stores/use-auth-store"
import { logoutAction } from "@/app/actions/auth"

const dropdownItems = [
  { href: "/perfil", label: "Perfil", icon: User },
  { separator: true },
  { href: "/settings", label: "Configurações", icon: Settings },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/conta", label: "Conta", icon: Users },
] as const

export function UserNavDropdown() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const displayName = user?.name ?? user?.email ?? "Usuário"

  function handleLogout() {
    logoutAction().then(() => {
      router.push("/login")
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Menu do utilizador"
        >
          <MemberAvatar name={displayName} size="sm" />
          <span className="hidden max-w-[120px] truncate font-medium md:block">
            {displayName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {dropdownItems.map((item, idx) => {
          if ("separator" in item) {
            return <DropdownMenuSeparator key={`sep-${idx}`} />
          }

          const Icon = item.icon
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className="flex w-full cursor-pointer items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
