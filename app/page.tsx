// app/page.tsx

// ================== IMPORTS ==================
import { Suspense } from "react";
import { ComingSoonInteractive } from "@/components/coming-soon-interactive";
import HomeInteractive from "@/components/home-interactive";
import { MainContentInteractive } from "@/components/main-content-interactive";
import { Metadata } from "next";

// ================== ENV TOGGLE ==================
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

// ================== METADATA (optional override) ==================
export const metadata: Metadata = {
  title: "PromptForge — Generatorul Operațional de Prompturi",
  description:
    "Construiești sisteme de prompturi, nu piese unice. 50 module, engine 7‑D și export .md/.json/.pdf.",
};

// ================== PAGE ==================
export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center text-muted-foreground">Se încarcă…</div>}>
      {COMING_SOON ? (
        <ComingSoonInteractive />
      ) : (
        <>
          <HomeInteractive />
          <MainContentInteractive />
        </>
      )}
    </Suspense>
  );
}