'use client';

import { ReactNode, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, Building2 } from 'lucide-react';
import { useEntitlements } from '@/hooks/use-entitlements';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface ProtectedButtonProps extends Omit<ButtonProps, 'onClick'> {
  feature: string;
  requiredPlan: 'creator' | 'pro' | 'enterprise';
  onClickProtected?: () => void;
  children: ReactNode;
}

const PLAN_CONFIG = {
  creator: {
    name: 'Creator',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
  },
  pro: {
    name: 'Pro',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building2,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
};

export function ProtectedButton({ 
  feature, 
  requiredPlan, 
  onClickProtected, 
  children, 
  ...buttonProps 
}: ProtectedButtonProps) {
  const { userPlan } = useEntitlements();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Verifică dacă user-ul are acces
  const hasAccess = () => {
    const planHierarchy = ['free', 'creator', 'pro', 'enterprise'];
    const userLevel = planHierarchy.indexOf(userPlan.code);
    const requiredLevel = planHierarchy.indexOf(requiredPlan);
    return userLevel >= requiredLevel;
  };

  const handleClick = () => {
    if (hasAccess()) {
      onClickProtected?.();
    } else {
      setShowUpgradeDialog(true);
    }
  };

  const handleUpgrade = () => {
    window.location.href = `/pricing?plan=${requiredPlan}`;
  };

  const planConfig = PLAN_CONFIG[requiredPlan];
  const PlanIcon = planConfig.icon;

  return (
    <>
      <Button
        {...buttonProps}
        onClick={handleClick}
        className={`relative ${buttonProps.className || ''}`}
      >
        {!hasAccess() && (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {children}
        {!hasAccess() && (
          <Badge 
            variant="secondary" 
            className="ml-2 text-xs"
          >
            {planConfig.name}
          </Badge>
        )}
      </Button>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className={`w-16 h-16 ${planConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Lock className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center">
              {feature} requires {planConfig.name}
            </DialogTitle>
            <DialogDescription className="text-center">
              Upgrade your plan to unlock this powerful feature and many more.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <PlanIcon className={`w-4 h-4 ${planConfig.color}`} />
              Current: {userPlan.name}
            </Badge>
            <span className="mx-4">→</span>
            <Badge className={`${planConfig.bgColor} text-white flex items-center gap-2`}>
              <PlanIcon className="w-4 h-4" />
              {planConfig.name}
            </Badge>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to {planConfig.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Convenience components pentru features specifice
export function GPTTestButton({ children, onClickProtected, ...props }: Omit<ProtectedButtonProps, 'feature' | 'requiredPlan'>) {
  return (
    <ProtectedButton 
      feature="GPT Live Testing" 
      requiredPlan="pro"
      onClickProtected={onClickProtected}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
}

export function PDFExportButton({ children, onClickProtected, ...props }: Omit<ProtectedButtonProps, 'feature' | 'requiredPlan'>) {
  return (
    <ProtectedButton 
      feature="PDF Export" 
      requiredPlan="pro"
      onClickProtected={onClickProtected}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
}

export function JSONExportButton({ children, onClickProtected, ...props }: Omit<ProtectedButtonProps, 'feature' | 'requiredPlan'>) {
  return (
    <ProtectedButton 
      feature="JSON Export" 
      requiredPlan="pro"
      onClickProtected={onClickProtected}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
}

export function BundleExportButton({ children, onClickProtected, ...props }: Omit<ProtectedButtonProps, 'feature' | 'requiredPlan'>) {
  return (
    <ProtectedButton 
      feature="Bundle ZIP Export" 
      requiredPlan="enterprise"
      onClickProtected={onClickProtected}
      {...props}
    >
      {children}
    </ProtectedButton>
  );
}
