"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModuleGrid } from "@/components/module-grid"
import { PromptGenerator } from "@/components/prompt-generator"
import { GPTEditor } from "@/components/gpt-editor"
import { TestEngine } from "@/components/test-engine"
import { HistoryPanel } from "@/components/history-panel"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { ExportManager } from "@/components/export-manager"
import { getModuleStats } from "@/lib/modules"
import { historyManager, type HistoryEntry } from "@/lib/history-manager"
import type { SessionConfig, GeneratedPrompt } from "@/types/promptforge"
import type { GPTEditResult } from "@/lib/gpt-editor"
import type { TestResult } from "@/lib/test-engine"

export default function PromptForgePage() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [vectorFilter, setVectorFilter] = useState<string>("all")
  const [config, setConfig] = useState<SessionConfig>({
    vector: "all",
    domain: "SaaS",
    scale: "startup",
    urgency: "pilot",
    resources: "solo",
    complexity: "standard",
    application: "training",
    outputFormat: "spec",
  })
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null)
  const [editResults, setEditResults] = useState<GPTEditResult[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const moduleStats = getModuleStats()

  const handlePromptGenerated = (prompt: GeneratedPrompt) => {
    setGeneratedPrompts((prev) => [prompt, ...prev.slice(0, 9)]) // Keep last 10
    setCurrentPrompt(prompt)

    historyManager.addEntry({
      type: "prompt",
      moduleId: selectedModule || 0,
      moduleName: prompt.moduleName,
      vector: prompt.vector,
      config,
      content: prompt.content,
      metadata: {
        sessionHash: prompt.sessionHash,
        validationScore: prompt.validationScore,
        kpiCompliance: prompt.kpiCompliance,
        structureScore: prompt.structureScore,
        clarityScore: prompt.clarityScore,
      },
      tags: [config.domain, config.scale, config.urgency],
    })
  }

  const handleEditComplete = (result: GPTEditResult) => {
    setEditResults((prev) => [result, ...prev.slice(0, 4)]) // Keep last 5

    historyManager.addEntry({
      type: "edit",
      moduleId: selectedModule || 0,
      moduleName: result.originalPrompt?.moduleName || "Unknown",
      vector: result.originalPrompt?.vector || "1",
      config,
      content: result.optimizedPrompt,
      metadata: {
        editType: result.optimizationType,
        improvements: result.improvements,
        validationScore: result.metrics.overallScore,
      },
      tags: ["gpt-edit", result.optimizationType],
    })
  }

  const handleTestComplete = (result: TestResult) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10

    historyManager.addEntry({
      type: "test",
      moduleId: selectedModule || 0,
      moduleName: result.prompt?.moduleName || "Unknown",
      vector: result.prompt?.vector || "1",
      config,
      content: result.testOutput,
      metadata: {
        testMode: result.testMode,
        validationScore: result.validationScore,
        structureScore: result.structureScore,
        clarityScore: result.clarityScore,
        improvements: result.recommendations,
      },
      tags: ["test", result.testMode],
    })
  }

  const handleRestoreEntry = (entry: HistoryEntry) => {
    if (entry.type === "prompt") {
      // Restore as current prompt
      const restoredPrompt: GeneratedPrompt = {
        id: `restored_${Date.now()}`,
        content: entry.content,
        moduleName: entry.moduleName,
        vector: entry.vector,
        sessionHash: entry.metadata.sessionHash || "",
        timestamp: new Date(),
        validationScore: entry.metadata.validationScore || 0,
        kpiCompliance: entry.metadata.kpiCompliance || 0,
        structureScore: entry.metadata.structureScore || 0,
        clarityScore: entry.metadata.clarityScore || 0,
        config: entry.config,
      }
      setCurrentPrompt(restoredPrompt)
      setSelectedModule(entry.moduleId)
    }
  }

  const handleGenerateShortcut = () => {
    if (selectedModule) {
      // Trigger generation if module is selected
      const generateButton = document.querySelector("[data-generate-button]") as HTMLButtonElement
      generateButton?.click()
    }
  }

  const handleHistoryShortcut = () => {
    // Switch to history tab
    const historyTab = document.querySelector('[data-tab="history"]') as HTMLButtonElement
    historyTab?.click()
  }

  const handleExportShortcut = () => {
    // Trigger quick export
    const exportButton = document.querySelector("[data-export-button]") as HTMLButtonElement
    exportButton?.click()
  }

  const handleClearAllShortcut = () => {
    if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      historyManager.clearHistory()
      setGeneratedPrompts([])
      setCurrentPrompt(null)
      setEditResults([])
      setTestResults([])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black font-[var(--font-heading)] text-foreground text-gradient">
                PROMPTFORGE™ <span className="text-primary">v3.0</span>
              </h1>
              <p className="text-sm text-muted-foreground">Complete AI Prompt Generation System</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="glass-effect animate-fade-in">
                {moduleStats.totalModules} Active Modules
              </Badge>
              <Badge variant="outline" className="glass-effect animate-fade-in">
                7 Semantic Vectors
              </Badge>
              <Badge variant="outline" className="glass-effect animate-fade-in">
                Popular Vector: V{moduleStats.mostPopularVector}
              </Badge>
              {generatedPrompts.length > 0 && (
                <Badge variant="outline" className="glass-effect animate-bounce-subtle">
                  {generatedPrompts.length} Generated Prompts
                </Badge>
              )}
              {editResults.length > 0 && (
                <Badge variant="outline" className="glass-effect animate-bounce-subtle">
                  {editResults.length} GPT Optimizations
                </Badge>
              )}
              {testResults.length > 0 && (
                <Badge variant="outline" className="glass-effect animate-bounce-subtle">
                  {testResults.length} Executed Tests
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Configuration Panel */}
        <Card className="glass-effect p-6 mb-8 glow-primary animate-fade-in">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-4 text-foreground">Session Configuration</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Domain</label>
              <select
                value={config.domain}
                onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="SaaS">SaaS</option>
                <option value="fintech">FinTech</option>
                <option value="ecommerce">E-commerce</option>
                <option value="consulting">Consulting</option>
                <option value="personal_brand">Personal Brand</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Scale</label>
              <select
                value={config.scale}
                onChange={(e) => setConfig({ ...config, scale: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="startup">Startup</option>
                <option value="corporate">Corporate</option>
                <option value="personal_brand">Personal Brand</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Urgency</label>
              <select
                value={config.urgency}
                onChange={(e) => setConfig({ ...config, urgency: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="pilot">Pilot</option>
                <option value="sprint">Sprint</option>
                <option value="enterprise">Enterprise</option>
                <option value="crisis">Crisis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Complexity</label>
              <select
                value={config.complexity}
                onChange={(e) => setConfig({ ...config, complexity: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Resources</label>
              <select
                value={config.resources}
                onChange={(e) => setConfig({ ...config, resources: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="solo">Solo</option>
                <option value="team">Team</option>
                <option value="large_budget">Large Budget</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Application</label>
              <select
                value={config.application}
                onChange={(e) => setConfig({ ...config, application: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="training">Training</option>
                <option value="audit">Audit</option>
                <option value="implementation">Implementation</option>
                <option value="crisis_response">Crisis Response</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Output Format</label>
              <select
                value={config.outputFormat}
                onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="spec">Technical Spec</option>
                <option value="playbook">Playbook</option>
                <option value="checklist">Checklist</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Module Selection */}
        <Card className="glass-effect p-6 mb-8 glow-success animate-fade-in">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-4 text-foreground">Module Selection</h2>

          <ModuleGrid
            selectedModule={selectedModule}
            onSelectModule={setSelectedModule}
            vectorFilter={vectorFilter}
            onVectorFilterChange={setVectorFilter}
          />
        </Card>

        {/* Main Workflow Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="glass-effect">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="editor">GPT Editor</TabsTrigger>
            <TabsTrigger value="test">Test Engine</TabsTrigger>
            <TabsTrigger value="history" data-tab="history">
              History
            </TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="animate-slide-up">
            <PromptGenerator
              selectedModule={selectedModule}
              config={config}
              onPromptGenerated={handlePromptGenerated}
            />
          </TabsContent>

          <TabsContent value="editor" className="animate-slide-up">
            <GPTEditor generatedPrompt={currentPrompt} onEditComplete={handleEditComplete} />
          </TabsContent>

          <TabsContent value="test" className="animate-slide-up">
            <TestEngine generatedPrompt={currentPrompt} onTestComplete={handleTestComplete} />
          </TabsContent>

          <TabsContent value="history" className="animate-slide-up">
            <Card className="glass-effect p-6 glow-accent">
              <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6 text-foreground">Session History</h2>
              <HistoryPanel onRestoreEntry={handleRestoreEntry} />
            </Card>
          </TabsContent>

          <TabsContent value="export" className="animate-slide-up">
            <Card className="glass-effect p-6 glow-primary">
              <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6 text-foreground">Export & Reports</h2>
              <ExportManager currentPrompt={currentPrompt} editResults={editResults} testResults={testResults} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <KeyboardShortcuts
        onGeneratePrompt={handleGenerateShortcut}
        onOpenHistory={handleHistoryShortcut}
        onExport={handleExportShortcut}
        onClearAll={handleClearAllShortcut}
      />
    </div>
  )
}
