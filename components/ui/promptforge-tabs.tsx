'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { VariantProps, cva } from 'class-variance-authority';

const tabsListVariants = cva(
  'inline-flex h-12 items-center justify-center rounded-lg bg-muted/50 backdrop-blur-sm p-1 text-muted-foreground border border-border/30',
  {
    variants: {
      variant: {
        default: 'bg-muted/50',
        glass: 'bg-white/10 backdrop-blur-sm border-white/20',
        card: 'bg-card/50 backdrop-blur-sm border-border/50',
        minimal: 'bg-transparent border-none p-0',
      },
      size: {
        default: 'h-12',
        sm: 'h-10',
        lg: 'h-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-montserrat',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        glass: 'data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/30',
        card: 'data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm data-[state=active]:border-border',
        minimal: 'data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary',
      },
      size: {
        default: 'px-3 py-1.5 text-sm',
        sm: 'px-2 py-1 text-xs',
        lg: 'px-4 py-2 text-base',
      },
      animation: {
        none: '',
        slide: 'data-[state=active]:animate-in data-[state=active]:slide-in-from-bottom-2 data-[state=active]:duration-200',
        fade: 'data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:duration-200',
        scale: 'data-[state=active]:scale-105',
        glow: 'data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        glass: 'bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4',
        card: 'bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4',
        minimal: '',
      },
      animation: {
        none: '',
        slide: 'animate-in slide-in-from-bottom-2 duration-300',
        fade: 'animate-in fade-in duration-300',
        scale: 'animate-in zoom-in-95 duration-300',
      },
    },
    defaultVariants: {
      variant: 'default',
      animation: 'none',
    },
  }
);

export interface PromptForgeTabsProps
  extends VariantProps<typeof tabsListVariants>,
    VariantProps<typeof tabsTriggerVariants>,
    VariantProps<typeof tabsContentVariants> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
}

export interface PromptForgeTabProps {
  value: string;
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function PromptForgeTabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  tabsContentClassName,
  variant: listVariant,
  size: listSize,
  ...listProps
}: PromptForgeTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <TabsList
        className={cn(
          tabsListVariants({ variant: listVariant, size: listSize }),
          tabsListClassName
        )}
      >
        {children}
      </TabsList>
    </Tabs>
  );
}

export function PromptForgeTab({
  value,
  label,
  icon,
  children,
  disabled = false,
  className,
  variant: triggerVariant,
  size: triggerSize,
  animation: triggerAnimation,
  ...triggerProps
}: PromptForgeTabProps & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <>
      <TabsTrigger
        value={value}
        disabled={disabled}
        className={cn(
          tabsTriggerVariants({ variant: triggerVariant, size: triggerSize, animation: triggerAnimation }),
          className
        )}
        {...triggerProps}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {label}
      </TabsTrigger>
      <TabsContent
        value={value}
        className={cn(
          tabsContentVariants({ variant: triggerVariant, animation: triggerAnimation }),
          className
        )}
      >
        {children}
      </TabsContent>
    </>
  );
}
