// Kill-switch pentru animații - multiple nivele de control
let cached: 'minimal'|'medium'|'auto' = 'minimal'; // Default la minimal pentru siguranță

// Verifică kill-switch-ul pentru animații
export function isAnimationKillSwitchActive(): boolean {
  // 1. Variabilă de mediu (cel mai strict)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DISABLE_ANIMATIONS === 'true') {
    return true;
  }
  
  // 2. Local storage (persistent per user)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('promptforge_disable_animations');
    if (stored === 'true') {
      return true;
    }
  }
  
  // 3. Query parameter (temporary override)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('disable_animations') === 'true') {
      return true;
    }
  }
  
  // 4. User preference (reduced motion)
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
  }
  
  return false;
}

// Verifică dacă animațiile sunt complet dezactivate
export function areAnimationsCompletelyDisabled(): boolean {
  return isAnimationKillSwitchActive();
}

// Verifică dacă animațiile sunt în mod minimal
export function areAnimationsMinimal(): boolean {
  if (isAnimationKillSwitchActive()) {
    return true;
  }
  
  // Verifică preferințele user-ului
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
  }
  
  return false;
}

export function getMotionLevel(): 'minimal'|'medium'|'auto' {
  // Kill-switch activ - forțează minimal
  if (isAnimationKillSwitchActive()) {
    return 'minimal';
  }
  
  // Cache pentru performanță
  if (cached !== 'auto') return cached;
  
  // Verifică preferințele user-ului
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cached = 'minimal';
      return cached;
    }
  }
  
  // Default la medium pentru echilibru între performanță și estetică
  cached = 'medium';
  return cached;
}

// Funcție pentru a seta kill-switch-ul
export function setAnimationKillSwitch(disabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('promptforge_disable_animations', disabled.toString());
    
    // Forțează refresh-ul cache-ului
    cached = 'auto';
    
    // Dispatch event pentru a notifica componentele
    window.dispatchEvent(new CustomEvent('promptforge_animations_toggled', {
      detail: { disabled }
    }));
  }
}

// Funcție pentru a verifica statusul kill-switch-ului
export function getAnimationKillSwitchStatus(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('promptforge_disable_animations');
    return stored === 'true';
  }
  return false;
}
