// BackgroundRoot pasiv SSR - fără JavaScript client-side
export default function BackgroundRoot() {
  return (
    <div className="bg-root" aria-hidden="true">
      {/* Layer-uri statice cu fallback vizual solid */}
      
      {/* 1. Radial gradients pentru fundal bogat */}
      <div className="bg-gradient absolute inset-0 opacity-60" />
      
      {/* 2. Grid pattern */}
      <div className="bg-grid absolute inset-0 opacity-5" />
      
      {/* 3. Noise layer pentru textură */}
      <div className="bg-noise absolute inset-0 opacity-4" />
      
      {/* 4. Container pentru animații dinamice (încărcat lazy) */}
      <div id="bg-animations-container" className="absolute inset-0" />
    </div>
  );
}
