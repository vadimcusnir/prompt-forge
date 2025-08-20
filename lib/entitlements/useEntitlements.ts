'use client';

import { useState, useEffect } from 'react';

export type Plan = 'free' | 'creator' | 'pro' | 'enterprise';

interface Entitlements {
  plan: Plan;
  features: string[];
}

export function useEntitlements(): Entitlements {
  const [entitlements, setEntitlements] = useState<Entitlements>({
    plan: 'free',
    features: ['basic_generation', 'txt_export']
  });

  useEffect(() => {
    // In a real app, this would fetch from your backend
    // For now, we'll use localStorage or default to free
    const storedPlan = localStorage.getItem('userPlan') as Plan;
    if (storedPlan && ['free', 'creator', 'pro', 'enterprise'].includes(storedPlan)) {
      setEntitlements({
        plan: storedPlan,
        features: getFeaturesForPlan(storedPlan)
      });
    }
  }, []);

  return entitlements;
}

function getFeaturesForPlan(plan: Plan): string[] {
  switch (plan) {
    case 'free':
      return ['basic_generation', 'txt_export'];
    case 'creator':
      return ['basic_generation', 'txt_export', 'md_export', 'advanced_generation'];
    case 'pro':
      return ['basic_generation', 'txt_export', 'md_export', 'pdf_export', 'json_export', 'real_testing', 'advanced_generation'];
    case 'enterprise':
      return ['basic_generation', 'txt_export', 'md_export', 'pdf_export', 'json_export', 'bundle_export', 'real_testing', 'advanced_generation', 'custom_modules'];
    default:
      return ['basic_generation', 'txt_export'];
  }
}

// EntitlementChecker class for server-side validation
export class EntitlementChecker {
  private plan: Plan;

  constructor(plan: Plan = 'free') {
    this.plan = plan;
  }

  // Static method for checking feature access
  static checkFeature(planId: string, feature: string): {
    allowed: boolean;
    requiredPlan: string;
    currentPlan: string;
    feature: string;
  } {
    const plan = EntitlementChecker.validatePlan(planId);
    if (!plan) {
      return {
        allowed: false,
        requiredPlan: 'pro',
        currentPlan: planId,
        feature
      };
    }

    // Define feature requirements
    const featureRequirements: Record<string, string> = {
      'canUseAllModules': 'pro',
      'canExportMD': 'free',
      'canExportPDF': 'pro',
      'canExportJSON': 'pro',
      'canExportBundleZip': 'enterprise',
      'canUseGptTestReal': 'pro',
      'hasCloudHistory': 'pro',
      'hasEvaluatorAI': 'pro',
      'hasAPI': 'enterprise',
      'hasWhiteLabel': 'enterprise',
      'hasSeatsGT1': 'enterprise'
    };

    const requiredPlan = featureRequirements[feature] || 'free';
    const planHierarchy = ['free', 'pro', 'enterprise'];
    
    const currentPlanIndex = planHierarchy.indexOf(planId);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    const allowed = currentPlanIndex >= requiredPlanIndex;

    return {
      allowed,
      requiredPlan,
      currentPlan: planId,
      feature
    };
  }

  // Static method for validating plan
  static validatePlan(planId: string): Plan | null {
    const validPlans: Plan[] = ['free', 'pro', 'enterprise'];
    return validPlans.includes(planId as Plan) ? planId as Plan : null;
  }

  canExport(format: string): boolean {
    const features = getFeaturesForPlan(this.plan);
    switch (format) {
      case 'txt':
        return features.includes('txt_export');
      case 'md':
        return features.includes('md_export');
      case 'pdf':
        return features.includes('pdf_export');
      case 'json':
        return features.includes('json_export');
      case 'bundle':
        return features.includes('bundle_export');
      default:
        return false;
    }
  }

  canUseAdvancedGeneration(): boolean {
    const features = getFeaturesForPlan(this.plan);
    return features.includes('advanced_generation');
  }

  canUseRealTesting(): boolean {
    const features = getFeaturesForPlan(this.plan);
    return features.includes('real_testing');
  }

  canUseCustomModules(): boolean {
    const features = getFeaturesForPlan(this.plan);
    return features.includes('custom_modules');
  }

  getPlan(): Plan {
    return this.plan;
  }

  getFeatures(): string[] {
    return getFeaturesForPlan(this.plan);
  }
}

// Default instance for server-side usage
export const entitlementChecker = new EntitlementChecker();
