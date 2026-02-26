import { Sparkles } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site-layout"

export default function ConhecaPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <Sparkles className="h-12 w-12 text-primary" />
          <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Conheca a Ferramenta
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Descubra como o Babylos Finance pode transformar seu planejamento financeiro 
            em uma jornada educativa, com graficos intuitivos, IA mentora, gamificacao 
            e integracao com dispositivos inteligentes.
          </p>
          <div className="mt-8 w-full rounded-lg border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground italic">
              Pagina em construcao. Detalhes completos das funcionalidades em breve.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
