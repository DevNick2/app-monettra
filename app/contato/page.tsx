import { Mail } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site-layout"

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <Mail className="h-12 w-12 text-primary" />
          <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Contato
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Entre em contato conosco para tirar duvidas, sugerir melhorias ou saber mais 
            sobre o Babylos Finance.
          </p>
          <div className="mt-8 w-full rounded-lg border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground italic">
              Pagina em construcao. Formulario de contato em breve.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
