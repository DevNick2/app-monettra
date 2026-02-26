import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function PlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const selectedPlan = plan || "mercador"

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground capitalize">
            {`Plano ${selectedPlan}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Voce selecionou o plano {selectedPlan}. Continue para o checkout.
          </p>
          <div className="mt-4 w-full rounded-lg border border-border bg-secondary/50 p-6">
            <p className="text-sm text-muted-foreground italic">
              Pagina em construcao. Detalhes do plano e resumo da compra em breve.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/precos">Voltar aos Planos</Link>
            </Button>
            <Button asChild>
              <Link href="/compra/checkout">Continuar para o Checkout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
