export const BG_ROUTE_OVERRIDES: Record<string, {desktop:number; mobile:number; maxQuotes:number; enabled:boolean}> = {
  '/':           { desktop: 24, mobile: 12, maxQuotes: 1, enabled: true },
  '/generator':  { desktop: 18, mobile: 10, maxQuotes: 1, enabled: true },
  '/coming-soon':{ desktop: 16, mobile: 10, maxQuotes: 0, enabled: true }, // tokens on, quotes off
};

export function getDensity({ routeKey }: { routeKey?: string }) {
  const r = typeof window !== 'undefined' ? (routeKey || location.pathname) : (routeKey || '/');
  const o = BG_ROUTE_OVERRIDES[r] ?? BG_ROUTE_OVERRIDES['/'];
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
  return Math.max(1, isMobile ? o.mobile : o.desktop);
}

export function getMaxQuotes({ routeKey }: { routeKey?: string }) {
  const r = typeof window !== 'undefined' ? (routeKey || location.pathname) : (routeKey || '/');
  const o = BG_ROUTE_OVERRIDES[r] ?? BG_ROUTE_OVERRIDES['/'];
  return o.maxQuotes;
}

export function isBackgroundEnabled({ routeKey }: { routeKey?: string }) {
  const r = typeof window !== 'undefined' ? (routeKey || location.pathname) : (routeKey || '/');
  const o = BG_ROUTE_OVERRIDES[r] ?? BG_ROUTE_OVERRIDES['/'];
  return o.enabled;
}
