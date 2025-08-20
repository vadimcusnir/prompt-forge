'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  User, 
  Building2, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface CanonicalFlag {
  flag: string
  enabled: boolean
  source: 'effective_user' | 'effective_org'
  lastUpdated: string | null
  metadata: Record<string, any>
}

interface EntitlementsResponse {
  orgId?: string
  userId?: string
  canonicalFlags: CanonicalFlag[]
  fallback?: boolean
  timestamp: string
}

export default function AdminEntitlementsPage() {
  const [orgId, setOrgId] = useState('')
  const [userId, setUserId] = useState('')
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [source, setSource] = useState<'effective_user' | 'effective_org'>('effective_org')
  const { toast } = useToast()

  const canonicalFlags = [
    {
      key: 'canUseGptTestReal',
      label: 'GPT Test Real',
      description: 'Enable live GPT testing functionality',
      category: 'Testing'
    },
    {
      key: 'canExportPDF',
      label: 'PDF Export',
      description: 'Allow PDF document export',
      category: 'Export'
    },
    {
      key: 'canExportJSON',
      label: 'JSON Export',
      description: 'Allow JSON format export',
      category: 'Export'
    },
    {
      key: 'canExportBundleZip',
      label: 'Bundle ZIP Export',
      description: 'Allow bundle ZIP file export',
      category: 'Export'
    },
    {
      key: 'hasAPI',
      label: 'API Access',
      description: 'Enable API endpoint access',
      category: 'Integration'
    }
  ]

  const fetchEntitlements = async () => {
    if (!orgId && !userId) {
      toast({
        title: "Error",
        description: "Please provide either an Organization ID or User ID",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (orgId) params.append('orgId', orgId)
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/entitlements?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: EntitlementsResponse = await response.json()
      setEntitlements(data)
      
      toast({
        title: "Success",
        description: `Entitlements loaded for ${orgId ? 'organization' : 'user'}`,
      })
    } catch (error) {
      console.error('Error fetching entitlements:', error)
      toast({
        title: "Error",
        description: "Failed to fetch entitlements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateEntitlement = async (flag: string, enabled: boolean) => {
    if (!orgId && !userId) return

    setUpdating(flag)
    try {
      const response = await fetch('/api/entitlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
          userId,
          flag,
          enabled,
          source,
          reason: `Admin ${enabled ? 'enabled' : 'disabled'} ${flag}`
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Update local state
      if (entitlements) {
        setEntitlements({
          ...entitlements,
          canonicalFlags: entitlements.canonicalFlags.map(f => 
            f.flag === flag ? { ...f, enabled, lastUpdated: new Date().toISOString() } : f
          )
        })
      }

      toast({
        title: "Success",
        description: data.message,
      })
    } catch (error) {
      console.error('Error updating entitlement:', error)
      toast({
        title: "Error",
        description: "Failed to update entitlement",
        variant: "destructive"
      })
    } finally {
      setUpdating(null)
    }
  }

  const getFlagStatus = (flagKey: string) => {
    if (!entitlements) return { enabled: false, source: 'effective_org' as const }
    
    const flag = entitlements.canonicalFlags.find(f => f.flag === flagKey)
    return {
      enabled: flag?.enabled || false,
      source: flag?.source || 'effective_org' as const
    }
  }

  const getSourceIcon = (source: string) => {
    return source === 'effective_user' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />
  }

  const getSourceColor = (source: string) => {
    return source === 'effective_user' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Entitlements Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Manage feature flags and access controls for organizations and users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-500">Admin Access Required</span>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="orgId">Organization ID</Label>
              <Input
                id="orgId"
                placeholder="Enter organization ID"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="source">Source Priority</Label>
              <Select value={source} onValueChange={(value: 'effective_user' | 'effective_org') => setSource(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="effective_org">Organization Level</SelectItem>
                  <SelectItem value="effective_user">User Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchEntitlements} 
              disabled={loading || (!orgId && !userId)}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Fetch Entitlements'}
            </Button>
            
            {entitlements && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                Last updated: {new Date(entitlements.timestamp).toLocaleString()}
                {entitlements.fallback && (
                  <Badge variant="secondary">Fallback Mode</Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entitlements Display */}
      {entitlements && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Entitlements Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {entitlements.canonicalFlags.filter(f => f.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Flags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {entitlements.canonicalFlags.filter(f => !f.enabled).length}
                  </div>
                  <div className="text-sm text-gray-600">Inactive Flags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {entitlements.canonicalFlags.filter(f => f.source === 'effective_user').length}
                  </div>
                  <div className="text-sm text-gray-600">User Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {entitlements.canonicalFlags.filter(f => f.source === 'effective_org').length}
                  </div>
                  <div className="text-sm text-gray-600">Org Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {canonicalFlags.map((flag) => {
              const status = getFlagStatus(flag.key)
              const isUpdating = updating === flag.key
              
              return (
                <Card key={flag.key} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {status.enabled ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          {flag.label}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                      </div>
                      <Badge variant="outline" className={flag.category === 'Export' ? 'border-blue-200 text-blue-700' : 
                                                       flag.category === 'Testing' ? 'border-green-200 text-green-700' : 
                                                       'border-purple-200 text-purple-700'}>
                        {flag.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge 
                          variant={status.enabled ? "default" : "secondary"}
                          className={status.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {status.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Source:</span>
                        <Badge className={getSourceColor(status.source)}>
                          <div className="flex items-center gap-1">
                            {getSourceIcon(status.source)}
                            {status.source === 'effective_user' ? 'User' : 'Org'}
                          </div>
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`toggle-${flag.key}`} className="text-sm font-medium">
                        Toggle Flag
                      </Label>
                      <Switch
                        id={`toggle-${flag.key}`}
                        checked={status.enabled}
                        onCheckedChange={(enabled) => updateEntitlement(flag.key, enabled)}
                        disabled={isUpdating}
                      />
                    </div>

                    {isUpdating && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    )}

                    {status.lastUpdated && (
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(status.lastUpdated).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!entitlements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Organization Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enter Organization ID to manage org-level entitlements</li>
                  <li>• Changes affect all users in the organization</li>
                  <li>• Use for bulk feature enablement/disablement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enter User ID to manage individual user entitlements</li>
                  <li>• Overrides organization-level settings</li>
                  <li>• Use for user-specific access control</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Canonical Flags</h4>
              <p className="text-sm text-blue-800">
                These are the core feature flags that control access to premium functionality. 
                Changes are logged and can be audited for compliance purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
