import Link from "next/link"
import { Landmark, BarChart3, Shield, Gamepad2, Mic, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader, SiteFooter } from "@/components/site-layout"

const features = [
  {
    icon: BarChart3,
    title: "Graficos e Relatorios",
    description: "Visualize tendencias de consumo e progresso do seu planejamento financeiro com graficos claros.",
  },
  {
    icon: Shield,
    title: "IA Mentora",
    description: "Receba dicas praticas baseadas nas regras da Babilonia para investir com sabedoria.",
  },
  {
    icon: Gamepad2,
    title: "Gamificacao Tematica",
    description: "Conquistas e medalhas inspiradas na antiga Babilonia incentivam habitos financeiros saudaveis.",
  },
  {
    icon: Mic,
    title: "Comando de Voz",
    description: "Integre com casas inteligentes e organize suas financas a um comando de voz.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
          <div className="mb-6 flex items-center gap-2">
            <Landmark className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground text-balance md:text-5xl lg:text-6xl">
            Sabedoria financeira da antiga Babilonia
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Transforme seu planejamento financeiro em uma jornada educativa, motivadora e acessivel. 
            Organize despesas, acompanhe metas e invista com a sabedoria dos antigos.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/precos" className="gap-2">
                Comecar Agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/conheca">Conheca a Ferramenta</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-border bg-card">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
