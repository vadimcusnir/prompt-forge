import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["400","600","700","900"] });
const openSans   = Open_Sans({ subsets: ["latin"], variable: "--font-sans",    display: "swap", weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "PromptForge — Generatorul Operațional de Prompturi | chatgpt-prompting.com",
  description: "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf.",
  metadataBase: new URL("https://chatgpt-prompting.com"),
  /* restul metadatelor (favicon-uri, OpenGraph, Twitter etc.) */
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="dark h-full bg-pf-black">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans antialiased min-h-screen bg-pf-black`}>
        {children}
      </body>
    </html>
  );
}
