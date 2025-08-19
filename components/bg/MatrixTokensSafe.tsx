import { useEffect, useRef } from 'react';

function MatrixTokensSafe({ density=20 }:{density?:number}){
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window==='undefined') return;
    const wrap = wrapRef.current; const cvs = canvasRef.current;
    if (!wrap || !cvs) return;

    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const w = Math.max(1, Math.round(wrap.clientWidth));
    const h = Math.max(1, Math.round(wrap.clientHeight));
    cvs.width = Math.round(w*dpr); cvs.height = Math.round(h*dpr);
    cvs.style.width = w+'px'; cvs.style.height = h+'px';
    const ctx = cvs.getContext('2d'); if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const tokens = Array.from({length: Math.max(1,density)}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx:(Math.random()-0.5)*0.08, vy:(Math.random()-0.5)*0.08
    }));

    let last = performance.now();
    const tick = (now:number) => {
      const dt = now-last; last = now;
      ctx.clearRect(0,0,w,h);
      for(const t of tokens){
        t.x += t.vx*dt*0.06; t.y += t.vy*dt*0.06;
        if (t.x<0) t.x=w; if (t.x>w) t.x=0;
        if (t.y<0) t.y=h; if (t.y>h) t.y=0;
        ctx.globalAlpha = 0.8; ctx.fillRect(t.x,t.y,1,1);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [density]);

  return <div ref={wrapRef} className="bg-anim absolute inset-0"><canvas ref={canvasRef}/></div>;
}

export default MatrixTokensSafe;
