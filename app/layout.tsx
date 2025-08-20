// app/layout.tsx
import "./globals.css"; // PRIMUL import de stil
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";

// (ajustează calea dacă ai altă locație pentru ThemeProvider)
import { ThemeProvider } from "@/components/theme-provider";
import { CSSReset } from "@/components/css-reset";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PromptForge — Generatorul Operațional de Prompturi | chatgpt-prompting.com",
  description:
    "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf. Livrezi în sub 60 de secunde.",
  keywords: [
    "prompt generator",
    "prompt systems",
    "operational prompts",
    "7-D prompt engine",
    "prompt factory",
    "SOP prompts",
    "export json pdf",
    "guardrails for prompts",
    "AI prompt engineering",
    "prompt optimization",
  ],
  authors: [{ name: "PromptForge Team" }],
  creator: "PromptForge",
  publisher: "PromptForge",
  formatDetection: { email: false, address: false, telephone: false },
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromptForge - Generatorul Operațional de Prompturi",
      },
    ],
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: { google: "your-google-verification-code" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Important: forțează fundalul chiar din html/body
    <html lang="ro" className="dark h-full bg-black" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
      </head>
      <body
        className={`${montserrat.variable} ${openSans.variable} font-sans antialiased min-h-screen bg-black`}
        suppressHydrationWarning
      >
        <CSSReset />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
