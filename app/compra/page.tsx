import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CompraPage() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-heading text-2xl font-bold text-foreground">
        Escolha seu plano
      </h2>
      <p className="text-muted-foreground">
        Selecione o plano ideal na nossa pagina de precos para iniciar sua jornada.
      </p>
      <Button asChild>
        <Link href="/precos">Ver Planos</Link>
      </Button>
    </div>
  )
}
