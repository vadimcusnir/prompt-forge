import OpenAI from "openai";

// Factory function pentru OpenAI - inițializare lazy
export function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY missing - OpenAI client cannot be initialized");
  }
  
  return new OpenAI({ 
    apiKey: key,
    dangerouslyAllowBrowser: false // Siguranță - doar pe server
  });
}

// Funcție helper pentru a verifica dacă OpenAI este disponibil
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Funcție pentru a obține OpenAI cu fallback
export function getOpenAIWithFallback() {
  try {
    return getOpenAI();
  } catch (error) {
    console.warn("OpenAI not available:", error);
    return null;
  }
}
