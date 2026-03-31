"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Landmark, FileText, BarChart2, RefreshCw, Menu, X } from "lucide-react"
import { useState } from "react"
import { UserNavDropdown } from "@/components/common/user-nav-dropdown"

const navItems = [
  { href: "/", label: "Inicio", icon: Landmark },
  { href: "/lancamentos", label: "Lançamentos", icon: FileText },
  { href: "/analytics", label: "Gráficos", icon: BarChart2 },
  { href: "/assinaturas", label: "Assinaturas", icon: RefreshCw },
]

export function AppHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        {/* Marca — apenas ícone */}
        <Link href="/" className="flex items-center" aria-label="Monettra — início">
          <Landmark className="h-6 w-6 text-primary" />
        </Link>

        {/* Navegação principal (desktop) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bloco direito desktop: avatar + dropdown */}
        <div className="hidden md:flex">
          <UserNavDropdown />
        </div>

        {/* Toggle mobile */}
        <button
          className="flex cursor-pointer md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              )
            })}

            {/* Dropdown do utilizador também disponível em mobile */}
            <div className="mt-2 border-t border-border pt-2">
              <UserNavDropdown />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
