import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Checkout
          </h2>
          <p className="text-sm text-muted-foreground">
            Finalize sua compra e comece sua jornada financeira.
          </p>
          <div className="mt-4 w-full rounded-lg border border-border bg-secondary/50 p-6">
            <p className="text-sm text-muted-foreground italic">
              Pagina em construcao. Formulario de pagamento e confirmacao em breve.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/compra/plano">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
