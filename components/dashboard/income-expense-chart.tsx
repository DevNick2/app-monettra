"use client"

import { BarChart } from "@mui/x-charts/BarChart"

const data = [
  { mes: "Jan", entradas: 7200, saidas: 4800 },
  { mes: "Fev", entradas: 8500, saidas: 5230 },
  { mes: "Mar", entradas: 7800, saidas: 6100 },
  { mes: "Abr", entradas: 8200, saidas: 4500 },
  { mes: "Mai", entradas: 9000, saidas: 5800 },
  { mes: "Jun", entradas: 8500, saidas: 5230 },
]

const meses = data.map((d) => d.mes)
const entradas = data.map((d) => d.entradas)
const saidas = data.map((d) => d.saidas)

export function IncomeExpenseChart() {
  return (
    <div className="h-[300px] w-full">
      <BarChart
        xAxis={[
          {
            data: meses,
            scaleType: "band",
            tickLabelStyle: {
              fill: "var(--muted-foreground)",
              fontSize: 12,
            },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: "var(--muted-foreground)",
              fontSize: 12,
            },
            disableLine: true,
            disableTicks: true,
            valueFormatter: (value: number) => `${(value / 1000).toFixed(0)}k`,
          },
        ]}
        series={[
          {
            data: entradas,
            label: "Entradas",
            color: "var(--chart-4)",
            valueFormatter: (value) =>
              (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
          {
            data: saidas,
            label: "Saídas",
            color: "var(--chart-3)",
            valueFormatter: (value) =>
              (value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
        ]}
        borderRadius={4}
        barGapRatio={0.15}
        width={undefined}
        height={300}
        margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
        slotProps={{
          legend: {
            direction: "row",
            position: { vertical: "bottom", horizontal: "middle" },
            labelStyle: {
              fontSize: 12,
              fill: "var(--muted-foreground)",
            },
          },
        }}
        sx={{
          width: "100%",
          "& .MuiChartsGrid-line": {
            stroke: "var(--border)",
            strokeDasharray: "3 3",
          },
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
