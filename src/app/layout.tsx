import type { Metadata, Viewport } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const metadata: Metadata = {
  title: "FitAi - Treinos Inteligentes",
  description: "Plataforma de gerenciamento de treinos com IA brutalista. Treine heavier, get stronger.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} antialiased selection:bg-[#ff0033] selection:text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
