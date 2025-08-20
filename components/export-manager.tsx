"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { historyManager } from "@/lib/history-manager"
import { ExportBundleManager, type ExportBundle } from "@/lib/export-bundle"
import { getAvailableExportFormats, PLANS, type Plan } from "@/lib/entitlements/types"
import { 
  Download, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lock, 
  Zap,
  FileText,
  FileCode,
  FileImage,
  Archive,
  Crown
} from "lucide-react"
import type { GeneratedPrompt } from "@/types/promptforge"
import type { GPTEditResult } from "@/lib/gpt-editor"
import type { TestResult } from "@/lib/test-engine"
import { QualityGates } from "./quality-gates"
import { qualityGateValidator, type BundleValidation } from "@/lib/dor-dod-validator"

interface ExportManagerProps {
  currentPrompt?: GeneratedPrompt | null
  editResults?: GPTEditResult[]
  testResults?: TestResult[]
}

export function ExportManager({ currentPrompt, editResults = [], testResults = [] }: ExportManagerProps) {
  const [userPlan, setUserPlan] = useState<string>("pilot")
  const [exportFormat, setExportFormat] = useState<string>("txt")
  const [exportScope, setExportScope] = useState<"current" | "session" | "all">("current")
  const [copied, setCopied] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [canDeliver, setCanDeliver] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportBundle, setExportBundle] = useState<ExportBundle | null>(null)

  // Get available formats for current plan
  const availableFormats = getAvailableExportFormats(userPlan)
  const currentPlan = PLANS[userPlan]

  // Update export format when plan changes
  useEffect(() => {
    if (!availableFormats.includes(exportFormat)) {
      setExportFormat(availableFormats[0] || 'txt')
    }
  }, [userPlan, availableFormats, exportFormat])

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'txt': return <FileText className="w-4 h-4" />
      case 'md': return <FileCode className="w-4 h-4" />
      case 'json': return <FileCode className="w-4 h-4" />
      case 'pdf': return <FileImage className="w-4 h-4" />
      case 'bundle': return <Archive className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'txt': return 'Text (.txt)'
      case 'md': return 'Markdown (.md)'
      case 'json': return 'JSON (.json)'
      case 'pdf': return 'PDF (.pdf)'
      case 'bundle': return 'ZIP Bundle'
      default: return format
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pilot': return <FileText className="w-4 h-4" />
      case 'pro': return <Crown className="w-4 h-4" />
      case 'enterprise': return <Crown className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'pilot': return 'bg-gray-500'
      case 'pro': return 'bg-[#d1a954]'
      case 'enterprise': return 'bg-gradient-to-r from-purple-600 to-pink-600'
      default: return 'bg-gray-500'
    }
  }

  const generateExportBundle = async () => {
    if (!currentPrompt) return

    setIsExporting(true)
    try {
      const bundle = await ExportBundleManager.generateBundle({
        prompt: currentPrompt,
        testResults,
        editResults,
        userPlan,
        includeTelemetry: true,
        includeChecksum: true,
        includeManifest: true
      })

      setExportBundle(bundle)
      
      // Trigger download based on format
      if (exportFormat === 'bundle' && bundle.zipBuffer) {
        downloadZipBundle(bundle)
      } else {
        downloadSingleArtifact(bundle, exportFormat)
      }

    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadSingleArtifact = (bundle: ExportBundle, format: string) => {
    const artifact = bundle.artifacts.find(a => a.filename.includes(format))
    if (!artifact) return

    const blob = new Blob([artifact.content], { type: artifact.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = artifact.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadZipBundle = (bundle: ExportBundle) => {
    if (!bundle.zipBuffer) return

    const blob = new Blob([bundle.zipBuffer], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptforge-bundle-${currentPrompt?.moduleId}-${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    if (!currentPrompt) return

    const content = `Module ${currentPrompt.moduleId} - ${currentPrompt.config.vector}\nScore: ${currentPrompt.testResults?.structureScore || 0}/100\n\n${currentPrompt.prompt}`

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const handleExport = () => {
    if (!canDeliver) {
      alert("Quality gates failed. Cannot export without passing DoR/DoD validation.")
      return
    }

    generateExportBundle()
  }

  const getUpgradeMessage = (requiredPlan: string) => {
    const plan = PLANS[requiredPlan]
    if (!plan) return "Upgrade required"
    
    return `Upgrade to ${plan.label} plan to unlock ${getFormatLabel(exportFormat)} export`
  }

  return (
    <div className="space-y-6">
      {/* Quality Gates - Must pass before export */}
      {currentPrompt && (
        <QualityGates
          prompt={currentPrompt}
          testResults={testResults}
          userPlanId={userPlan}
          onValidationChange={(canProceed, canDeliver) => {
            setCanProceed(canProceed)
            setCanDeliver(canDeliver)
          }}
        />
      )}

      <Card className="glass-effect p-6 glow-primary">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-[var(--font-heading)] text-foreground">Export Manager</h3>
          <Badge className={`${getPlanColor(userPlan)} text-white`}>
            {getPlanIcon(userPlan)}
            <span className="ml-2">{currentPlan?.label}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {availableFormats.map(format => (
                <option key={format} value={format}>
                  {getFormatLabel(format)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">User Plan</label>
            <select
              value={userPlan}
              onChange={(e) => setUserPlan(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {Object.values(PLANS).map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Export Scope</label>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value as any)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="current">Current Session</option>
              <option value="session">Session Report</option>
              <option value="all">Complete History</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Generating...' : `Export ${getFormatLabel(exportFormat)}`}
            </button>
          </div>
        </div>

        {/* Plan Restrictions Warning */}
        {!availableFormats.includes(exportFormat) && (
          <Alert className="mb-4 border-orange-200 bg-[#1a1a1a]">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Plan Restriction:</strong> {getUpgradeMessage(getMinPlanForFeature(exportFormat as any))}
            </AlertDescription>
          </Alert>
        )}

        {/* Quality Gate Warning */}
        {!canDeliver && currentPrompt && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Export Blocked:</strong> Quality gates must pass before export. 
              Review the validation results above and fix any issues.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={copyToClipboard} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Prompt"}
          </button>

          <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>

          <button onClick={() => {
              if (navigator.share && currentPrompt) {
                navigator.share({
                  title: `PROMPTFORGE™ - Module ${currentPrompt.moduleId}`,
                  text: currentPrompt.prompt.substring(0, 100) + "...",
                  url: window.location.href
                })
              }
            }} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        </div>
      </Card>

      {/* Plan Features Overview */}
      <Card className="glass-effect p-4">
        <h4 className="font-semibold mb-3 text-foreground">Plan Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(PLANS).map(plan => (
            <div key={plan.id} className="text-center p-3 rounded-lg border">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPlanColor(plan.id)} text-white text-sm font-bold mb-2`}>
                {getPlanIcon(plan.id)}
              </div>
              <div className="text-sm font-medium text-foreground">{plan.label}</div>
              <div className="text-xs text-muted-foreground">
                {plan.exports_allowed.join(', ')}
              </div>
              {plan.features.canExportBundleZip && (
                <Badge variant="secondary" className="mt-1 text-xs">ZIP Bundle</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="preview">Preview Export</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Info</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card className="glass-effect p-4">
            <div className="text-sm text-muted-foreground mb-2">
              Preview for {getFormatLabel(exportFormat)} - {exportScope}
            </div>
            <div className="bg-input rounded-lg p-4 font-mono text-xs text-foreground max-h-64 overflow-y-auto">
              {exportFormat === "json" && (
                <pre>{JSON.stringify({
                  module: currentPrompt?.moduleId,
                  vector: currentPrompt?.config?.vector,
                  score: currentPrompt?.testResults?.structureScore || 0,
                  content: currentPrompt?.prompt?.substring(0, 200) + "..."
                }, null, 2)}</pre>
              )}
              {exportFormat === "txt" && (
                <div className="whitespace-pre-wrap">
                  {currentPrompt
                    ? `PROMPTFORGE™ v3.0 - SESSION REPORT\n\nPrompt: Module ${currentPrompt.moduleId}\nVector: ${currentPrompt.config?.vector}\nScore: ${(currentPrompt.testResults?.structureScore || 0).toFixed(2)}\n\n${currentPrompt.prompt.substring(0, 300)}...`
                    : "No current prompt selected."}
                </div>
              )}
              {exportFormat === "md" && (
                <div className="whitespace-pre-wrap">
                  {currentPrompt
                    ? `# PROMPTFORGE™ v3.0\n\n## Module ${currentPrompt.moduleId}\n\n**Vector:** ${currentPrompt.config?.vector}  \n**Score:** ${(currentPrompt.testResults?.structureScore || 0).toFixed(2)}/100\n\n${currentPrompt.prompt.substring(0, 300)}...`
                    : "No current prompt selected."}
                </div>
              )}
              {exportFormat === "pdf" && (
                <div className="text-center text-muted-foreground">
                  PDF preview not available. Download to view.
                </div>
              )}
              {exportFormat === "bundle" && (
                <div className="text-center text-muted-foreground">
                  ZIP bundle containing all artifacts will be generated.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="glass-effect p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = historyManager.getStats()
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalEntries}</div>
                      <div className="text-sm text-muted-foreground">Total Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{stats.promptsGenerated}</div>
                      <div className="text-sm text-muted-foreground">Prompts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{stats.editsPerformed}</div>
                      <div className="text-sm text-muted-foreground">Edits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{stats.testsExecuted}</div>
                      <div className="text-sm text-muted-foreground">Tests</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bundle">
          <Card className="glass-effect p-4">
            {exportBundle ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Bundle Generated</h5>
                  <Badge variant="outline">Checksum: {exportBundle.checksum.substring(0, 8)}...</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Files: {exportBundle.artifacts.length}</div>
                  <div>Total Size: {exportBundle.artifacts.reduce((sum, a) => sum + a.size, 0)} bytes</div>
                  <div>Generated: {new Date(exportBundle.manifest.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs font-mono bg-input p-2 rounded">
                  {exportBundle.artifacts.map(a => a.filename).join('\n')}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Generate an export bundle to see details here.
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get minimum plan for a feature
function getMinPlanForFeature(feature: string): string {
  const featureGates = {
    'txt': 'free',
    'md': 'creator',
    'json': 'pro',
    'pdf': 'pro',
    'bundle': 'enterprise'
  }
  return featureGates[feature as keyof typeof featureGates] || 'free'
}
