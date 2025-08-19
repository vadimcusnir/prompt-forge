import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import BackgroundRoot from "@/components/BackgroundRoot"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "PROMPTFORGE™ v3.0 - AI Prompt Generation System",
  description: "Advanced AI prompt generation and management system with 50 specialized modules",
  generator: "PROMPTFORGE™",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Flag SSR pentru dezactivarea mișcării - 100% determinist
  const motionOff = process.env.NEXT_PUBLIC_MOTION === 'off'
  
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <style>{`
          body {
            background-color: #000000 !important;
            color: #ffffff !important;
            font-family: ${inter.style.fontFamily};
          }
          html {
            background-color: #000000 !important;
          }
        `}</style>
      </head>
      <body className={`min-h-screen bg-black text-white overflow-x-hidden antialiased ${inter.className} ${motionOff ? 'motion-off' : ''}`}>
        {/* Background layer pasiv - z-index negativ */}
        <BackgroundRoot />
        
        {/* Content principal */}
        {children}
        
        <Analytics />
      </body>
    </html>
  )
}
