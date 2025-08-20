'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-montserrat',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20',
        info: 'border-transparent bg-blue-500/10 text-blue-400 border-blue-500/20',
        error: 'border-transparent bg-red-500/10 text-red-400 border-red-500/20',
        glass: 'bg-white/10 backdrop-blur-sm border-white/20 text-white',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-transparent',
        vector: {
          creative: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          technical: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          analytical: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          compliance: 'bg-red-500/10 text-red-400 border-red-500/20',
          healthcare: 'bg-green-500/10 text-green-400 border-green-500/20',
          financial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          educational: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          organizational: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          risk: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        },
        score: {
          excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          good: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          acceptable: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          poor: 'bg-red-500/10 text-red-400 border-red-500/20',
        },
        plan: {
          free: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          creator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          pro: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          enterprise: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-base',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        ping: 'animate-ping',
        fadeIn: 'animate-in fade-in duration-300',
        slideUp: 'animate-in slide-in-from-bottom-2 duration-300',
        scale: 'hover:scale-105',
        glow: 'hover:shadow-lg hover:shadow-current/50',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface PromptForgeBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function PromptForgeBadge({
  children,
  icon,
  iconPosition = 'left',
  className,
  variant,
  size,
  animation,
  ...props
}: PromptForgeBadgeProps) {
  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className="w-3 h-3">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="w-3 h-3">{icon}</span>
      )}
    </>
  );

  return (
    <Badge
      className={cn(badgeVariants({ variant, size, animation }), className)}
      {...props}
    >
      {content}
    </Badge>
  );
}
