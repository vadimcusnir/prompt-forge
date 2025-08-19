let cached: 'minimal'|'medium'|'auto' = 'auto';
export function getMotionLevel(): 'minimal'|'medium'|'auto' {
  if (cached !== 'auto') return cached;
  // FIX: Motion activ implicit - nu mai verifică prefers-reduced-motion
  cached = 'auto';
  return cached;
}
