"use client";

import { ComingSoon } from "@/components/coming-soon";
import { useComingSoon } from "@/hooks/use-coming-soon";

// Fallback ENV (optional): dacă vrei să forțezi din .env
const ENV_FALLBACK = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export default function ComingSoonInteractive() {
  const { status, loading } = useComingSoon();
  
  // Use ENV fallback if API is not responding
  const enabled = ENV_FALLBACK || status?.enabled || false;

  // Show loading state briefly
  if (loading && !ENV_FALLBACK) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Afișează pagina Coming Soon doar când flag-ul e activ
  if (enabled) return <ComingSoon />;

  // Altfel, nu randăm nimic (lasă homepage-ul să se ocupe de UI)
  return null;
}
