"use client"

import { useEffect, useState } from "react"
import { PieChart } from "@mui/x-charts/PieChart"

const data = [
  { id: "moradia", value: 1800, label: "Moradia", color: "#8b6914" },
  { id: "alimentacao", value: 1200, label: "Alimentação", color: "#c4a35a" },
  { id: "transporte", value: 680, label: "Transporte", color: "#5a7a5a" },
  { id: "saude", value: 450, label: "Saúde", color: "#a63d2f" },
  { id: "lazer", value: 600, label: "Lazer", color: "#4a6a8a" },
  { id: "outros", value: 500, label: "Outros", color: "#7a6b5a" },
]

export function CategoryDonutChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="h-[280px] w-[300px] max-w-full rounded-lg bg-muted/40 animate-pulse" aria-hidden />
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <PieChart
        series={[
          {
            data,
            innerRadius: 60,
            outerRadius: 100,
            paddingAngle: 3,
            cx: "50%",
            cy: "50%",
            valueFormatter: (item) =>
              item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
        ]}
        width={300}
        height={280}
        slotProps={{
          legend: {
            direction: "vertical",
            position: { vertical: "middle", horizontal: "end" },
            sx: {
              "& .MuiChartsLegend-label": {
                fontSize: 11,
                fill: "var(--muted-foreground)",
              },
            },
          },
        }}
        sx={{
          "& .MuiChartsTooltip-root": {
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--foreground)",
            fontSize: 12,
          },
        }}
      />
    </div>
  )
}
