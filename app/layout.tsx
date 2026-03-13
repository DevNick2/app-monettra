import type { Metadata } from "next"
import { Lora, Cinzel } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AppInitializer } from "@/components/app-initializer"
import "./globals.css"

const _lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const _cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" })

export const metadata: Metadata = {
  title: "Monettra - Gestão Financeira",
  description:
    "Plataforma de gestão financeira pessoal inspirada nos princípios da antiga Babilônia. Organize despesas, planeje meses futuros e acompanhe metas financeiras.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <AppInitializer />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
