"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { historyManager } from "@/lib/history-manager"
import { Download, Printer, Share2, Copy, Check } from "lucide-react"
import { useEntitlements } from "@/hooks/use-entitlements"
import { PDFExportButton, JSONExportButton, BundleExportButton } from "@/components/ProtectedButton"
import type { GeneratedPrompt } from "@/types/promptforge"
import type { GPTEditResult } from "@/lib/gpt-editor"
import type { TestResult } from "@/lib/test-engine"

interface ExportManagerProps {
  currentPrompt?: GeneratedPrompt | null
  editResults?: GPTEditResult[]
  testResults?: TestResult[]
}

export function ExportManager({ currentPrompt, editResults = [], testResults = [] }: ExportManagerProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf" | "txt">("txt")
  const [exportScope, setExportScope] = useState<"current" | "session" | "all">("current")
  const [copied, setCopied] = useState(false)
  const { canExportFormat, canExportJSON, canExportPDF, canExportBundleZip } = useEntitlements()

  const generateSessionReport = () => {
    const stats = historyManager.getStats()
    const recentHistory = historyManager.getHistory().slice(0, 50)

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "PROMPTFORGE v3.0",
        sessionId: `session_${Date.now()}`,
        totalEntries: stats.totalEntries,
      },
      statistics: stats,
      currentSession: {
        currentPrompt,
        editResults: editResults.slice(0, 5),
        testResults: testResults.slice(0, 5),
      },
      recentHistory: recentHistory.slice(0, 20),
    }
  }

  const exportAsJSON = () => {
    let data: any

    switch (exportScope) {
      case "current":
        data = { currentPrompt, editResults, testResults }
        break
      case "session":
        data = generateSessionReport()
        break
      case "all":
        data = {
          ...generateSessionReport(),
          fullHistory: historyManager.getHistory(),
        }
        break
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptforge-export-${exportScope}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    const history = historyManager.getHistory()
    const headers = [
      "Timestamp",
      "Type",
      "Module",
      "Vector",
      "Domain",
      "Scale",
      "Urgency",
      "Validation Score",
      "KPI Compliance",
      "Structure Score",
      "Clarity Score",
      "Content Preview",
    ]

    const csvRows = [headers.join(",")]

    history.forEach((entry) => {
      const row = [
        entry.timestamp.toISOString(),
        entry.type,
        entry.moduleName,
        `V${entry.vector}`,
        entry.config?.domain || "N/A",
        entry.config?.scale || "N/A",
        entry.config?.urgency || "N/A",
        entry.metadata.validationScore?.toFixed(2) || "N/A",
        entry.metadata.kpiCompliance?.toFixed(2) || "N/A",
        entry.metadata.structureScore?.toFixed(2) || "N/A",
        entry.metadata.clarityScore?.toFixed(2) || "N/A",
        `"${entry.content.substring(0, 100).replace(/"/g, '""')}..."`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptforge-data-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsTXT = () => {
    const stats = historyManager.getStats()
    const history = historyManager.getHistory().slice(0, 20)

    let content = `PROMPTFORGE™ v3.0 - SESSION REPORT\n`
    content += `=====================================\n\n`
    content += `Generation date: ${new Date().toLocaleString("en-US")}\n`
    content += `Export scope: ${exportScope}\n\n`
    content += `GENERAL STATISTICS:\n`
    content += `- Total entries: ${stats.totalEntries}\n`
    content += `- Generated prompts: ${stats.promptsGenerated}\n`
    content += `- GPT edits: ${stats.editsPerformed}\n`
    content += `- Executed tests: ${stats.testsExecuted}\n`
    content += `- Average score: ${stats.averageScore.toFixed(2)}\n`
    content += `- Popular module: ${stats.mostUsedModule}\n`
    content += `- Popular vector: V${stats.mostUsedVector}\n\n`

    if (currentPrompt) {
      content += `CURRENT PROMPT:\n`
      content += `==============\n`
      content += `Module: ${currentPrompt.moduleName}\n`
      content += `Vector: V${currentPrompt.vector}\n`
      content += `Validation score: ${currentPrompt.validationScore.toFixed(2)}\n`
      content += `Session hash: ${currentPrompt.sessionHash}\n\n`
      content += `Content:\n${currentPrompt.content}\n\n`
    }

    if (history.length > 0) {
      content += `RECENT HISTORY (${history.length} entries):\n`
      content += `========================\n\n`
      history.forEach((entry, index) => {
        content += `${index + 1}. [${entry.type.toUpperCase()}] ${entry.moduleName} (V${entry.vector})\n`
        content += `   Date: ${entry.timestamp.toLocaleString("en-US")}\n`
        content += `   Score: ${entry.metadata.validationScore?.toFixed(2) || "N/A"}\n`
        content += `   Preview: ${entry.content.substring(0, 150)}...\n\n`
      })
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptforge-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    if (!currentPrompt) return

    const content = `PROMPTFORGE™ v3.0 - ${currentPrompt.moduleName}\nVector: V${currentPrompt.vector}\nScore: ${currentPrompt.validationScore.toFixed(2)}\nHash: ${currentPrompt.sessionHash}\n\n${currentPrompt.content}`

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const handleExport = () => {
    // Verifică entitlements înainte de export
    if (exportFormat === "json" && !canExportJSON) {
      alert("JSON export requires Pro plan or higher.")
      return
    }
    if (exportFormat === "pdf" && !canExportPDF) {
      alert("PDF export requires Pro plan or higher.")
      return
    }
    
    switch (exportFormat) {
      case "json":
        exportAsJSON()
        break
      case "csv":
        exportAsCSV()
        break
      case "txt":
        exportAsTXT()
        break
      case "pdf":
        alert("Export PDF will be available in the next version.")
        break
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect p-6 glow-primary">
        <h3 className="text-lg font-bold font-[var(--font-heading)] mb-4 text-foreground">Export Manager</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="txt">TXT (Report) - Free</option>
              <option value="csv">CSV (Table) - Free</option>
              <option value="json" disabled={!canExportJSON}>
                JSON (Structured) {!canExportJSON && "- Pro Required"}
              </option>
              <option value="pdf" disabled={!canExportPDF}>
                PDF (Premium) {!canExportPDF && "- Pro Required"}
              </option>
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
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!currentPrompt}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Prompt"}
          </Button>

          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.share && currentPrompt) {
                navigator.share({
                  title: `PROMPTFORGE™ - ${currentPrompt.moduleName}`,
                  text: currentPrompt.content.substring(0, 200) + "...",
                  url: window.location.href,
                })
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="glass-effect">
          <TabsTrigger value="preview">Preview Export</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card className="glass-effect p-4">
            <div className="text-sm text-muted-foreground mb-2">
              Preview for {exportFormat.toUpperCase()} - {exportScope}
            </div>
            <div className="bg-input rounded-lg p-4 font-mono text-xs text-foreground max-h-64 overflow-y-auto">
              {exportFormat === "json" && (
                <pre>{JSON.stringify(generateSessionReport(), null, 2).substring(0, 1000)}...</pre>
              )}
              {exportFormat === "txt" && (
                <div className="whitespace-pre-wrap">
                  {currentPrompt
                    ? `PROMPTFORGE™ v3.0 - SESSION REPORT\n\nPrompt: ${currentPrompt.moduleName}\nVector: V${currentPrompt.vector}\nScore: ${currentPrompt.validationScore.toFixed(2)}\n\n${currentPrompt.content.substring(0, 300)}...`
                    : "No current prompt selected."}
                </div>
              )}
              {exportFormat === "csv" && (
                <div>
                  <div>Timestamp,Type,Module,Vector,Domain,ValidationScore...</div>
                  <br />
                  {historyManager
                    .getHistory()
                    .slice(0, 3)
                    .map((entry, index) => (
                      <div key={index}>
                        {entry.timestamp.toISOString()},{entry.type},{entry.moduleName},V{entry.vector},...
                      </div>
                    ))}
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
      </Tabs>
    </div>
  )
}
