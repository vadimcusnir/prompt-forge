// app/page.tsx

// ================== IMPORTS ==================
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";

// ================== COMPONENTS ==================
// Lazy load components for performance
const ComingSoonInteractive = dynamic(
  () => import("@/components/coming-soon-interactive").then(mod => mod.ComingSoonInteractive),
  { ssr: false, loading: () => <div className="text-center p-10">Loading…</div> }
);

const HomeInteractive = dynamic(
  () => import("@/components/home-interactive").then(mod => mod.HomeInteractive),
  { ssr: false }
);

const MainContentInteractive = dynamic(
  () => import("@/components/main-content-interactive").then(mod => mod.MainContentInteractive),
  { ssr: false }
);

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
