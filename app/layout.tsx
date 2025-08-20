// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "600", "700", "900"],
})
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "PromptForge — Generatorul Operațional de Prompturi | chatgpt-prompting.com",
  description:
    "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf. Livrezi în sub 60 de secunde.",
  metadataBase: new URL("https://chatgpt-prompting.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://chatgpt-prompting.com",
    title: "PromptForge — Generatorul Operațional de Prompturi",
    description:
      "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf.",
    siteName: "PromptForge",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PromptForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptForge — Generatorul Operațional de Prompturi",
    description:
      "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf.",
    images: ["/og-image.png"],
    creator: "@promptforge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: { google: "your-google-verification-code" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark h-full bg-black">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
      </head>
      <body className={`${montserrat.variable} ${openSans.variable} font-sans antialiased min-h-screen bg-black`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
