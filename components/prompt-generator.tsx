'use client';

import { HomeInteractive } from "@/components/home-interactive";

import { useState } from "react"
import { Card } from "@/components/ui/card"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { generatePrompt, rerollPrompt, validatePromptStructure } from "@/lib/prompt-generator"
import { MODULES } from "@/lib/modules"
import type { SessionConfig, GeneratedPrompt } from "@/types/promptforge"
import { Copy, Download, RefreshCw, Wand2, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PromptGeneratorProps {
  selectedModule: number | null
  config: SessionConfig
  onPromptGenerated?: (prompt: GeneratedPrompt) => void
}

export function HomeInteractive() ({ selectedModule, config, onPromptGenerated }: PromptGeneratorProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validatePromptStructure> | null>(null)
  const { toast } = useToast()

  const handleGeneratePrompt = async () => {
    if (!selectedModule) {
      toast({
        title: "Error",
        description: "Select a module before generating the prompt!",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate generation delay for better UX
    setTimeout(() => {
      try {
        const prompt = generatePrompt(selectedModule, config)
        setGeneratedPrompt(prompt)
        setValidationResult(validatePromptStructure(prompt.prompt))
        onPromptGenerated?.(prompt)

        toast({
          title: "Prompt generated successfully!",
          description: `Hash: ${prompt.hash}`,
        })
      } catch (error) {
        toast({
          title: "Error generating prompt",
          description: "Could not generate the prompt. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 1000)
  }

  const handleRerollPrompt = () => {
    if (!generatedPrompt) return

    setIsGenerating(true)
    setTimeout(() => {
      const newPrompt = rerollPrompt(generatedPrompt)
      setGeneratedPrompt(newPrompt)
      setValidationResult(validatePromptStructure(newPrompt.prompt))
      onPromptGenerated?.(newPrompt)
      setIsGenerating(false)

      toast({
        title: "Prompt regenerated!",
        description: `New hash: ${newPrompt.hash}`,
      })
    }, 800)
  }

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return

    try {
      await navigator.clipboard.writeText(generatedPrompt.prompt)
      toast({
        title: "Copied to clipboard!",
        description: "The prompt was copied successfully.",
      })
    } catch (error) {
      toast({
        title: "Error copying prompt",
        description: "Could not copy the prompt.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPrompt = () => {
    if (!generatedPrompt) return

    const blob = new Blob([generatedPrompt.prompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt_${generatedPrompt.hash}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Prompt downloaded!",
      description: `File: prompt_${generatedPrompt.hash}.txt`,
    })
  }

  const selectedModuleData = selectedModule ? MODULES[selectedModule] : null

  return (
    <Card className="glass-effect p-6 glow-accent border-[#5a5a5a]/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-[var(--font-heading)] text-white">Prompt Generator</h2>
        {validationResult && (
          <Badge variant={validationResult.score >= 80 ? "default" : "secondary"} className="glass-effect border-[#5a5a5a]/30">
            Validation: {validationResult.score}%
          </Badge>
        )}
      </div>

      {/* Module Info */}
      {selectedModuleData && (
        <div className="mb-6 p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-[#d1a954] text-[#d1a954]">M{selectedModuleData.id.toString().padStart(2, "0")}</Badge>
            <h3 className="font-semibold text-white">{selectedModuleData.name}</h3>
          </div>
          <p className="text-sm text-[#5a5a5a] mb-2">{selectedModuleData.description}</p>
          <div className="text-xs text-[#5a5a5a]">
            <strong>KPI:</strong> {selectedModuleData.kpi}
          </div>
        </div>
      )}

      {/* Session Config Display */}
      <div className="mb-6 p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
        <h4 className="font-semibold text-white mb-2">Session Configuration</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <strong>Domain:</strong> {config.domain}
          </div>
          <div>
            <strong>Scale:</strong> {config.scale}
          </div>
          <div>
            <strong>Urgency:</strong> {config.urgency}
          </div>
          <div>
            <strong>Complexity:</strong> {config.complexity}
          </div>
        </div>
        {generatedPrompt && (
          <div className="mt-2 text-xs text-pf-text-muted">
            <strong>Hash:</strong> {generatedPrompt.hash} |<strong> Generated:</strong>{" "}
            {generatedPrompt.timestamp.toLocaleString("en-US")}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={handleGeneratePrompt} 
          disabled={!selectedModule || isGenerating} 
          className="glow-primary inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-gold-industrial text-pf-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {generatedPrompt ? "Regenerate" : "Generate"} Prompt
        </button>

        {generatedPrompt && (
          <>
            <button
              onClick={handleRerollPrompt}
              disabled={isGenerating}
              className="glass-effect bg-transparent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border-pf-text-muted/30 hover:border-gold-industrial hover:text-gold-industrial"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reroll
            </button>

            <button onClick={handleCopyPrompt} className="glass-effect bg-transparent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border-pf-text-muted/30 hover:border-gold-industrial hover:text-gold-industrial">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </button>

            <button onClick={handleDownloadPrompt} className="glass-effect bg-transparent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border-pf-text-muted/30 hover:border-gold-industrial hover:text-gold-industrial">
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </>
        )}
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="mb-6 p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            {validationResult.score >= 80 ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
            Structure Validation ({validationResult.score}%)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className={validationResult.hasTitle ? "text-green-400" : "text-red-400"}>
              ✓ Title: {validationResult.hasTitle ? "Yes" : "No"}
            </div>
            <div className={validationResult.hasContext ? "text-green-400" : "text-red-400"}>
              ✓ Context: {validationResult.hasContext ? "Yes" : "No"}
            </div>
            <div className={validationResult.hasKPI ? "text-green-400" : "text-red-400"}>
              ✓ KPI: {validationResult.hasKPI ? "Yes" : "No"}
            </div>
            <div className={validationResult.hasOutput ? "text-green-400" : "text-red-400"}>
              ✓ Output: {validationResult.hasOutput ? "Yes" : "No"}
            </div>
            <div className={validationResult.hasGuardrails ? "text-green-400" : "text-red-400"}>
              ✓ Guardrails: {validationResult.hasGuardrails ? "Yes" : "No"}
            </div>
          </div>
        </div>
      )}

      <Separator className="mb-6 border-[#5a5a5a]/30" />

      {/* Generated Prompt Display */}
      <div>
        <h4 className="font-semibold text-white mb-2">Generated Prompt</h4>
        <Textarea
          value={generatedPrompt?.prompt || ""}
          placeholder={
            /* Translated placeholder text */
            selectedModule ? "The generated prompt will appear here..." : "Select a module to generate a prompt"
          }
          className="min-h-[400px] font-mono text-sm glass-effect border-[#5a5a5a]/30 focus:border-[#d1a954] focus:ring-[#d1a954]/20"
          readOnly
        />
      </div>
    </Card>
  )
}
