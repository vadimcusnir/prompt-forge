"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Shield,
  Zap,
  Globe,
  Coins,
  Scale as ScaleIcon,
  Activity
} from "lucide-react"
import type { SevenDParams } from "../lib/client-agent"

interface SevenDDetailsProps {
  sevenD: SevenDParams
  showCompliance?: boolean
}

export function SevenDDetails({ sevenD, showCompliance = true }: SevenDDetailsProps) {
  // Domain-specific compliance and recommendations
  const getDomainCompliance = (domain: string) => {
    switch (domain) {
      case 'FIN':
        return {
          regulations: ['PCI DSS', 'SOX', 'KYC/AML'],
          riskLevel: 'high',
          recommendations: [
            'Implement strong data encryption',
            'Ensure audit trails for all transactions',
            'Regular compliance assessments required'
          ]
        }
      case 'HEALTH':
        return {
          regulations: ['HIPAA', 'HITECH', 'FDA'],
          riskLevel: 'critical',
          recommendations: [
            'Patient data protection mandatory',
            'Access controls strictly enforced',
            'Regular security training required'
          ]
        }
      case 'LEGAL':
        return {
          regulations: ['Bar Association', 'Client Privilege', 'Ethics Rules'],
          riskLevel: 'high',
          recommendations: [
            'Attorney-client privilege protection',
            'Conflict of interest checks',
            'Secure document handling'
          ]
        }
      case 'GOV':
        return {
          regulations: ['FOIA', 'Security Clearance', 'Public Records'],
          riskLevel: 'critical',
          recommendations: [
            'Transparency requirements compliance',
            'Security clearance verification',
            'Public accountability measures'
          ]
        }
      default:
        return {
          regulations: ['GDPR', 'Data Protection'],
          riskLevel: 'medium',
          recommendations: [
            'Standard data protection practices',
            'Privacy policy compliance',
            'Regular security updates'
          ]
        }
    }
  }

  // Get urgency impact description
  const getUrgencyImpact = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return {
          timeline: 'Flexible timeline, thorough planning',
          resources: 'Standard resource allocation',
          quality: 'High quality focus, comprehensive testing'
        }
      case 'normal':
        return {
          timeline: 'Standard business timeline',
          resources: 'Balanced resource allocation',
          quality: 'Quality assured with standard testing'
        }
      case 'high':
        return {
          timeline: 'Accelerated delivery, prioritized tasks',
          resources: 'Increased resource allocation',
          quality: 'Quality maintained with focused testing'
        }
      case 'crisis':
        return {
          timeline: 'Emergency response, immediate action',
          resources: 'Maximum resource mobilization',
          quality: 'Minimum viable quality with emergency protocols'
        }
      default:
        return {
          timeline: 'Standard timeline',
          resources: 'Standard resources',
          quality: 'Standard quality'
        }
    }
  }

  // Get complexity implications
  const getComplexityImplications = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return {
          expertise: 'Basic skills sufficient',
          timeline: 'Quick implementation',
          risk: 'Low risk, straightforward approach'
        }
      case 'medium':
        return {
          expertise: 'Moderate expertise required',
          timeline: 'Standard implementation time',
          risk: 'Moderate risk, managed approach'
        }
      case 'high':
        return {
          expertise: 'Expert-level skills required',
          timeline: 'Extended implementation time',
          risk: 'High risk, requires careful planning'
        }
      default:
        return {
          expertise: 'Standard skills',
          timeline: 'Standard time',
          risk: 'Standard risk'
        }
    }
  }

  const compliance = getDomainCompliance(sevenD.domain)
  const urgencyImpact = getUrgencyImpact(sevenD.urgency)
  const complexityImplications = getComplexityImplications(sevenD.complexity)

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default: return 'bg-green-500/10 text-green-400 border-green-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* 7D Summary Card */}
      <Card className="glass-effect p-6 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>7D Configuration Summary</span>
          </CardTitle>
          <CardDescription>
            Complete configuration analysis and impact assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Domain</span>
              </div>
              <Badge className="w-full justify-center bg-blue-500/10 text-blue-400 border-blue-500/20">
                {sevenD.domain}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Scale</span>
              </div>
              <Badge className="w-full justify-center bg-green-500/10 text-green-400 border-green-500/20">
                {sevenD.scale}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Urgency</span>
              </div>
              <Badge className={`w-full justify-center ${
                sevenD.urgency === 'crisis' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                sevenD.urgency === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {sevenD.urgency}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Complexity</span>
              </div>
              <Badge className={`w-full justify-center ${
                sevenD.complexity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                sevenD.complexity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {sevenD.complexity}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Resources</span>
              </div>
              <Badge className="w-full justify-center bg-purple-500/10 text-purple-400 border-purple-500/20">
                {sevenD.resources}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Application</span>
              </div>
              <Badge className="w-full justify-center bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                {sevenD.application}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Output</span>
              </div>
              <Badge className="w-full justify-center bg-pink-500/10 text-pink-400 border-pink-500/20">
                {sevenD.output}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      {showCompliance && (
        <Card className="glass-effect p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Domain Compliance & Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={getRiskColor(compliance.riskLevel)}>
                {compliance.riskLevel.toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Regulatory Requirements:</h4>
              <div className="flex flex-wrap gap-2">
                {compliance.regulations.map((reg, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {reg}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Compliance Recommendations:</h4>
              <ul className="space-y-1">
                {compliance.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgency Impact */}
        <Card className="glass-effect p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span>Urgency Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Timeline:</span>
              <p className="text-sm text-muted-foreground">{urgencyImpact.timeline}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Resources:</span>
              <p className="text-sm text-muted-foreground">{urgencyImpact.resources}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Quality:</span>
              <p className="text-sm text-muted-foreground">{urgencyImpact.quality}</p>
            </div>
          </CardContent>
        </Card>

        {/* Complexity Implications */}
        <Card className="glass-effect p-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span>Complexity Implications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Expertise:</span>
              <p className="text-sm text-muted-foreground">{complexityImplications.expertise}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Timeline:</span>
              <p className="text-sm text-muted-foreground">{complexityImplications.timeline}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Risk:</span>
              <p className="text-sm text-muted-foreground">{complexityImplications.risk}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Alerts */}
      {sevenD.urgency === 'crisis' && (
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Crisis Mode Activated:</strong> Emergency protocols in effect. 
            Immediate escalation procedures and rapid response team deployment required.
          </AlertDescription>
        </Alert>
      )}

      {(sevenD.domain === 'HEALTH' || sevenD.domain === 'FIN') && sevenD.complexity === 'high' && (
        <Alert className="border-orange-500/20 bg-orange-500/10">
          <Shield className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-300">
            <strong>High-Risk Configuration:</strong> {sevenD.domain} domain with high complexity requires 
            additional security measures and extended compliance validation.
          </AlertDescription>
        </Alert>
      )}

      {sevenD.resources === 'minimal' && sevenD.complexity === 'high' && (
        <Alert className="border-yellow-500/20 bg-yellow-500/10">
          <Info className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>Resource Constraint Warning:</strong> High complexity with minimal resources 
            may impact delivery timeline and quality. Consider scope reduction or resource augmentation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
