"use client";

import { useEffect, useState } from "react";
import { ComingSoon } from "@/components/coming-soon";

// Fallback ENV (optional): dacă vrei să forțezi din .env
const ENV_FALLBACK = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export function ComingSoonInteractive() {
  const [enabled, setEnabled] = useState<boolean | null>(ENV_FALLBACK ?? null);

  useEffect(() => {
    let cancelled = false;

    const checkComingSoon = async () => {
      try {
        const res = await fetch("/api/toggle-coming-soon", { cache: "no-store" });
        const json = res.ok ? await res.json() : null;
        if (!cancelled) setEnabled(Boolean(json?.data?.enabled));
      } catch {
        // dacă API-ul nu răspunde, respectă fallback-ul din ENV sau consideră dezactivat
        if (!cancelled) setEnabled(ENV_FALLBACK || false);
      }
    };

    // doar dacă nu avem deja un fallback explicit din ENV
    if (!ENV_FALLBACK) checkComingSoon();

    return () => {
      cancelled = true;
    };
  }, []);

  // Afișează pagina Coming Soon doar când flag-ul e activ
  if (enabled === true) return <ComingSoon />;

  // Altfel, nu randăm nimic (lasă homepage-ul să se ocupe de UI)
  return null;
}
