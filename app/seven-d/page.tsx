"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { SevenDSelector } from "@/components/seven-d-selector"
import { QualityGates } from "@/components/quality-gates"
import { ArrowLeft, Settings, Zap, Check } from "lucide-react"
import type { SevenDParams } from "../../lib/client-agent"
import type { GeneratedPrompt } from "@/types/promptforge"

export default function SevenDPage() {
  const [sevenD, setSevenD] = useState<Partial<SevenDParams>>({})
  const [currentSevenD, setCurrentSevenD] = useState<SevenDParams | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Mock prompt for demo purposes
  const mockPrompt: GeneratedPrompt = {
    id: 'demo-123',
    moduleId: 1,
    moduleName: 'Demo Module',
    vector: 1,
    content: 'Demo prompt content for 7D validation testing',
    config: currentSevenD || {
      domain: 'SAAS',
      scale: 'team',
      urgency: 'normal',
      complexity: 'medium',
      resources: 'standard',
      application: 'content_ops',
      outputFormat: 'bundle'
    },
    validationScore: 85,
    sessionHash: 'demo-hash',
    timestamp: new Date(),
    testResults: []
  }

  const handleSevenDChange = (newSevenD: SevenDParams) => {
    setCurrentSevenD(newSevenD)
    setSevenD(newSevenD)
  }

  const handleShowValidation = () => {
    if (currentSevenD) {
      setShowValidation(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-black font-[var(--font-heading)] text-foreground text-gradient">
                  7D Configuration Engine
                </h1>
                <p className="text-sm text-muted-foreground">Complete implementation of all 7 dimensions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="glass-effect">
                <Settings className="w-4 h-4 mr-2" />
                All 7D Implemented
              </Badge>
              {currentSevenD && (
                <Badge variant="outline" className="glass-effect animate-bounce-subtle bg-green-500/10 text-green-400">
                  <Check className="w-4 h-4 mr-2" />
                  Valid Configuration
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Introduction */}
        <Card className="glass-effect p-6 mb-8 glow-primary animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <span>7D Implementation Demo</span>
            </CardTitle>
            <CardDescription>
              Comprehensive implementation of all 7 dimensions with real-time validation, 
              domain-specific defaults, and quality gate integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Implemented Dimensions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Domain (8 industries)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Scale (4 levels)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Urgency (4 levels)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Complexity (3 levels)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Advanced Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Resources (3 tiers)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Application (5 ops types)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Output (4 formats)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Auto-defaults per domain</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Quality Enforcement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Real-time validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Domain recommendations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>Signature generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>DoR/DoD integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7D Selector */}
        <div className="mb-8">
          <SevenDSelector
            value={sevenD}
            onChange={handleSevenDChange}
            showRecommendations={true}
          />
        </div>

        {/* Action Buttons */}
        {currentSevenD && (
          <div className="flex space-x-4 mb-8">
            <button onClick={handleShowValidation} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
              <Zap className="w-4 h-4 mr-2" />
              Test Quality Gates
            </button>
            
            <button onClick={() => {
                console.log('Current 7D Configuration:', currentSevenD)
                alert(`7D Signature: ${JSON.stringify(currentSevenD, null, 2)}`)
              }} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
              Export 7D Configuration
            </button>
          </div>
        )}

        {/* Quality Gates Demo */}
        {showValidation && currentSevenD && (
          <div className="animate-slide-up">
            <Card className="glass-effect p-6 mb-8">
              <CardHeader>
                <CardTitle>Quality Gates Integration</CardTitle>
                <CardDescription>
                  Demonstration of how 7D parameters integrate with the DoR/DoD validation system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QualityGates
                  prompt={{
                    ...mockPrompt,
                    config: currentSevenD
                  }}
                  testResults={[]}
                  userPlanId="pro"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Implementation Details */}
        <Card className="glass-effect p-6">
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              Technical details of the 7D implementation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">1. Domain (Industry)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                8 core industries with domain-specific defaults and compliance requirements:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['FIN', 'ECOM', 'EDU', 'SAAS', 'HEALTH', 'LEGAL', 'GOV', 'MEDIA'].map(domain => (
                  <Badge key={domain} variant="outline" className="text-xs">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">2. Scale (Organizational Size)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                4 organizational scales from individual to market-wide:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['solo', 'team', 'org', 'market'].map(scale => (
                  <Badge key={scale} variant="outline" className="text-xs">
                    {scale}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">3. Urgency (Time Sensitivity)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                4 urgency levels with escalation procedures:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['low', 'normal', 'high', 'crisis'].map(urgency => (
                  <Badge key={urgency} variant="outline" className="text-xs">
                    {urgency}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">4. Complexity (Technical Difficulty)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                3 complexity levels affecting resource allocation:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(complexity => (
                  <Badge key={complexity} variant="outline" className="text-xs">
                    {complexity}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">5. Resources (Available Budget/Resources)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                3 resource tiers affecting implementation scope:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['minimal', 'standard', 'extended'].map(resources => (
                  <Badge key={resources} variant="outline" className="text-xs">
                    {resources}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">6. Application (Primary Use Case)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                5 operational applications with specific workflows:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['content_ops', 'sales_ops', 'product_ops', 'research', 'crisis_ops'].map(application => (
                  <Badge key={application} variant="outline" className="text-xs">
                    {application}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">7. Output (Expected Format)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                4 output formats with different delivery mechanisms:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['text', 'sop', 'plan', 'bundle'].map(output => (
                  <Badge key={output} variant="outline" className="text-xs">
                    {output}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
