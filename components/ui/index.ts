// PromptForge™ UI Kit - Component Exports
// Built with shadcn/ui and Radix primitives

// Core Components
export { PromptForgeCard } from './promptforge-card';
export { PromptForgeButton } from './promptforge-button';
export { PromptForgeBadge } from './promptforge-badge';
export { PromptForgeTabs, PromptForgeTab } from './promptforge-tabs';

// 7D Parameter Engine
export { 
  SevenDEngine, 
  type SevenDParams,
  DOMAIN_OPTIONS,
  SCALE_OPTIONS,
  URGENCY_OPTIONS,
  COMPLEXITY_OPTIONS,
  RESOURCES_OPTIONS,
  APPLICATION_OPTIONS,
  OUTPUT_OPTIONS
} from './seven-d-engine';

// Demo/Showcase Component
export { PromptForgeUIKit } from './promptforge-ui-kit';

// Re-export base shadcn/ui components for convenience
export { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './card';

export { Button } from './button';
export { Badge } from './badge';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
