import Link from "next/link"
import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"

const siteNavItems = [
  { href: "/", label: "Inicio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/conheca", label: "A Ferramenta" },
  { href: "/precos", label: "Precos e Planos" },
  { href: "/contato", label: "Contato" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold tracking-wide text-foreground">
            Babylos Finance
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {siteNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/precos">Comecar</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <span className="font-heading text-sm font-bold text-foreground">
              Babylos Finance
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4">
            {siteNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            2026 Babylos Finance. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
