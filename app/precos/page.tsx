import Link from "next/link"
import { Check, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader, SiteFooter } from "@/components/site-layout"

const plans = [
  {
    name: "Escriba",
    description: "Para quem esta comecando sua jornada financeira",
    price: "Gratis",
    period: "",
    features: [
      "Controle de lancamentos basico",
      "3 categorias personalizaveis",
      "Graficos mensais",
      "1 meta financeira",
    ],
    cta: "Comecar Gratis",
    popular: false,
  },
  {
    name: "Mercador",
    description: "Para quem quer controle completo das financas",
    price: "R$ 19,90",
    period: "/mes",
    features: [
      "Lancamentos ilimitados",
      "Categorias ilimitadas",
      "Graficos e relatorios avancados",
      "Metas ilimitadas",
      "IA Mentora com dicas personalizadas",
      "Gamificacao e conquistas",
    ],
    cta: "Assinar Agora",
    popular: true,
  },
  {
    name: "Rei",
    description: "Para familias e pequenos negocios",
    price: "R$ 39,90",
    period: "/mes",
    features: [
      "Tudo do plano Mercador",
      "Ate 5 membros",
      "Integracao com casas inteligentes",
      "Comandos de voz",
      "Relatorios avancados com IA",
      "Suporte prioritario",
    ],
    cta: "Assinar Agora",
    popular: false,
  },
]

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <Crown className="h-10 w-10 text-primary" />
          <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Precos e Planos
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Escolha o plano ideal para sua jornada de sabedoria financeira
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-border bg-card ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="font-heading text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="font-heading text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={`/compra/plano?plan=${plan.name.toLowerCase()}`}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
