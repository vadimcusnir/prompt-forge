import React, { useEffect, useMemo, useRef } from 'react';
import { dbg } from '@/lib/logger';

type MotionLevel = 'auto'|'medium'|'minimal';
type Props = { motionLevel?: MotionLevel; density?: number; ready?: boolean };

function createTokens(count: number, width: number, height: number) {
  // Creează o listă fixă, independentă de render
  const tokens = new Array(count).fill(0).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.08,   // drift foarte mic
    vy: (Math.random() - 0.5) * 0.08,
    life: 12000 + Math.random() * 6000
  }));
  return tokens;
}

const MatrixTokens = React.memo(({ motionLevel = 'auto', density = 24, ready = false }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // Inițializează dimensiunile fără să reintri în bucle
  const { w, h } = (() => {
    const el = rootRef.current;
    return { w: el ? el.clientWidth : 0, h: el ? el.clientHeight : 0 };
  })();

  const tokenCount = Math.max(0, density);
  const tokensRef = useRef<ReturnType<typeof createTokens> | null>(null);
  const rafRef = useRef<number>(0);
  const initedRef = useRef(false);

  // Mount o singură dată canvasul
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    initedRef.current = true;
    dbg.log('MatrixTokens: init once, motionLevel:', motionLevel);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current = null;
      initedRef.current = false;
    };
    // deps goale: nu reintegra la fiecare render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize canvas doar când dimensiunile S-AU SCHIMBAT real
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !initedRef.current) return;
    const cw = Math.max(1, Math.round(w * dpr));
    const ch = Math.max(1, Math.round(h * dpr));
    if (canvas.width === cw && canvas.height === ch) return;

    canvas.width = cw; canvas.height = ch;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dbg.log('MatrixTokens: canvas resized', { w, h, dpr });
  }, [w, h, dpr]);

  // Generează tokenii doar când:
  // 1) ești ready
  // 2) ai dimensiuni non-zero
  // 3) s-a schimbat density
  useEffect(() => {
    if (!ready || !w || !h) return;
    if (tokenCount === 0) {
      tokensRef.current = null; // nimic de randat => niciun rAF
      dbg.log('MatrixTokens: empty set, skip raf loop');
      return;
    }
    tokensRef.current = createTokens(tokenCount, w, h);
    dbg.log('MatrixTokens: tokens created:', tokenCount);
  }, [ready, w, h, tokenCount]);

  // Loop de desen – NU folosi setState, nu loga pe frame
  useEffect(() => {
    if (!ready || !tokensRef.current || !ctxRef.current) return;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last; last = now;
      const ctx = ctxRef.current!;
      const tokens = tokensRef.current!;
      ctx.clearRect(0, 0, w, h);

      for (const t of tokens) {
        t.x += t.vx * dt * 0.06; // foarte lent
        t.y += t.vy * dt * 0.06;
        if (t.x < 0) t.x = w; if (t.x > w) t.x = 0;
        if (t.y < 0) t.y = h; if (t.y > h) t.y = 0;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(t.x, t.y, 1, 1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, w, h]);

  return (
    <div ref={rootRef} className="bg-anim absolute inset-0">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default MatrixTokens;
