'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Textarea } from './textarea';
import { PromptForgeBadge } from './promptforge-badge';

// 7D Parameter Types
export interface SevenDParams {
  domain: string;
  scale: string;
  urgency: string;
  complexity: string;
  resources: string;
  application: string;
  output: string;
}

export interface SevenDEngineProps {
  value: SevenDParams;
  onChange: (params: SevenDParams) => void;
  className?: string;
  disabled?: boolean;
  showLabels?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

// Parameter Options
export const DOMAIN_OPTIONS = [
  { value: 'fintech', label: 'FinTech', description: 'Financial technology and services', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Online retail and marketplaces', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical and health services', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'education', label: 'Education', description: 'Learning and training platforms', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'legal', label: 'Legal', description: 'Legal services and compliance', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'manufacturing', label: 'Manufacturing', description: 'Industrial production and operations', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'consulting', label: 'Consulting', description: 'Professional advisory services', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'startup', label: 'Startup', description: 'Early-stage companies and innovation', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
];

export const SCALE_OPTIONS = [
  { value: 'personal_brand', label: 'Personal Brand', description: 'Individual professional presence' },
  { value: 'solo', label: 'Solo', description: 'Single person operation' },
  { value: 'startup', label: 'Startup', description: 'Early-stage company (1-10 people)' },
  { value: 'smb', label: 'SMB', description: 'Small to medium business (10-100 people)' },
  { value: 'boutique_agency', label: 'Boutique Agency', description: 'Specialized service agency' },
  { value: 'corporate', label: 'Corporate', description: 'Large organization (100+ people)' },
  { value: 'enterprise', label: 'Enterprise', description: 'Major corporation (1000+ people)' },
];

export const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'No immediate deadline', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'planned', label: 'Planned', description: 'Scheduled project with timeline', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'sprint', label: 'Sprint', description: 'Quick turnaround needed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'pilot', label: 'Pilot', description: 'Test phase with deadlines', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'crisis', label: 'Crisis', description: 'Emergency response required', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export const COMPLEXITY_OPTIONS = [
  { value: 'foundational', label: 'Foundational', description: 'Basic concepts and simple tasks' },
  { value: 'standard', label: 'Standard', description: 'Common business processes' },
  { value: 'advanced', label: 'Advanced', description: 'Complex workflows and systems' },
  { value: 'expert', label: 'Expert', description: 'Specialized knowledge required' },
];

export const RESOURCES_OPTIONS = [
  { value: 'minimal', label: 'Minimal', description: 'Limited budget and resources' },
  { value: 'solo', label: 'Solo', description: 'Single person can handle' },
  { value: 'lean_team', label: 'Lean Team', description: 'Small dedicated team' },
  { value: 'agency_stack', label: 'Agency Stack', description: 'Full agency support' },
  { value: 'full_stack_org', label: 'Full Stack Org', description: 'Complete organizational support' },
  { value: 'enterprise_budget', label: 'Enterprise Budget', description: 'Unlimited resources available' },
];

export const APPLICATION_OPTIONS = [
  { value: 'training', label: 'Training', description: 'Educational and learning purposes' },
  { value: 'audit', label: 'Audit', description: 'Review and assessment' },
  { value: 'implementation', label: 'Implementation', description: 'Putting plans into action' },
  { value: 'strategy_design', label: 'Strategy Design', description: 'Planning and strategic thinking' },
  { value: 'crisis_response', label: 'Crisis Response', description: 'Emergency management' },
  { value: 'experimentation', label: 'Experimentation', description: 'Testing and innovation' },
  { value: 'documentation', label: 'Documentation', description: 'Creating and organizing content' },
];

export const OUTPUT_OPTIONS = [
  { value: 'txt', label: 'Text', description: 'Plain text format' },
  { value: 'md', label: 'Markdown', description: 'Structured markdown' },
  { value: 'checklist', label: 'Checklist', description: 'Action item list' },
  { value: 'spec', label: 'Specification', description: 'Detailed requirements' },
  { value: 'playbook', label: 'Playbook', description: 'Step-by-step guide' },
  { value: 'json', label: 'JSON', description: 'Structured data format' },
  { value: 'yaml', label: 'YAML', description: 'Configuration format' },
  { value: 'diagram', label: 'Diagram', description: 'Visual representation' },
  { value: 'bundle', label: 'Bundle', description: 'Complete package' },
];

// Individual Parameter Components
interface ParameterSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string; color?: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

function ParameterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  variant = 'default'
}: ParameterSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className={cn('space-y-2', className)}>
      {variant !== 'compact' && (
        <Label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={cn(
          'bg-background/50 backdrop-blur-sm border-border/50',
          'hover:border-primary/30 focus:border-primary/50',
          'transition-all duration-200',
          variant === 'compact' && 'h-9 text-sm'
        )}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:bg-accent/50 focus:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.label}</span>
                {option.color && (
                  <PromptForgeBadge
                    variant="default"
                    size="sm"
                    className={cn('ml-auto', option.color)}
                  >
                    {option.label}
                  </PromptForgeBadge>
                )}
              </div>
              {option.description && variant === 'detailed' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedOption && variant === 'detailed' && (
        <p className="text-xs text-muted-foreground">
          {selectedOption.description}
        </p>
      )}
    </div>
  );
}

// Main 7D Engine Component
export function SevenDEngine({
  value,
  onChange,
  className,
  disabled = false,
  showLabels = true,
  variant = 'default'
}: SevenDEngineProps) {
  const updateParam = (key: keyof SevenDParams, newValue: string) => {
    onChange({ ...value, [key]: newValue });
  };

  const gridCols = variant === 'compact' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-2';
  const spacing = variant === 'compact' ? 'gap-3' : 'gap-4';

  return (
    <div className={cn('space-y-4', className)}>
      {showLabels && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground font-montserrat">
            7D Parameter Engine
          </h3>
          <p className="text-sm text-muted-foreground font-open-sans">
            Configure operational parameters for optimal prompt generation
          </p>
        </div>
      )}

      <div className={cn('grid', gridCols, spacing)}>
        <ParameterSelect
          label="Domain"
          value={value.domain}
          options={DOMAIN_OPTIONS}
          onChange={(val) => updateParam('domain', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Scale"
          value={value.scale}
          options={SCALE_OPTIONS}
          onChange={(val) => updateParam('scale', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Urgency"
          value={value.urgency}
          options={URGENCY_OPTIONS}
          onChange={(val) => updateParam('urgency', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Complexity"
          value={value.complexity}
          options={COMPLEXITY_OPTIONS}
          onChange={(val) => updateParam('complexity', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Resources"
          value={value.resources}
          options={RESOURCES_OPTIONS}
          onChange={(val) => updateParam('resources', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Application"
          value={value.application}
          options={APPLICATION_OPTIONS}
          onChange={(val) => updateParam('application', val)}
          disabled={disabled}
          required
          variant={variant}
        />

        <ParameterSelect
          label="Output Format"
          value={value.output}
          options={OUTPUT_OPTIONS}
          onChange={(val) => updateParam('output', val)}
          disabled={disabled}
          required
          variant={variant}
        />
      </div>

      {/* Parameter Summary */}
      {variant === 'detailed' && (
        <div className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 border border-border/30">
          <h4 className="text-sm font-medium text-foreground mb-3">Parameter Summary</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(value).map(([key, val]) => {
              const option = [
                ...DOMAIN_OPTIONS,
                ...SCALE_OPTIONS,
                ...URGENCY_OPTIONS,
                ...COMPLEXITY_OPTIONS,
                ...RESOURCES_OPTIONS,
                ...APPLICATION_OPTIONS,
                ...OUTPUT_OPTIONS
              ].find(opt => opt.value === val);
              
              return (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="ml-1 text-foreground font-medium">
                    {option?.label || val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
