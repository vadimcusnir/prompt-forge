"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type GPTEditResult, type GPTEditOptions } from "@/lib/gpt-editor"
import type { GeneratedPrompt } from "@/types/promptforge"
import { Bot, Zap, Check, Clock, TrendingUp, Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GPTEditorProps {
  generatedPrompt: GeneratedPrompt | null
  onEditComplete?: (result: GPTEditResult) => void
}

export function GPTEditor({ generatedPrompt, onEditComplete }: GPTEditorProps) {
  const [editResult, setEditResult] = useState<GPTEditResult | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [options, setOptions] = useState<GPTEditOptions>({
    focus: "comprehensive",
    tone: "professional",
    length: "detailed",
  })
  const { toast } = useToast()

  const handleOptimizePrompt = async () => {
    if (!generatedPrompt) {
      toast({
        title: "Error",
        description: "No prompt to optimize!",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)

    try {
      // Call real GPT Editor API
      const response = await fetch("/api/gpt-editor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generatedPrompt.prompt,
          options,
          sevenD: {
            domain: generatedPrompt.config.domain,
            scale: generatedPrompt.config.scale,
            urgency: generatedPrompt.config.urgency,
            complexity: generatedPrompt.config.complexity,
            resources: generatedPrompt.config.resources,
            application: generatedPrompt.config.application,
            output: generatedPrompt.config.outputFormat,
          },
          userId: "user-123", // TODO: Get from auth context
          sessionId: `session-${Date.now()}`,
          planId: "pro", // TODO: Get from user context
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to optimize prompt")
      }

      const result = await response.json()
      
      // Transform API response to match component interface
      const transformedResult: GPTEditResult = {
        originalPrompt: generatedPrompt.prompt,
        editedPrompt: result.editedPrompt,
        improvements: result.improvements,
        confidence: result.confidence,
        processingTime: result.processingTime,
      }
      
      setEditResult(transformedResult)
      onEditComplete?.(transformedResult)

      toast({
        title: "Prompt optimized successfully!",
        description: `Confidence: ${result.confidence}% | Score: ${result.overallScore}%`,
      })
    } catch (error) {
      console.error("GPT Editor API Error:", error)
      toast({
        title: "Optimization error",
        description: error instanceof Error ? error.message : "Could not optimize prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleCopyEdited = async () => {
    if (!editResult) return

    try {
      await navigator.clipboard.writeText(editResult.editedPrompt)
      toast({
        title: "Copied to clipboard!",
        description: "Optimized prompt was copied successfully.",
      })
    } catch (error) {
      toast({
        title: "Copy error",
        description: "Could not copy prompt.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadEdited = () => {
    if (!editResult) return

    const blob = new Blob([editResult.editedPrompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prompt_optimized_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Prompt downloaded!",
      description: "Optimized prompt was downloaded successfully.",
    })
  }

  return (
    <Card className="glass-effect p-6 glow-accent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-[var(--font-heading)] text-foreground flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          GPT-Powered Editor
        </h2>
        {editResult && (
          <Badge variant="default" className="glass-effect">
            <TrendingUp className="w-3 h-3 mr-1" />
            Confidence: {editResult.confidence}%
          </Badge>
        )}
      </div>

      {/* Options Panel */}
      <div className="mb-6 p-4 glass-strong rounded-lg">
        <h4 className="font-semibold text-foreground mb-3">Optimization Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Focus</label>
            <Select value={options.focus} onValueChange={(value: any) => setOptions({ ...options, focus: value })}>
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarity">Clarity</SelectItem>
                <SelectItem value="structure">Structure</SelectItem>
                <SelectItem value="specificity">Specificity</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Tone</label>
            <Select value={options.tone} onValueChange={(value: any) => setOptions({ ...options, tone: value })}>
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Length</label>
            <Select value={options.length} onValueChange={(value: any) => setOptions({ ...options, length: value })}>
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleOptimizePrompt} disabled={!generatedPrompt || isEditing} className="glow-primary">
          {isEditing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Optimizing with GPT-4...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Optimize with GPT-4
            </>
          )}
        </Button>

        {editResult && (
          <>
            <Button variant="outline" onClick={handleCopyEdited} className="glass-effect bg-transparent">
              <Copy className="w-4 h-4 mr-2" />
              Copy Optimized
            </Button>

            <Button variant="outline" onClick={handleDownloadEdited} className="glass-effect bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Optimized
            </Button>
          </>
        )}
      </div>

      {/* Processing Status */}
      {isEditing && (
        <div className="mb-6 p-4 glass-strong rounded-lg border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 animate-spin text-primary" />
            <span className="font-semibold text-foreground">Processing with GPT-4o...</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyzing structure, optimizing clarity and improving prompt executability...
          </p>
        </div>
      )}

      {/* Results Panel */}
      {editResult && (
        <div className="mb-6 p-4 glass-strong rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-green-400" />
            <h4 className="font-semibold text-foreground">Optimization Complete</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{editResult.confidence}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{editResult.improvements.length}</div>
              <div className="text-xs text-muted-foreground">Improvements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{editResult.processingTime}ms</div>
              <div className="text-xs text-muted-foreground">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {Math.round((editResult.editedPrompt.length / editResult.originalPrompt.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Expansion</div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="font-semibold text-foreground mb-2">Applied Improvements:</h5>
            <div className="space-y-1">
              {editResult.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-muted-foreground">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Separator className="mb-6" />

      {/* Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            Original
            {generatedPrompt && (
              <Badge variant="outline" className="text-xs">
                {generatedPrompt.prompt.length} characters
              </Badge>
            )}
          </h4>
          <Textarea
            value={generatedPrompt?.prompt || ""}
            placeholder="Original prompt will appear here..."
            className="min-h-[400px] font-mono text-sm glass-effect"
            readOnly
          />
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            GPT-4 Optimized
            {editResult && (
              <Badge variant="outline" className="text-xs">
                {editResult.editedPrompt.length} characters
              </Badge>
            )}
          </h4>
          <Textarea
            value={editResult?.editedPrompt || ""}
            placeholder="Optimized prompt will appear here after processing..."
            className="min-h-[400px] font-mono text-sm glass-effect border-primary/50"
            readOnly
          />
        </div>
      </div>
    </Card>
  )
}
