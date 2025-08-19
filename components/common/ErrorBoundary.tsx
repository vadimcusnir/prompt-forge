'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<{name?:string, children:React.ReactNode},{err?:any}>{
  constructor(p:any){ super(p); this.state={err:undefined}; }
  static getDerivedStateFromError(err:any){ return {err}; }
  componentDidCatch(err:any, info:any){ console.error(`[EB:${this.props.name||'BG'}]`, err, info); }
  render(){
    if(this.state.err){
      // fallback static (grid+noise) ca să nu rămână gol
      return <div className="bg-fixed-root" aria-hidden="true">
        <div className="bg-grid absolute inset-0 opacity-5" />
        <div className="bg-noise absolute inset-0 opacity-5" />
      </div>;
    }
    return this.props.children as any;
  }
}
