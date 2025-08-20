'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, Building2 } from 'lucide-react';
import { useEntitlements } from '@/hooks/use-entitlements';

interface PaywallProps {
  feature: string;
  requiredPlan: 'creator' | 'pro' | 'enterprise';
  children: ReactNode;
  className?: string;
}

const PLAN_CONFIG = {
  creator: {
    name: 'Creator',
    icon: Zap,
    color: 'bg-blue-500',
    description: 'Advanced features for content creators',
  },
  pro: {
    name: 'Pro',
    icon: Crown,
    color: 'bg-purple-500',
    description: 'Professional tools and integrations',
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building2,
    color: 'bg-green-500',
    description: 'Enterprise-grade capabilities',
  },
};

export function Paywall({ feature, requiredPlan, children, className }: PaywallProps) {
  const { userPlan } = useEntitlements();
  
  // Verifică dacă user-ul are acces la feature
  const hasAccess = () => {
    const planHierarchy = ['free', 'creator', 'pro', 'enterprise'];
    const userLevel = planHierarchy.indexOf(userPlan.code);
    const requiredLevel = planHierarchy.indexOf(requiredPlan);
    return userLevel >= requiredLevel;
  };

  const handleUpgrade = () => {
    // Redirect la pricing page cu plan-ul specific
    window.location.href = `/pricing?plan=${requiredPlan}`;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const planConfig = PLAN_CONFIG[requiredPlan];
  const PlanIcon = planConfig.icon;

  return (
    <div className={className}>
      <Card className="relative p-6 border-2 border-dashed border-gray-300 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Lock overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center max-w-sm">
            <div className={`w-16 h-16 ${planConfig.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {feature} requires {planConfig.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {planConfig.description}
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <PlanIcon className="w-3 h-3" />
                {planConfig.name}
              </Badge>
            </div>
            
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to {planConfig.name}
            </Button>
          </div>
        </div>
        
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
      </Card>
    </div>
  );
}

// Convenience components pentru features specifice
export function GPTTestPaywall({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Paywall 
      feature="GPT Live Testing" 
      requiredPlan="pro" 
      className={className}
    >
      {children}
    </Paywall>
  );
}

export function PDFExportPaywall({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Paywall 
      feature="PDF Export" 
      requiredPlan="pro" 
      className={className}
    >
      {children}
    </Paywall>
  );
}

export function JSONExportPaywall({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Paywall 
      feature="JSON Export" 
      requiredPlan="pro" 
      className={className}
    >
      {children}
    </Paywall>
  );
}

export function BundleExportPaywall({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Paywall 
      feature="Bundle ZIP Export" 
      requiredPlan="enterprise" 
      className={className}
    >
      {children}
    </Paywall>
  );
}

export function APIPaywall({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Paywall 
      feature="API Access" 
      requiredPlan="enterprise" 
      className={className}
    >
      {children}
    </Paywall>
  );
}
