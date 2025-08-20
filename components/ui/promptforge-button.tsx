'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-montserrat',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/20',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20',
        warning: 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg hover:shadow-xl hover:shadow-amber-500/20',
        info: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8 text-lg',
        xl: 'h-14 px-10 text-xl',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        spin: 'animate-spin',
        ping: 'animate-ping',
        fadeIn: 'animate-in fade-in duration-300',
        slideUp: 'animate-in slide-in-from-bottom-2 duration-300',
        scale: 'hover:scale-105 active:scale-95',
        glow: 'hover:shadow-lg hover:shadow-primary/50',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface PromptForgeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function PromptForgeButton({
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className,
  variant,
  size,
  animation,
  ...props
}: PromptForgeButtonProps) {
  const content = (
    <>
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span className={cn(loading && 'ml-2')}>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  return (
    <Button
      className={cn(
        buttonVariants({ variant, size, animation }),
        fullWidth && 'w-full',
        className
      )}
      disabled={loading}
      {...props}
    >
      {content}
    </Button>
  );
}
