import { useEffect, useState } from 'react';

export function useCanvasSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, prevW = 0, prevH = 0;

    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      // Throttle la un rAF + ignoră schimbări sub 1px
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.round(cr.width);
        const h = Math.round(cr.height);
        if (w === prevW && h === prevH) return;
        prevW = w; prevH = h;
        setSize({ w, h });
      });
    });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [ref]);
  return size;
}
