"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoon } from "@/components/coming-soon";
import { AdminToggle } from "@/components/admin-toggle";
import {
  Wand2,
  Cpu,
  Download,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock,
  Target,
  Users,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
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

  if (comingSoonEnabled === true) return <ComingSoon />;

  if (showAdmin) {
    return (
      <div className="min-h-[100dvh] bg-black p-8 isolate">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <Button
              variant="ghost"
              onClick={() => setShowAdmin(false)}
              className="text-white hover:text-[#d1a954]"
            >
              Close Admin
            </Button>
          </div>
          <AdminToggle />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-black isolate">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,#10130F_0%,#0B0B0C_60%,#080809_100%)] opacity-60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Generatorul tău <span className="text-[#d1a954]">operațional</span> de prompturi
          </h1>
          <p className="text-xl md:text-2xl text-[#5a5a5a] mb-8 max-w-3xl mx-auto leading-relaxed">
            50 module. 7 vectori. Exportă în{" "}
            <span className="text-[#d1a954] font-semibold">&lt; 60 secunde</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button className="bg-[#d1a954] hover:bg-[#d1a954]/90 text-black font-bold px-8 py-4 text-lg shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)] transition-all duration-300">
              Pornește forja
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className="text-white border border-[#5a5a5a] hover:border-[#d1a954] hover:text-[#d1a954] px-8 py-4 text-lg transition-all duration-300"
            >
              Vezi modulele
            </Button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#5a5a5a]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d1a954]" />
              <span>TTA &lt; 60s</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#d1a954]" />
              <span>AI Score ≥ 80/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#d1a954]" />
              <span>.md/.json/.pdf export</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cum funcționează</h2>
            <p className="text-xl text-[#5a5a5a] max-w-2xl mx-auto">
              Nu ai nevoie de mai mult text. Ai nevoie de un sistem repetabil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">Setezi 7‑D</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  Configurezi parametrii operaționali: Domain, Scale, Urgency, Complexity,
                  Resources, Application, Output.
                </CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-[#d1a954] text-[#d1a954] hover:bg-[#d1a954] hover:text-black"
                  onClick={() => (window.location.href = "/seven-d")}
                >
                  Testează 7D
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">Rulezi modul</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  Alege M01–M50, primești output validat cu scor AI ≥ 80/100 și telemetrie
                  completă.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#d1a954]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-[#d1a954]" />
                </div>
                <CardTitle className="text-white text-xl">Expunți bundle</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[#5a5a5a]">
                  Descarci prompt.txt, prompt.md, prompt.json, prompt.pdf cu manifest și checksum.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Module Grid */}
      <section className="py-24 px-4 bg-[#0e0e0e]">
        {/* ... restul secțiunilor tale ... */}
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-black">
        {/* ... */}
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] border-t border-[#5a5a5a]/30 py-16 px-4">
        {/* ... */}
      </footer>
    </main>
  );
}
