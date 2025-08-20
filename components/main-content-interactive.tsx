"use client";

import { useState } from "react";
import { ArrowRight, Clock, Target, Download, Wand2, Cpu, Shield, Users, BookOpen, Zap, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MainContentInteractive() {
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);

  return (
    <section className="py-24 px-4 bg-pf-black">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-pf-text mb-4">
          Ce face PromptForge diferit?
        </h2>
        <p className="text-xl text-pf-text-muted mb-12 max-w-3xl mx-auto">
          De la idee până la execuție: 50 module, 7 vectori și export bundle complet în <span className="text-gold-industrial font-semibold">&lt;60 secunde</span>.
        </p>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl">
            <CardHeader>
              <Zap className="w-10 h-10 text-gold-industrial mx-auto mb-4" />
              <CardTitle className="text-xl text-pf-text">50 Module</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-pf-text-muted">
                Module optimizate pentru conținut, analiză, optimizare și integrare.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl">
            <CardHeader>
              <Cpu className="w-10 h-10 text-gold-industrial mx-auto mb-4" />
              <CardTitle className="text-xl text-pf-text">Motor 7D</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-pf-text-muted">
                Parametrizare avansată (domain, scale, urgency, complexity, resources, application, output).
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl">
            <CardHeader>
              <Download className="w-10 h-10 text-gold-industrial mx-auto mb-4" />
              <CardTitle className="text-xl text-pf-text">Export Bundle</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-pf-text-muted">
                Artefacte .txt, .md, .json, .pdf + manifest și checksum, toate într-un singur bundle.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16">
          <button
            onClick={() => setShowInteractiveDemo(true)}
            className="inline-flex items-center bg-gold-industrial hover:bg-gold-industrial-dark text-pf-black font-bold px-8 py-4 text-lg transition-all shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]"
          >
            Încearcă demo acum
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {showInteractiveDemo && (
          <div className="mt-12 p-6 bg-pf-surface border border-pf-text-muted/30 rounded-lg">
            <p className="text-pf-text mb-4">Demo interactiv vine aici...</p>
            <button
              onClick={() => setShowInteractiveDemo(false)}
              className="px-4 py-2 bg-pf-black border border-pf-text-muted/30 text-pf-text hover:text-gold-industrial"
            >
              Închide
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
