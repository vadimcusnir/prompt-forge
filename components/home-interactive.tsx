"use client";

import { useState, useEffect } from "react";
import { AdminToggle } from "@/components/admin-toggle";
import { AdminButton } from "@/components/admin-button";

export function HomeInteractive() {
  const [comingSoonEnabled, setComingSoonEnabled] = useState<boolean | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

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

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        setShowAdmin((p) => !p);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (comingSoonEnabled === true) return null;

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-pf-black p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-pf-text">Admin Panel</h1>
            <AdminButton onClick={() => setShowAdmin(false)} />
          </div>
          <AdminToggle />
        </div>
      </div>
    );
  }

  return null;
}
