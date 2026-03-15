"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Landmark, FileText, Tags, User, LogOut, Menu, X, BarChart2, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { logoutAction } from "@/app/actions/auth"

const navItems = [
  { href: "/app", label: "Inicio", icon: Landmark },
  { href: "/app/lancamentos", label: "Lancamentos", icon: FileText },
  { href: "/app/analytics", label: "Graficos", icon: BarChart2 },
  { href: "/app/categorias", label: "Categorias", icon: Tags },
  { href: "/app/perfil", label: "Perfil", icon: User },
]

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout() {
    logoutAction().then(() => {
      router.push("/login")
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold tracking-wide text-foreground">
            Babylos
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <button
          className="flex md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
