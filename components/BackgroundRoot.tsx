// BackgroundRoot pasiv SSR - fără JavaScript client-side
export default function BackgroundRoot() {
  return (
    <div className="bg-fixed-root" aria-hidden="true">
      {/* Layer-uri statice cu fallback vizual solid */}
      
      {/* 1. Radial gradients pentru fundal bogat */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(8, 145, 178, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(190, 18, 60, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(8, 145, 178, 0.08) 0%, transparent 70%)
          `
        }}
      />
      
      {/* 2. Grid pattern */}
      <div className="bg-grid absolute inset-0 opacity-5" />
      
      {/* 3. Noise layer pentru textură */}
      <div className="bg-noise absolute inset-0 opacity-4" />
      
      {/* 4. Container pentru animații dinamice (încărcat lazy) */}
      <div id="bg-animations-container" className="absolute inset-0" />
    </div>
  );
}
