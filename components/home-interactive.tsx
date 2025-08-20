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
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") setShowAdmin((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (comingSoonEnabled === true) {
    return null; // This will be handled by the ComingSoonInteractive component
  }

  if (showAdmin) {
    return (
      <div className="min-h-[100dvh] bg-black p-8 isolate">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <AdminButton onClick={() => setShowAdmin(false)} />
          </div>
          <AdminToggle />
        </div>
      </div>
    );
  }

  return null; // No interactive elements to show in normal state
}
