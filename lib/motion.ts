let cached: 'minimal'|'medium'|'auto' = 'auto';
export function getMotionLevel(): 'minimal'|'medium'|'auto' {
  if (cached !== 'auto') return cached;
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cached = reduce ? 'minimal' : 'medium'; // fixează pentru sesiunea curentă
  return cached;
}
