import { ShoppingBag } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site-layout"

export default function CompraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-xl font-bold text-foreground">Fluxo de Compra</h1>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
