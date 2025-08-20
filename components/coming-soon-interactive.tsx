"use client";

import { useState, useEffect } from "react";
import { ComingSoon } from "@/components/coming-soon";

export function ComingSoonInteractive() {
  const [comingSoonEnabled, setComingSoonEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkComingSoon = async () => {
      try {
        const res = await fetch("/api/toggle-coming-soon", { cache: "no-store" });
        const json = res.ok ? await res.json() : null;
        setComingSoonEnabled(Boolean(json?.data?.enabled));
      } catch {
        setComingSoonEnabled(false);
      }
    };

    checkComingSoon();
  }, []);

  if (comingSoonEnabled === true) {
    return <ComingSoon />;
  }

  return null;
}
