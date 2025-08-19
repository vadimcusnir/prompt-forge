const isBrowser = typeof window !== 'undefined';
const DEBUG =
  process.env.NEXT_PUBLIC_DEBUG_BG === '1' ||
  (isBrowser && (localStorage.getItem('DEBUG_BG') === '1' ||
   new URLSearchParams(location.search).has('debug_bg')));

export const dbg = {
  log: (...a: any[]) => { if (DEBUG) console.log('[BG]', ...a); },
  warn: (...a: any[]) => { if (DEBUG) console.warn('[BG]', ...a); },
  error: (...a: any[]) => console.error('[BG]', ...a)
};
