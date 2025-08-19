export const BG_ROUTE_OVERRIDES = {
  '/':            { desktop: 24, mobile: 12, maxQuotes: 1, enabled: true },
  '/generator':   { desktop: 18, mobile: 10, maxQuotes: 1, enabled: true },
  '/coming-soon': { desktop: 16, mobile: 10, maxQuotes: 0, enabled: true },
} as const;

export function getDensity(route?: string) {
  const r = typeof window !== 'undefined' ? (route || location.pathname) : (route || '/');
  const o = (BG_ROUTE_OVERRIDES as any)[r] ?? BG_ROUTE_OVERRIDES['/'];
  const isMobile = typeof window !== 'undefined' && matchMedia('(max-width:640px)').matches;
  return Math.max(1, isMobile ? o.mobile : o.desktop);
}

export function getMaxQuotes(route?: string) {
  const r = typeof window !== 'undefined' ? (route || location.pathname) : (route || '/');
  const o = (BG_ROUTE_OVERRIDES as any)[r] ?? BG_ROUTE_OVERRIDES['/'];
  return o.maxQuotes;
}

export function isBackgroundEnabled(route?: string) {
  const r = typeof window !== 'undefined' ? (route || location.pathname) : (route || '/');
  const o = (BG_ROUTE_OVERRIDES as any)[r] ?? BG_ROUTE_OVERRIDES['/'];
  return o.enabled;
}
