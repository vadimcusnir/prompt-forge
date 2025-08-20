"use client";

import { useState } from "react";
import { Check, Clock, Target, Download, ArrowRight, Zap, Shield, User, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: "Eroare",
        description: "Completează numele și email-ul.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        toast({
          title: "Succes!",
          description: "Ești pe listă. Te anunțăm când lansăm!",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Eroare",
          description: error.message || "Eroare necunoscută.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Eroare",
        description: "Verifică conexiunea la internet.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-pf-black flex items-center justify-center">
        <div className="text-center px-4 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gold-industrial/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-gold-industrial" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pf-text mb-6">Mulțumim!</h1>
          <p className="text-xl text-pf-text-muted mb-8 max-w-xl mx-auto">
            Ai fost adăugat pe lista noastră de așteptare.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pf-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <Badge className="mb-6 bg-gold-industrial/10 text-gold-industrial border-gold-industrial/20 px-4 py-2 text-sm">
          PROMPTFORGE™ v3.0 — Coming Soon!
        </Badge>

        <h1 className="text-5xl font-bold text-pf-text mb-4">
          Generatorul tău <span className="text-gold-industrial">operațional</span> de prompturi
        </h1>

        <p className="text-lg text-pf-text-muted mb-8">
          50 module. 7 vectori. Export .md / .json / .pdf în <span className="text-gold-industrial">sub 60s</span>.
        </p>

        <Card className="bg-pf-surface/80 border-pf-text-muted/30 backdrop-blur-sm mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-pf-text text-xl">Înscrie-te pe lista de așteptare</CardTitle>
            <CardDescription className="text-pf-text-muted">
              Vei primi acces anticipat la PROMPTFORGE™
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-pf-text-muted" />
                <Input
                  type="text"
                  placeholder="Numele tău"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-pf-black border-pf-text-muted/30 text-pf-text"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-pf-text-muted" />
                <Input
                  type="email"
                  placeholder="Email-ul tău"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-pf-black border-pf-text-muted/30 text-pf-text"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-industrial text-pf-black font-bold py-3 text-lg hover:bg-gold-industrial-dark transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? "Se procesează..." : "Adaugă-mă pe listă"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-6 text-sm text-pf-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-industrial" />
            <span>TTA &lt; 60s</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gold-industrial" />
            <span>AI Score ≥ 80</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gold-industrial" />
            <span>Export .md/.json/.pdf</span>
          </div>
        </div>
      </div>
    </div>
  );
}
