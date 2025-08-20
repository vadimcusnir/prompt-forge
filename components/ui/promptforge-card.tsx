'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface PromptForgeCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  kpi?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  };
  vector?: {
    name: string;
    color: string;
  };
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'featured' | 'interactive';
  badge?: ReactNode;
  footer?: ReactNode;
}

export function PromptForgeCard({
  title,
  description,
  icon,
  kpi,
  vector,
  children,
  className,
  onClick,
  variant = 'default',
  badge,
  footer
}: PromptForgeCardProps) {
  const baseClasses = cn(
    'group relative overflow-hidden transition-all duration-300',
    'bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl',
    'hover:border-primary/30 hover:bg-card/70',
    'hover:shadow-lg hover:shadow-primary/10',
    variant === 'featured' && 'ring-2 ring-primary/20 bg-primary/5',
    variant === 'interactive' && 'cursor-pointer hover:scale-[1.02]',
    className
  );

  const kpiColorClasses = {
    up: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    down: 'text-red-400 bg-red-400/10 border-red-400/20',
    neutral: 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  };

  return (
    <Card className={baseClasses} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground font-montserrat group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-muted-foreground font-open-sans mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {badge && (
            <div className="flex-shrink-0">
              {badge}
            </div>
          )}
        </div>

        {/* KPI and Vector Row */}
        {(kpi || vector) && (
          <div className="flex items-center justify-between mt-3">
            {kpi && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'px-2 py-1 rounded-lg text-xs font-semibold border',
                  kpi.trend ? kpiColorClasses[kpi.trend] : 'text-primary bg-primary/10 border-primary/20'
                )}>
                  <span className="font-montserrat">{kpi.value}</span>
                  <span className="text-muted-foreground ml-1">{kpi.label}</span>
                </div>
                {kpi.trend && (
                  <span className={cn(
                    'text-xs',
                    kpi.trend === 'up' ? 'text-emerald-400' : 
                    kpi.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                  )}>
                    {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'}
                  </span>
                )}
              </div>
            )}
            
            {vector && (
              <span className={cn(
                'px-2 py-1 rounded-lg text-xs font-semibold border',
                vector.color
              )}>
                {vector.name}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}

      {footer && (
        <CardFooter className="pt-3 border-t border-border/30">
          {footer}
        </CardFooter>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </Card>
  );
}
