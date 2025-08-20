'use client';

import { useState, useEffect } from 'react';

export interface Entitlements {
  canUseAllModules: boolean;
  canExportMD: boolean;
  canExportPDF: boolean;
  canExportJSON: boolean;
  canUseGptTestReal: boolean;
  hasCloudHistory: boolean;
  hasEvaluatorAI: boolean;
  hasAPI: boolean;
  hasWhiteLabel: boolean;
  canExportBundleZip: boolean;
  hasSeatsGT1: boolean;
}

export interface UserPlan {
  code: string;
  name: string;
  entitlements: Entitlements;
  module_allowlist: string[] | 'ALL';
  exports_allowed: string[];
  retention_days: number;
}

const PLANS: Record<string, UserPlan> = {
  free: {
    code: 'free',
    name: 'Free',
    entitlements: {
      canUseAllModules: false,
      canExportMD: false,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: false,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    module_allowlist: ['M01', 'M10', 'M18'],
    exports_allowed: ['txt'],
    retention_days: 7,
  },
  creator: {
    code: 'creator',
    name: 'Creator',
    entitlements: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: false,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    module_allowlist: 'ALL',
    exports_allowed: ['txt', 'md'],
    retention_days: 30,
  },
  pro: {
    code: 'pro',
    name: 'Pro',
    entitlements: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    module_allowlist: 'ALL',
    exports_allowed: ['txt', 'md', 'json', 'pdf'],
    retention_days: 90,
  },
  enterprise: {
    code: 'enterprise',
    name: 'Enterprise',
    entitlements: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: true,
      hasWhiteLabel: true,
      canExportBundleZip: true,
      hasSeatsGT1: true,
    },
    module_allowlist: 'ALL',
    exports_allowed: ['txt', 'md', 'json', 'pdf', 'bundle'],
    retention_days: -1,
  },
};

export function useEntitlements() {
  const [userPlan, setUserPlan] = useState<UserPlan>(PLANS.free);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulare fetch user plan din API/database
    const fetchUserPlan = async () => {
      try {
        // TODO: Implementează fetch real din API
        // const response = await fetch('/api/user/subscription');
        // const data = await response.json();
        
        // Pentru acum, simulez un plan din localStorage sau default
        const savedPlan = localStorage.getItem('promptforge_user_plan') || 'free';
        const plan = PLANS[savedPlan] || PLANS.free;
        
        setUserPlan(plan);
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setUserPlan(PLANS.free); // Fallback la Free
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPlan();
  }, []);

  const hasEntitlement = (entitlement: keyof Entitlements): boolean => {
    return userPlan.entitlements[entitlement];
  };

  const canExportFormat = (format: string): boolean => {
    return userPlan.exports_allowed.includes(format);
  };

  const canUseModule = (moduleId: string): boolean => {
    if (userPlan.module_allowlist === 'ALL') {
      return true;
    }
    return Array.isArray(userPlan.module_allowlist) && 
           userPlan.module_allowlist.includes(moduleId);
  };

  const upgradeTo = (newPlan: string) => {
    if (PLANS[newPlan]) {
      localStorage.setItem('promptforge_user_plan', newPlan);
      setUserPlan(PLANS[newPlan]);
    }
  };

  return {
    userPlan,
    isLoading,
    hasEntitlement,
    canExportFormat,
    canUseModule,
    upgradeTo,
    // Convenience getters
    canUseGptTestReal: hasEntitlement('canUseGptTestReal'),
    canExportPDF: hasEntitlement('canExportPDF'),
    canExportJSON: hasEntitlement('canExportJSON'),
    canExportBundleZip: hasEntitlement('canExportBundleZip'),
    hasAPI: hasEntitlement('hasAPI'),
    hasEvaluatorAI: hasEntitlement('hasEvaluatorAI'),
  };
}
