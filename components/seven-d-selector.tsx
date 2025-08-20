"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Building2, 
  Users, 
  Clock, 
  Cpu, 
  Wallet, 
  Target, 
  FileText,
  Info,
  Check,
  AlertTriangle,
  Zap,
  Shield,
  Globe,
  Scale,
  Timer,
  Settings,
  Coins,
  Activity,
  Package
} from "lucide-react"
import { ClientCursorAgent as CursorAgent, type SevenDParams } from "../lib/client-agent"

interface SevenDSelectorProps {
  value: Partial<SevenDParams>
  onChange: (sevenD: SevenDParams) => void
  disabled?: boolean
  showRecommendations?: boolean
}

export function SevenDSelector({ 
  value, 
  onChange, 
  disabled = false, 
  showRecommendations = true 
}: SevenDSelectorProps) {
  const [currentSevenD, setCurrentSevenD] = useState<Partial<SevenDParams>>(value)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isValid, setIsValid] = useState(false)

  // 7D Configuration with icons and descriptions
  const sevenDConfig = {
    domain: {
      icon: Building2,
      label: "Domain",
      description: "Industry/business domain",
      options: [
        { value: "FIN", label: "FinTech", icon: Coins, description: "Financial technology and services" },
        { value: "ECOM", label: "E-Commerce", icon: Package, description: "Online retail and marketplace" },
        { value: "EDU", label: "Education", icon: FileText, description: "Educational technology and learning" },
        { value: "SAAS", label: "SaaS", icon: Zap, description: "Software as a Service" },
        { value: "HEALTH", label: "Healthcare", icon: Shield, description: "Medical and health services" },
        { value: "LEGAL", label: "Legal", icon: Scale, description: "Legal services and compliance" },
        { value: "GOV", label: "Government", icon: Globe, description: "Public sector and governance" },
        { value: "MEDIA", label: "Media", icon: Activity, description: "Media and entertainment" }
      ]
    },
    scale: {
      icon: Users,
      label: "Scale",
      description: "Organizational scale",
      options: [
        { value: "solo", label: "Solo", icon: Users, description: "Individual contributor" },
        { value: "team", label: "Team", icon: Users, description: "Small team (2-10 people)" },
        { value: "org", label: "Organization", icon: Building2, description: "Large organization (100+ people)" },
        { value: "market", label: "Market", icon: Globe, description: "Market-wide solution" }
      ]
    },
    urgency: {
      icon: Clock,
      label: "Urgency",
      description: "Time sensitivity",
      options: [
        { value: "low", label: "Low", icon: Timer, description: "No immediate deadline" },
        { value: "normal", label: "Normal", icon: Clock, description: "Standard business timeline" },
        { value: "high", label: "High", icon: Zap, description: "Urgent, needs quick delivery" },
        { value: "crisis", label: "Crisis", icon: AlertTriangle, description: "Emergency response required" }
      ]
    },
    complexity: {
      icon: Cpu,
      label: "Complexity",
      description: "Technical complexity level",
      options: [
        { value: "low", label: "Low", icon: Settings, description: "Simple, straightforward solution" },
        { value: "medium", label: "Medium", icon: Cpu, description: "Moderate complexity" },
        { value: "high", label: "High", icon: Zap, description: "Complex, requires expertise" }
      ]
    },
    resources: {
      icon: Wallet,
      label: "Resources",
      description: "Available resources",
      options: [
        { value: "minimal", label: "Minimal", icon: Coins, description: "Limited budget and resources" },
        { value: "standard", label: "Standard", icon: Wallet, description: "Normal resource allocation" },
        { value: "extended", label: "Extended", icon: Building2, description: "Ample resources available" }
      ]
    },
    application: {
      icon: Target,
      label: "Application",
      description: "Primary use case",
      options: [
        { value: "content_ops", label: "Content Ops", icon: FileText, description: "Content creation and management" },
        { value: "sales_ops", label: "Sales Ops", icon: Target, description: "Sales process optimization" },
        { value: "product_ops", label: "Product Ops", icon: Settings, description: "Product development operations" },
        { value: "research", label: "Research", icon: Activity, description: "Research and analysis" },
        { value: "crisis_ops", label: "Crisis Ops", icon: AlertTriangle, description: "Crisis management operations" }
      ]
    },
    output: {
      icon: FileText,
      label: "Output",
      description: "Expected output format",
      options: [
        { value: "text", label: "Text", icon: FileText, description: "Plain text output" },
        { value: "sop", label: "SOP", icon: Settings, description: "Standard Operating Procedure" },
        { value: "plan", label: "Plan", icon: Target, description: "Strategic plan document" },
        { value: "bundle", label: "Bundle", icon: Package, description: "Complete artifact bundle" }
      ]
    }
  }

  // Validate current 7D configuration
  useEffect(() => {
    try {
      if (Object.keys(currentSevenD).length > 0) {
        const normalizedSevenD = CursorAgent.normalizeSevenD(currentSevenD)
        const validSevenD = CursorAgent.validateSevenD(normalizedSevenD)
        
        setValidationErrors([])
        setIsValid(true)
        setRecommendations(CursorAgent.getSevenDRecommendations(validSevenD))
        
        // Trigger onChange with complete validated 7D
        onChange(validSevenD)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
      setValidationErrors([errorMessage])
      setIsValid(false)
      setRecommendations([])
    }
  }, [currentSevenD, onChange])

  // Apply domain-specific defaults when domain changes
  useEffect(() => {
    if (currentSevenD.domain && currentSevenD.domain !== value.domain) {
      const normalizedSevenD = CursorAgent.normalizeSevenD({ domain: currentSevenD.domain })
      setCurrentSevenD(normalizedSevenD)
    }
  }, [currentSevenD.domain])

  const handleSevenDChange = (dimension: keyof SevenDParams, value: string) => {
    setCurrentSevenD(prev => ({
      ...prev,
      [dimension]: value
    }))
  }

  const getOptionColor = (dimension: keyof SevenDParams, optionValue: string) => {
    const colorMap: Record<string, string> = {
      // Domain colors
      FIN: "bg-green-500/10 text-green-400 border-green-500/20",
      ECOM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      EDU: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      SAAS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      HEALTH: "bg-red-500/10 text-red-400 border-red-500/20",
      LEGAL: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      GOV: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      MEDIA: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      
      // Urgency colors
      low: "bg-green-500/10 text-green-400 border-green-500/20",
      normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      crisis: "bg-red-500/10 text-red-400 border-red-500/20",
      
      // Complexity colors
      // low, medium, high already covered above
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }
    
    return colorMap[optionValue] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect p-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>7D Configuration Engine</span>
            {isValid && <Check className="w-5 h-5 text-green-500" />}
            {!isValid && validationErrors.length > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
          </CardTitle>
          <CardDescription>
            Configure all 7 dimensions for optimal prompt generation. Domain selection auto-applies industry defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(sevenDConfig).map(([dimension, config]) => {
              const IconComponent = config.icon
              const currentValue = currentSevenD[dimension as keyof SevenDParams]
              const selectedOption = config.options.find(opt => opt.value === currentValue)
              
              return (
                <div key={dimension} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium text-foreground">
                      {config.label}
                    </label>
                  </div>
                  
                  <Select
                    value={currentValue || ""}
                    onValueChange={(value) => handleSevenDChange(dimension as keyof SevenDParams, value)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${config.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options.map((option) => {
                        const OptionIcon = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <OptionIcon className="w-4 h-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  
                  {selectedOption && (
                    <div className={`p-2 rounded-lg border text-xs ${getOptionColor(dimension as keyof SevenDParams, selectedOption.value)}`}>
                      {selectedOption.description}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>7D Validation Errors:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 7D Summary */}
      {isValid && (
        <Card className="glass-effect p-4 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-400">
              <Check className="w-5 h-5" />
              <span>7D Configuration Valid</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentSevenD).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                  <Badge variant="outline" className={getOptionColor(key as keyof SevenDParams, value)}>
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
            
            {currentSevenD.domain && (
              <div className="mt-4 text-xs text-muted-foreground">
                <strong>Signature:</strong> {CursorAgent.generateSevenDSignature(currentSevenD as SevenDParams)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Domain-Specific Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <Card className="glass-effect p-4 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-400">
              <Info className="w-5 h-5" />
              <span>Domain Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
