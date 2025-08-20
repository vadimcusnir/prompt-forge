"use client";

import { HomeInteractive } from "@/components/home-interactive";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Target, Download, Wand2, Cpu, Shield, Users, BookOpen, Zap, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HomeInteractive() () {
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  
  return (
    <div className="min-h-[100dvh] bg-pf-black isolate">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-pf-black via-pf-surface-dark to-pf-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,#10130F_0%,#0B0B0C_60%,#080809_100%)] opacity-60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-pf-text mb-6 tracking-tight">
            Generatorul tău <span className="text-gold-industrial">operațional</span> de prompturi
          </h1>
          <p className="text-xl md:text-2xl text-pf-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
            50 module. 7 vectori. Exportă în{" "}
            <span className="text-gold-industrial font-semibold">&lt; 60 secunde</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/seven-d">
              <button className="bg-gold-industrial hover:bg-gold-industrial-dark text-pf-black font-bold px-8 py-4 text-lg shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)] transition-all duration-300">
                Pornește forja
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
            <Link href="/test">
              <button
                className="text-pf-text border border-pf-text-muted hover:border-gold-industrial hover:text-gold-industrial px-8 py-4 text-lg transition-all duration-300"
              >
                Vezi modulele
              </button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-pf-text-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-industrial" />
              <span>TTA &lt; 60s</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gold-industrial" />
              <span>AI Score ≥ 80/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-gold-industrial" />
              <span>.md/.json/.pdf export</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-pf-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pf-text mb-4">Cum funcționează</h2>
            <p className="text-xl text-pf-text-muted max-w-2xl mx-auto">
              Nu ai nevoie de mai mult text. Ai nevoie de un sistem repetabil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-gold-industrial" />
                </div>
                <CardTitle className="text-pf-text text-xl">Setezi 7‑D</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-pf-text-muted">
                  Configurezi parametrii operaționali: Domain, Scale, Urgency, Complexity,
                  Resources, Application, Output.
                </CardDescription>
                <Link href="/seven-d">
                  <button className="mt-4 border-gold-industrial text-gold-industrial hover:bg-gold-industrial hover:text-pf-black px-4 py-2 text-sm rounded">
                    Testează 7D
                  </button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-gold-industrial" />
                </div>
                <CardTitle className="text-pf-text text-xl">Rulezi modul</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-pf-text-muted">
                  Alege M01–M50, primești output validat cu scor AI ≥ 80/100 și telemetrie
                  completă.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-pf-surface border-pf-text-muted/30 rounded-xl hover:shadow-[0_0_20px_rgba(209,169,84,0.1)] transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-gold-industrial" />
                </div>
                <CardTitle className="text-pf-text text-xl">Exporti bundle</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-pf-text-muted">
                  Generezi .md/.json/.pdf cu toate prompturile, configurațiile și
                  rezultatele testelor.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-pf-surface-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pf-text mb-4">De ce PromptForge?</h2>
            <p className="text-xl text-pf-text-muted max-w-2xl mx-auto">
              Pentru că prompturile unice nu scalează. Sistemele da.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gold-industrial" />
              </div>
              <h3 className="text-pf-text font-semibold mb-2">Validare AI</h3>
              <p className="text-pf-text-muted text-sm">
                Fiecare prompt e testat și validat cu scor ≥ 80/100
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gold-industrial" />
              </div>
              <h3 className="text-pf-text font-semibold mb-2">Multi-tenant</h3>
              <p className="text-pf-text-muted text-sm">
                Sistem complet izolat pentru fiecare organizație
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gold-industrial" />
              </div>
              <h3 className="text-pf-text font-semibold mb-2">50 Module</h3>
              <p className="text-pf-text-muted text-sm">
                De la M01 la M50, acoperă toate domeniile
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gold-industrial" />
              </div>
              <h3 className="text-pf-text font-semibold mb-2">Rapid</h3>
              <p className="text-pf-text-muted text-sm">
                TTA &lt; 60 secunde pentru orice modul
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module Preview */}
      <section className="py-24 px-4 bg-pf-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pf-text mb-4">Module disponibile</h2>
            <p className="text-xl text-pf-text-muted max-w-2xl mx-auto">
              De la M01 la M50, fiecare cu specificații clare și teste automate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-pf-surface border border-pf-text-muted/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gold-industrial/10 rounded-full flex items-center justify-center">
                  <span className="text-gold-industrial font-bold text-sm">M01</span>
                </div>
                <h3 className="text-pf-text font-semibold">Foundation</h3>
              </div>
              <p className="text-pf-text-muted text-sm mb-4">
                Prompturi de bază pentru orice domeniu, cu validare strictă.
              </p>
              <div className="flex items-center gap-2 text-xs text-pf-text-muted">
                <Check className="w-3 h-3 text-green-400" />
                <span>AI Score: 85/100</span>
              </div>
            </div>

            <div className="bg-pf-surface border border-pf-text-muted/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gold-industrial/10 rounded-full flex items-center justify-center">
                  <span className="text-gold-industrial font-bold text-sm">M02</span>
                </div>
                <h3 className="text-pf-text font-semibold">Analysis</h3>
              </div>
              <p className="text-pf-text-muted text-sm mb-4">
                Sisteme de analiză și evaluare cu metrici standardizate.
              </p>
              <div className="flex items-center gap-2 text-xs text-pf-text-muted">
                <Check className="w-3 h-3 text-green-400" />
                <span>AI Score: 87/100</span>
              </div>
            </div>

            <div className="bg-pf-surface border border-pf-text-muted/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gold-industrial/10 rounded-full flex items-center justify-center">
                  <span className="text-gold-industrial font-bold text-sm">M03</span>
                </div>
                <h3 className="text-pf-text font-semibold">Strategy</h3>
              </div>
              <p className="text-pf-text-muted text-sm mb-4">
                Prompturi strategice pentru planificare și execuție.
              </p>
              <div className="flex items-center gap-2 text-xs text-pf-text-muted">
                <Check className="w-3 h-3 text-green-400" />
                <span>AI Score: 83/100</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <Link href="/test">
              <button className="bg-gold-industrial hover:bg-gold-industrial-dark text-pf-black font-bold px-8 py-4 text-lg shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)] transition-all duration-300">
                Vezi toate modulele
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Interactive Demo Card */}
          <div className="max-w-md mx-auto">
            <button 
              onClick={() => setShowInteractiveDemo(true)}
              className="text-gold-industrial hover:text-pf-text border border-gold-industrial hover:bg-gold-industrial/10 px-4 py-2 text-sm rounded transition-all duration-300"
            >
              Demo interactiv
            </button>
            
            {showInteractiveDemo && (
              <Card className="mt-4 bg-pf-surface border-gold-industrial/50 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-pf-text">Card interactiv</CardTitle>
                  <button
                    onClick={() => setShowInteractiveDemo(false)}
                    className="text-pf-text-muted hover:text-pf-text p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pf-text-muted">
                    Acesta este un exemplu de card cu interactivitate implementată corect în componenta client.
                    Button-ul de închidere folosește useState și onClick direct în componentă.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-pf-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pf-surface to-pf-surface-dark rounded-2xl p-12 border border-pf-text-muted/30">
            <h2 className="text-4xl font-bold text-pf-text mb-6">
              Gata să construiești sisteme de prompturi?
            </h2>
            <p className="text-xl text-pf-text-muted mb-8 max-w-2xl mx-auto">
              Nu mai pierde timpul cu prompturi unice. Construiește sisteme repetabile care livrează consistent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/seven-d">
                <button 
                  className="bg-gold-industrial hover:bg-gold-industrial-dark text-pf-black font-bold px-8 py-4 text-lg shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)] transition-all duration-300"
                >
                  Începe cu 7‑D
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
              <Link href="/pricing">
                <button
                  className="text-pf-text border border-pf-text-muted hover:border-gold-industrial hover:text-gold-industrial px-8 py-4 text-lg transition-all duration-300"
                >
                  Vezi prețurile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pf-surface-dark border-t border-pf-text-muted/30 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-pf-text font-bold text-lg mb-4">PromptForge</h3>
              <p className="text-pf-text-muted text-sm">
                Generatorul operațional de prompturi pentru sisteme AI scalabile.
              </p>
            </div>
            <div>
              <h4 className="text-pf-text font-semibold mb-4">Produs</h4>
              <ul className="space-y-2 text-sm text-pf-text-muted">
                <li><Link href="/seven-d" className="hover:text-gold-industrial transition-colors">7‑D Engine</Link></li>
                <li><Link href="/test" className="hover:text-gold-industrial transition-colors">Module Grid</Link></li>
                <li><Link href="/test" className="hover:text-gold-industrial transition-colors">Test Engine</Link></li>
                <li><Link href="/test" className="hover:text-gold-industrial transition-colors">Export Bundle</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-pf-text font-semibold mb-4">Resurse</h4>
              <ul className="space-y-2 text-sm text-pf-text-muted">
                <li><Link href="/docs" className="hover:text-gold-industrial transition-colors">Documentație</Link></li>
                <li><Link href="/api" className="hover:text-gold-industrial transition-colors">API</Link></li>
                <li><Link href="/examples" className="hover:text-gold-industrial transition-colors">Exemple</Link></li>
                <li><Link href="/support" className="hover:text-gold-industrial transition-colors">Suport</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-pf-text font-semibold mb-4">Companie</h4>
              <ul className="space-y-2 text-sm text-pf-text-muted">
                <li><Link href="/about" className="hover:text-gold-industrial transition-colors">Despre noi</Link></li>
                <li><Link href="/pricing" className="hover:text-gold-industrial transition-colors">Prețuri</Link></li>
                <li><Link href="/contact" className="hover:text-gold-industrial transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-gold-industrial transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-pf-text-muted/30 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-pf-text-muted text-sm">
              © 2024 PromptForge. Toate drepturile rezervate.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-pf-text-muted hover:text-gold-industrial text-sm transition-colors">
                Confidențialitate
              </Link>
              <Link href="/terms" className="text-pf-text-muted hover:text-gold-industrial text-sm transition-colors">
                Termeni
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
