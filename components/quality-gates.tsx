'use client';

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, XCircle, AlertTriangle, Clock, Lock } from "lucide-react"
import { qualityGateValidator, type DoRResult, type DoDResult, type BundleValidation } from "@/lib/dor-dod-validator"
import type { GeneratedPrompt } from "@/types/promptforge"
import type { TestResult } from "@/lib/test-engine"

interface QualityGatesProps {
  prompt: GeneratedPrompt
  testResults: TestResult[]
  userPlanId?: string
  onValidationChange?: (canProceed: boolean, canDeliver: boolean) => void
}

export function QualityGates({ 
  prompt, 
  testResults, 
  userPlanId = 'pilot',
  onValidationChange 
}: QualityGatesProps) {
  const [dorResult, setDorResult] = useState<DoRResult | null>(null)
  const [dodResult, setDodResult] = useState<DoDResult | null>(null)
  const [canProceed, setCanProceed] = useState(false)
  const [canDeliver, setCanDeliver] = useState(false)
  const [isValidating, setIsValidating] = useState(true)

  // Mock bundle validation for demo
  const mockBundle: BundleValidation = {
    artifacts: {
      txt: true,
      md: true,
      json: true,
      pdf: false, // PDF requires Pro plan
      manifest: true,
      checksum: true
    },
    checksum: {
      calculated: "sha256:abc123...",
      verified: true,
      files: ["prompt.txt", "prompt.md", "prompt.json", "manifest.json"]
    },
    manifest: {
      exists: true,
      complete: true,
      licenseNotice: `PFv3 ${userPlanId.charAt(0).toUpperCase() + userPlanId.slice(1)}`
    }
  }

  useEffect(() => {
    validateQualityGates()
  }, [prompt, testResults, userPlanId])

  const validateQualityGates = () => {
    setIsValidating(true)
    
    try {
      const validation = qualityGateValidator.validateRun(prompt, userPlanId, testResults, mockBundle)
      
      setDorResult(validation.dor)
      setDodResult(validation.dod)
      setCanProceed(validation.canProceed)
      setCanDeliver(validation.canDeliver)
      
      onValidationChange?.(validation.canProceed, validation.canDeliver)
    } catch (error) {
      console.error('Quality gate validation failed:', error)
      setCanProceed(false)
      setCanDeliver(false)
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusIcon = (isValid: boolean, isRequired: boolean = true) => {
    if (isValid) {
      return <Check className="w-4 h-4 text-green-500" />
    }
    if (isRequired) {
      return <XCircle className="w-4 h-4 text-red-500" />
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  const getStatusBadge = (isValid: boolean, isRequired: boolean = true) => {
    if (isValid) {
      return <Badge variant="default" className="bg-green-500">PASS</Badge>
    }
    if (isRequired) {
      return <Badge variant="destructive">FAIL</Badge>
    }
    return <Badge variant="secondary">WARNING</Badge>
  }

  if (isValidating) {
    return (
      <Card className="glass-effect p-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 animate-spin text-primary" />
          <span className="text-lg font-semibold">Validating Quality Gates...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* DoR Section */}
      <Card className="glass-effect p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Definition of Ready (DoR)</span>
          </h3>
          {getStatusBadge(dorResult?.isReady || false, true)}
        </div>

        <div className="space-y-3">
          {dorResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dorResult.checks.sevenDValid)}
                  <span>7D Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dorResult.checks.entitlementsValid)}
                  <span>Entitlements</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dorResult.checks.outputSpecLoaded)}
                  <span>Output Spec</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dorResult.checks.testsDefined)}
                  <span>Tests Defined</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dorResult.checks.inputMinimum)}
                  <span>Input Minimum</span>
                </div>
              </div>

              {dorResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DoR Validation Failed:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {dorResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </Card>

      {/* DoD Section */}
      <Card className="glass-effect p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Definition of Done (DoD)</span>
          </h3>
          {getStatusBadge(dodResult?.isDone || false, true)}
        </div>

        <div className="space-y-3">
          {dodResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dodResult.checks.scoreThreshold)}
                  <span>Score ≥80 ({dodResult.finalScore})</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dodResult.checks.outputComplete)}
                  <span>Output Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dodResult.checks.checksumValid)}
                  <span>Checksum Valid</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dodResult.checks.manifestWritten)}
                  <span>Manifest Written</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dodResult.checks.telemetrySaved)}
                  <span>Telemetry Saved</span>
                </div>
              </div>

              {dodResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DoD Validation Failed:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {dodResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Final Status */}
      <Card className={`glass-effect p-6 ${canDeliver ? 'border-green-500' : 'border-red-500'}`}>
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            {canDeliver ? (
              <span className="text-green-500 flex items-center justify-center space-x-2">
                <Check className="w-8 h-8" />
                <span>READY FOR DELIVERY</span>
              </span>
            ) : (
              <span className="text-red-500 flex items-center justify-center space-x-2">
                <XCircle className="w-8 h-8" />
                <span>VALIDATION FAILED</span>
              </span>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            {canDeliver 
              ? "All quality gates passed. Bundle is ready for delivery."
              : "Quality gates failed. Fix issues before proceeding."
            }
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={validateQualityGates} disabled={!canProceed} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
              Re-validate
            </button>
            
            {canDeliver && (
              <button 
                onClick={() => {/* TODO: Implement export functionality */}}
                className="bg-green-600 hover:bg-green-700 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 rounded"
              >
                Proceed to Export
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Bundle Status */}
      <Card className="glass-effect p-6">
        <h4 className="text-md font-semibold mb-3">Bundle Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.txt)}
            <span className="text-sm">prompt.txt</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.md)}
            <span className="text-sm">prompt.md</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.json)}
            <span className="text-sm">prompt.json</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.pdf, false)}
            <span className="text-sm">prompt.pdf</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.manifest)}
            <span className="text-sm">manifest.json</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(mockBundle.artifacts.checksum)}
            <span className="text-sm">checksum.sha256</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
