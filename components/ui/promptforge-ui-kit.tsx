'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  FileText, 
  Download, 
  History, 
  Settings,
  Play,
  Pause,
  Stop,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Target
} from 'lucide-react';

import { PromptForgeCard } from './promptforge-card';
import { PromptForgeButton } from './promptforge-button';
import { PromptForgeBadge } from './promptforge-badge';
import { PromptForgeTabs, PromptForgeTab } from './promptforge-tabs';
import { SevenDEngine, type SevenDParams } from './seven-d-engine';

// Sample data for demonstration
const SAMPLE_MODULES = [
  {
    id: 'M01',
    name: 'Content Generation',
    description: 'Generate engaging content for various platforms with AI assistance',
    kpi: { value: 92, label: 'Score', trend: 'up' as const },
    vector: { name: 'Creative', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }
  },
  {
    id: 'M02',
    name: 'Code Review',
    description: 'Comprehensive code analysis and improvement suggestions',
    kpi: { value: 89, label: 'Score', trend: 'neutral' as const },
    vector: { name: 'Technical', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }
  },
  {
    id: 'M03',
    name: 'Data Analysis',
    description: 'Deep data insights and statistical analysis for business decisions',
    kpi: { value: 94, label: 'Score', trend: 'up' as const },
    vector: { name: 'Analytical', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' }
  },
  {
    id: 'M04',
    name: 'Legal Document Review',
    description: 'Legal document analysis and risk assessment with compliance checks',
    kpi: { value: 87, label: 'Score', trend: 'down' as const },
    vector: { name: 'Compliance', color: 'text-red-400 bg-red-400/10 border-red-400/20' }
  },
  {
    id: 'M05',
    name: 'Medical Diagnosis Support',
    description: 'AI-assisted medical diagnosis and treatment planning assistance',
    kpi: { value: 91, label: 'Score', trend: 'up' as const },
    vector: { name: 'Healthcare', color: 'text-green-400 bg-green-400/10 border-green-400/20' }
  },
  {
    id: 'M06',
    name: 'Financial Planning',
    description: 'Personal and business financial planning with risk assessment',
    kpi: { value: 88, label: 'Score', trend: 'neutral' as const },
    vector: { name: 'Financial', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  }
];

const defaultSevenD: SevenDParams = {
  domain: 'fintech',
  scale: 'startup',
  urgency: 'planned',
  complexity: 'standard',
  resources: 'lean_team',
  application: 'strategy_design',
  output: 'playbook'
};

export function PromptForgeUIKit() {
  const [sevenDParams, setSevenDParams] = useState<SevenDParams>(defaultSevenD);
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground font-montserrat">
            PromptForge™ UI Kit
          </h1>
        </div>
        <p className="text-lg text-muted-foreground font-open-sans max-w-2xl mx-auto">
          Comprehensive React/TypeScript components built with shadcn/ui and Radix primitives. 
          Featuring glassmorphic design, dark theme, and accessibility-first approach.
        </p>
      </div>

      {/* Main Navigation Tabs */}
      <PromptForgeTabs
        defaultValue="generator"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="glass"
        size="lg"
        className="w-full"
      >
        <PromptForgeTab
          value="generator"
          label="Generator"
          icon={<Sparkles className="w-4 h-4" />}
          variant="glass"
          animation="slide"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground font-montserrat mb-2">
                Module Library
              </h2>
              <p className="text-muted-foreground font-open-sans">
                Browse and select from our comprehensive collection of specialized modules
              </p>
            </div>

            {/* Module Grid - 3 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_MODULES.map((module) => (
                <PromptForgeCard
                  key={module.id}
                  title={module.name}
                  description={module.description}
                  icon={<FileText className="w-5 h-5" />}
                  kpi={module.kpi}
                  vector={module.vector}
                  variant="interactive"
                  className="animate-in fade-in duration-500"
                  footer={
                    <PromptForgeButton
                      variant="gradient"
                      size="sm"
                      fullWidth
                      icon={<Play className="w-4 h-4" />}
                      animation="scale"
                    >
                      Generate
                    </PromptForgeButton>
                  }
                />
              ))}
            </div>
          </div>
        </PromptForgeTab>

        <PromptForgeTab
          value="editor"
          label="Editor"
          icon={<Brain className="w-4 h-4" />}
          variant="glass"
          animation="slide"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground font-montserrat mb-2">
                AI-Powered Editor
              </h2>
              <p className="text-muted-foreground font-open-sans">
                Advanced prompt editing with real-time AI assistance and validation
              </p>
            </div>

            {/* Editor Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PromptForgeButton
                variant="default"
                icon={<Play className="w-4 h-4" />}
                fullWidth
                animation="glow"
              >
                Run
              </PromptForgeButton>
              <PromptForgeButton
                variant="secondary"
                icon={<Pause className="w-4 h-4" />}
                fullWidth
                animation="scale"
              >
                Pause
              </PromptForgeButton>
              <PromptForgeButton
                variant="outline"
                icon={<Stop className="w-4 h-4" />}
                fullWidth
                animation="scale"
              >
                Stop
              </PromptForgeButton>
              <PromptForgeButton
                variant="ghost"
                icon={<RotateCcw className="w-4 h-4" />}
                fullWidth
                animation="scale"
              >
                Reset
              </PromptForgeButton>
            </div>

            {/* 7D Parameter Engine */}
            <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/30">
              <SevenDEngine
                value={sevenDParams}
                onChange={setSevenDParams}
                variant="detailed"
                showLabels={false}
              />
            </div>
          </div>
        </PromptForgeTab>

        <PromptForgeTab
          value="test-engine"
          label="Test Engine"
          icon={<Zap className="w-4 h-4" />}
          variant="glass"
          animation="slide"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground font-montserrat mb-2">
                Quality Testing Engine
              </h2>
              <p className="text-muted-foreground font-open-sans">
                Comprehensive testing and validation with AI-powered scoring
              </p>
            </div>

            {/* Test Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PromptForgeCard
                title="Clarity Test"
                description="Tests prompt clarity and understandability"
                icon={<CheckCircle className="w-5 h-5" />}
                kpi={{ value: 95, label: 'Score', trend: 'up' }}
                variant="featured"
                badge={
                  <PromptForgeBadge variant="success" size="lg" animation="glow">
                    PASS
                  </PromptForgeBadge>
                }
              />
              <PromptForgeCard
                title="Execution Test"
                description="Tests prompt execution and output quality"
                icon={<Target className="w-5 h-5" />}
                kpi={{ value: 87, label: 'Score', trend: 'neutral' }}
                variant="default"
                badge={
                  <PromptForgeBadge variant="warning" size="lg" animation="glow">
                    GOOD
                  </PromptForgeBadge>
                }
              />
              <PromptForgeCard
                title="Business Fit"
                description="Tests alignment with business objectives"
                icon={<TrendingUp className="w-5 h-5" />}
                kpi={{ value: 92, label: 'Score', trend: 'up' }}
                variant="featured"
                badge={
                  <PromptForgeBadge variant="success" size="lg" animation="glow">
                    EXCELLENT
                  </PromptForgeBadge>
                }
              />
            </div>
          </div>
        </PromptForgeTab>

        <PromptForgeTab
          value="history"
          label="History"
          icon={<History className="w-4 h-4" />}
          variant="glass"
          animation="slide"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground font-montserrat mb-2">
                Run History & Analytics
              </h2>
              <p className="text-muted-foreground font-open-sans">
                Track performance, analyze patterns, and optimize your prompts
              </p>
            </div>

            {/* History Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PromptForgeCard
                title="Total Runs"
                description="All time prompt generations"
                icon={<Play className="w-5 h-5" />}
                kpi={{ value: '1,247', label: 'Runs' }}
                variant="default"
                className="text-center"
              />
              <PromptForgeCard
                title="Success Rate"
                description="Percentage of successful runs"
                icon={<CheckCircle className="w-5 h-5" />}
                kpi={{ value: '94.2%', label: 'Success', trend: 'up' }}
                variant="success"
                className="text-center"
              />
              <PromptForgeCard
                title="Avg Score"
                description="Average quality score"
                icon={<Star className="w-5 h-5" />}
                kpi={{ value: '87.6', label: 'Score', trend: 'up' }}
                variant="info"
                className="text-center"
              />
              <PromptForgeCard
                title="Active Users"
                description="Current active users"
                icon={<Users className="w-5 h-5" />}
                kpi={{ value: '23', label: 'Users' }}
                variant="default"
                className="text-center"
              />
            </div>
          </div>
        </PromptForgeTab>

        <PromptForgeTab
          value="export"
          label="Export"
          icon={<Download className="w-4 h-4" />}
          variant="glass"
          animation="slide"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground font-montserrat mb-2">
                Export & Distribution
              </h2>
              <p className="text-muted-foreground font-open-sans">
                Export your prompts in multiple formats with quality validation
              </p>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PromptForgeCard
                title="Markdown Export"
                description="Structured markdown with metadata"
                icon={<FileText className="w-5 h-5" />}
                kpi={{ value: 'Free', label: 'Plan' }}
                variant="default"
                footer={
                  <PromptForgeButton
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Download className="w-4 h-4" />}
                    animation="scale"
                  >
                    Export MD
                  </PromptForgeButton>
                }
              />
              <PromptForgeCard
                title="PDF Export"
                description="Professional PDF with branding"
                icon={<FileText className="w-5 h-5" />}
                kpi={{ value: 'Pro+', label: 'Plan' }}
                variant="featured"
                footer={
                  <PromptForgeButton
                    variant="gradient"
                    size="sm"
                    fullWidth
                    icon={<Download className="w-4 h-4" />}
                    animation="scale"
                  >
                    Export PDF
                  </PromptForgeButton>
                }
              />
              <PromptForgeCard
                title="Bundle Export"
                description="Complete package with all assets"
                icon={<Download className="w-5 h-5" />}
                kpi={{ value: 'Enterprise', label: 'Plan' }}
                variant="featured"
                footer={
                  <PromptForgeButton
                    variant="gradient"
                    size="sm"
                    fullWidth
                    icon={<Download className="w-4 h-4" />}
                    animation="scale"
                  >
                    Export Bundle
                  </PromptForgeButton>
                }
              />
            </div>
          </div>
        </PromptForgeTab>
      </PromptForgeTabs>

      {/* Component Showcase */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground font-montserrat mb-4">
            Component Library
          </h2>
          <p className="text-muted-foreground font-open-sans">
            Explore all available components with various variants and animations
          </p>
        </div>

        {/* Button Showcase */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground font-montserrat">Buttons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PromptForgeButton variant="default" icon={<Star className="w-4 h-4" />}>
              Primary
            </PromptForgeButton>
            <PromptForgeButton variant="secondary" icon={<Settings className="w-4 h-4" />}>
              Secondary
            </PromptForgeButton>
            <PromptForgeButton variant="outline" icon={<Globe className="w-4 h-4" />}>
              Outline
            </PromptForgeButton>
            <PromptForgeButton variant="ghost" icon={<Shield className="w-4 h-4" />}>
              Ghost
            </PromptForgeButton>
            <PromptForgeButton variant="glass" icon={<Sparkles className="w-4 h-4" />}>
              Glass
            </PromptForgeButton>
            <PromptForgeButton variant="gradient" icon={<Zap className="w-4 h-4" />}>
              Gradient
            </PromptForgeButton>
            <PromptForgeButton variant="success" icon={<CheckCircle className="w-4 h-4" />}>
              Success
            </PromptForgeButton>
            <PromptForgeButton variant="warning" icon={<AlertCircle className="w-4 h-4" />}>
              Warning
            </PromptForgeButton>
          </div>
        </div>

        {/* Badge Showcase */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground font-montserrat">Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PromptForgeBadge variant="default">Default</PromptForgeBadge>
            <PromptForgeBadge variant="success">Success</PromptForgeBadge>
            <PromptForgeBadge variant="warning">Warning</PromptForgeBadge>
            <PromptForgeBadge variant="error">Error</PromptForgeBadge>
            <PromptForgeBadge variant="vector" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              Creative
            </PromptForgeBadge>
            <PromptForgeBadge variant="score" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Excellent
            </PromptForgeBadge>
            <PromptForgeBadge variant="plan" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              Pro
            </PromptForgeBadge>
            <PromptForgeBadge variant="glass">Glass</PromptForgeBadge>
          </div>
        </div>

        {/* 7D Engine Compact */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground font-montserrat">7D Parameter Engine</h3>
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-6 border border-border/30">
            <SevenDEngine
              value={sevenDParams}
              onChange={setSevenDParams}
              variant="compact"
              showLabels={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
