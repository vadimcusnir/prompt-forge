"use client";

import { useState } from "react";
import { Check, Clock, Target, Download, ArrowRight, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Eroare",
        description: "Completează email-ul.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mulțumim!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Ai fost adăugat pe lista noastră de așteptare.
          </p>
          <p className="text-sm text-gray-500">
            Vei primi notificări despre lansarea PROMPTFORGE™.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PROMPTFORGE™
          </h1>
          <p className="text-xl text-gray-600 mb-4">v3.0</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>V3 Content & Education</p>
            <p>V5 Branding</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            PROMPTFORGE™ is coming.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Build prompt systems, not throwaway lines.
          </p>
        </div>

        {/* Waitlist Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isSubmitting ? "Se procesează..." : "Join the Waitlist"}
            </Button>
          </div>
        </form>

        {/* Features */}
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>TTA &lt; 60s</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span>AI Score ≥ 80</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export .md/.json/.pdf</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Zero spam. Doar notificări de lansare.
          </p>
          <p className="text-sm text-gray-400">
            © PromptForge™ 2025 • Privacy / Terms
          </p>
        </div>
      </div>
    </div>
  );
}
