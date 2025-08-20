"use client"



import { useState } from "react"
import { Card } from "@/components/ui/card"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { compareTestResults, type TestResult, type TestOptions } from "@/lib/test-engine"
import type { GeneratedPrompt } from "@/types/promptforge"
import {
  Play,
  Clock,
  Check,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  Shield,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestEngineProps {
  generatedPrompt: GeneratedPrompt | null
  onTestComplete?: (result: TestResult) => void
}

export function TestEngine({ generatedPrompt, onTestComplete }: TestEngineProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [testOptions, setTestOptions] = useState<TestOptions>({
    mode: "comprehensive",
    validateKPIs: true,
    checkGuardrails: true,
    simulateFailures: false,
  })
  const { toast } = useToast()

  const handleRunTest = async () => {
    if (!generatedPrompt) {
      toast({
        title: "Error",
        description: "No prompt to test!",
        variant: "destructive",
      })
      return
    }

    setIsRunning(true)

    try {
      // Call real GPT Test API for each test type
      const testTypes = ['clarity', 'execution', 'ambiguity', 'business_fit'] as const
      const testPromises = testTypes.map(async (testType) => {
        const response = await fetch("/api/gpt-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: generatedPrompt.prompt,
            testType,
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
          throw new Error(errorData.error || `Failed to run ${testType} test`)
        }

        return response.json()
      })

      const testResults = await Promise.all(testPromises)
      
      // Calculate overall scores
      const scores = {
        clarity: testResults[0].score,
        execution: testResults[1].score,
        ambiguity: testResults[2].score,
        business_fit: testResults[3].score,
      }
      
      const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
      
      // Create comprehensive test result
      const result: TestResult = {
        id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        promptId: generatedPrompt.id,
        timestamp: new Date(),
        executionTime: Date.now() - Date.now(), // Will be calculated properly
        output: `GPT Test Results:\n${testResults.map(t => `${t.testType}: ${t.score}% - ${t.feedback}`).join('\n')}`,
        scores: {
          structure: scores.clarity,
          kpiCompliance: scores.business_fit,
          clarity: scores.clarity,
          executability: scores.execution,
          overall,
        },
        validation: {
          hasRequiredSections: true,
          hasValidKPIs: scores.business_fit >= 80,
          hasGuardrails: true,
          hasFailsafes: true,
          isExecutable: scores.execution >= 80,
          issues: [],
        },
        status: overall >= 80 ? "success" : overall >= 60 ? "warning" : "error",
        recommendations: testResults.flatMap(t => t.suggestions),
      }
      
      setCurrentTest(result)
      setTestResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10
      onTestComplete?.(result)

      toast({
        title: "GPT Test completed!",
        description: `Overall score: ${overall.toFixed(1)}% | Status: ${result.status}`,
        variant: result.status === "success" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("GPT Test API Error:", error)
      toast({
        title: "Test error",
        description: error instanceof Error ? error.message : "Could not execute test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Success"
      case "warning":
        return "Warning"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-blue-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const comparison = testResults.length > 1 ? compareTestResults(testResults) : null

  return (
    <Card className="glass-effect p-6 glow-accent border-[#5a5a5a]/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-[var(--font-heading)] text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#d1a954]" />
          Test Engine
        </h2>
        {currentTest && (
          <Badge variant={currentTest.status === "success" ? "default" : "destructive"} className="glass-effect border-[#5a5a5a]/30">
            {getStatusIcon(currentTest.status)}
            <span className="ml-1">{getStatusText(currentTest.status)}</span>
          </Badge>
        )}
      </div>

      {/* Test Options */}
      <div className="mb-6 p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
        <h4 className="font-semibold text-white mb-3">Test Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Test Mode</label>
            <Select
              value={testOptions.mode}
              onValueChange={(value: any) => setTestOptions({ ...testOptions, mode: value })}
            >
              <SelectTrigger className="glass-effect border-[#5a5a5a]/30 focus:border-[#d1a954] focus:ring-[#d1a954]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick (1s)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (2.5s)</SelectItem>
                <SelectItem value="stress">Stress Test (4s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="validateKPIs"
              checked={testOptions.validateKPIs}
              onCheckedChange={(checked) => setTestOptions({ ...testOptions, validateKPIs: !!checked })}
            />
            <label htmlFor="validateKPIs" className="text-sm text-white">
              Validate KPIs
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="checkGuardrails"
              checked={testOptions.checkGuardrails}
              onCheckedChange={(checked) => setTestOptions({ ...testOptions, checkGuardrails: !!checked })}
            />
            <label htmlFor="checkGuardrails" className="text-sm text-white">
              Check Guardrails
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="simulateFailures"
              checked={testOptions.simulateFailures}
              onCheckedChange={(checked) => setTestOptions({ ...testOptions, simulateFailures: !!checked })}
            />
            <label htmlFor="simulateFailures" className="text-sm text-white">
              Simulate Failures
            </label>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button onClick={handleRunTest} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-gold-industrial text-pf-black shadow-[0_0_20px_rgba(209,169,84,0.3)] hover:shadow-[0_0_30px_rgba(209,169,84,0.5)]">
          {isRunning ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Running {testOptions.mode} test...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </>
          )}
        </button>
      </div>

      {/* Test Progress */}
      {isRunning && (
        <div className="mb-6 p-4 glass-strong rounded-lg border-l-4 border-gold-industrial">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 animate-spin text-gold-industrial" />
            <span className="font-semibold text-white">Execution in progress...</span>
          </div>
          <p className="text-sm text-[#5a5a5a] mb-3">
            Simulating GPT execution and validating prompt structure...
          </p>
          <Progress value={75} className="w-full" />
        </div>
      )}

      {/* Test Results */}
      {currentTest && (
        <div className="mb-6 space-y-4">
          {/* Scores Overview */}
          <div className="p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Validation Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentTest.scores.structure)}`}>
                  {currentTest.scores.structure}%
                </div>
                <div className="text-xs text-[#5a5a5a]">Structure</div>
                <Progress value={currentTest.scores.structure} className="w-full mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentTest.scores.kpiCompliance)}`}>
                  {currentTest.scores.kpiCompliance}%
                </div>
                <div className="text-xs text-[#5a5a5a]">KPI Compliance</div>
                <Progress value={currentTest.scores.kpiCompliance} className="w-full mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentTest.scores.clarity)}`}>
                  {currentTest.scores.clarity}%
                </div>
                <div className="text-xs text-[#5a5a5a]">Clarity</div>
                <Progress value={currentTest.scores.clarity} className="w-full mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentTest.scores.executability)}`}>
                  {currentTest.scores.executability}%
                </div>
                <div className="text-xs text-[#5a5a5a]">Executability</div>
                <Progress value={currentTest.scores.executability} className="w-full mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(currentTest.scores.overall)}`}>
                  {currentTest.scores.overall}%
                </div>
                <div className="text-xs text-[#5a5a5a]">Overall</div>
                <Progress value={currentTest.scores.overall} className="w-full mt-1 h-1" />
              </div>
            </div>
          </div>

          {/* Validation Issues */}
          {currentTest.validation.issues.length > 0 && (
            <div className="p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Identified Issues ({currentTest.validation.issues.length})
              </h4>
              <div className="space-y-2">
                {currentTest.validation.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded border-l-4 ${
                      issue.type === "error"
                        ? "border-red-500 bg-red-500/10"
                        : issue.type === "warning"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-blue-500 bg-blue-500/10"
                    }`}
                  >
                    {issue.type === "error" ? (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : issue.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white break-words">
                        [{issue.section}] {issue.message}
                      </div>
                      {issue.suggestion && (
                        <div className="text-xs text-[#5a5a5a] mt-1 break-words line-clamp-2">
                          💡 {issue.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentTest.recommendations.length > 0 && (
            <div className="p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Recommendations ({currentTest.recommendations.length})
              </h4>
              <div className="space-y-2">
                {currentTest.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-[#5a5a5a] break-words">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
            <h4 className="font-semibold text-white mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Execution Time:</strong> {currentTest.executionTime}ms
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={getScoreColor(currentTest.scores.overall)}>{getStatusText(currentTest.status)}</span>
              </div>
              <div>
                <strong>Test Mode:</strong> {testOptions.mode}
              </div>
              <div>
                <strong>Timestamp:</strong> {currentTest.timestamp.toLocaleTimeString("en-US")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Analysis */}
      {comparison && (
        <div className="mb-6 p-4 glass-strong rounded-lg border-[#5a5a5a]/30">
          <h4 className="font-semibold text-white mb-3">Trends Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comparison.trends.map((trend, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {trend.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : trend.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-white">{trend.metric}</span>
                </div>
                <div
                  className={`text-lg font-bold ${
                    trend.change > 0 ? "text-green-400" : trend.change < 0 ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  {trend.change > 0 ? "+" : ""}
                  {trend.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="mb-6 border-[#5a5a5a]/30" />

      {/* Test Output */}
      <div>
        <h4 className="font-semibold text-white mb-2">GPT Test Output</h4>
        <Textarea
          value={currentTest?.output || ""}
          placeholder="Test result will appear here..."
          className="min-h-[300px] font-mono text-sm glass-effect border-[#5a5a5a]/30 focus:border-[#d1a954] focus:ring-[#d1a954]/20"
          readOnly
        />
      </div>
    </Card>
  )
}
