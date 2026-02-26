"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: "Moradia", value: 1800, color: "#8b6914" },
  { name: "Alimentacao", value: 1200, color: "#c4a35a" },
  { name: "Transporte", value: 680, color: "#5a7a5a" },
  { name: "Saude", value: 450, color: "#a63d2f" },
  { name: "Lazer", value: 600, color: "#4a6a8a" },
  { name: "Outros", value: 500, color: "#7a6b5a" },
]

export function CategoryDonutChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--foreground)",
              fontSize: 12,
            }}
            formatter={(value: number) =>
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span style={{ color: "var(--foreground)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
