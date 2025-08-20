"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  Zap, 
  CheckCircle, 
  Info,
  Clock,
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  NotificationType, 
  NotificationSeverity, 
  EscalationLevel 
} from '@/lib/notifications/notification-manager'

interface NotificationStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  byEscalation: Record<string, number>
  recent: number
}

export function NotificationDashboard() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { sendNotification, isLoading: isSending } = useNotifications()

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/send')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />
      case 'performance': return <Zap className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Info className="w-4 h-4" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'text-red-600'
      case 'security': return 'text-purple-600'
      case 'devops': return 'text-blue-600'
      case 'team_lead': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleTestNotification = async (type: NotificationType, severity: NotificationSeverity) => {
    await sendNotification({
      type,
      severity,
      title: `Test ${type} Notification`,
      message: `This is a test ${severity} ${type} notification from the dashboard.`,
      source: 'notification-dashboard',
      tags: ['test', 'dashboard', type, severity]
    })
    
    // Refresh stats after sending
    setTimeout(fetchStats, 1000)
  }

  const handleEmergencyTest = async () => {
    await sendNotification({
      type: NotificationType.SECURITY,
      severity: NotificationSeverity.CRITICAL,
      title: 'EMERGENCY TEST ALERT',
      message: 'This is a test emergency notification that should trigger immediate escalation.',
      source: 'notification-dashboard',
      tags: ['test', 'emergency', 'critical', 'immediate'],
      metadata: {
        emergency: true,
        test: true,
        requiresImmediateResponse: true
      }
    })
    
    setTimeout(fetchStats, 1000)
  }

  const handleTelegramTest = async (channel: string) => {
    await sendNotification({
      type: NotificationType.INFO,
      severity: NotificationSeverity.LOW,
      title: `Telegram Test Notification (${channel})`,
      message: `This is a test notification for the ${channel} Telegram channel.`,
      source: 'notification-dashboard',
      tags: ['test', 'telegram', channel],
      metadata: {
        telegramChannel: channel
      }
    })
    
    setTimeout(fetchStats, 1000)
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading notification statistics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Notification Dashboard</h2>
          <p className="text-[#5a5a5a]">Monitor and manage system notifications</p>
        </div>
        <Button 
          onClick={fetchStats} 
          disabled={isLoading}
          variant="outline"
          className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-[#d1a954]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-[#5a5a5a]">
              {stats.recent} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.bySeverity.critical || 0}
            </div>
            <p className="text-xs text-[#5a5a5a]">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Escalated</CardTitle>
            <Users className="h-4 w-4 text-[#d1a954]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#d1a954]">
              {Object.values(stats.byEscalation).reduce((sum, count) => sum + count, 0) - (stats.byEscalation.none || 0)}
            </div>
            <p className="text-xs text-[#5a5a5a]">
              Sent to teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-[#d1a954]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              &lt; 5m
            </div>
            <p className="text-xs text-[#5a5a5a]">
              Security incidents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1a] border-[#5a5a5a]/30">
          <TabsTrigger value="types" className="text-white">By Type</TabsTrigger>
          <TabsTrigger value="severity" className="text-white">By Severity</TabsTrigger>
          <TabsTrigger value="escalation" className="text-white">By Escalation</TabsTrigger>
          <TabsTrigger value="test" className="text-white">Test Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
            <CardHeader>
              <CardTitle className="text-white">Notifications by Type</CardTitle>
              <CardDescription>Distribution across different notification categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(type)}
                      <span className="text-white capitalize">{type}</span>
                    </div>
                    <Badge variant="secondary" className="text-[#d1a954]">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity" className="space-y-4">
          <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
            <CardHeader>
              <CardTitle className="text-white">Notifications by Severity</CardTitle>
              <CardDescription>Criticality levels of notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <span className={`text-white capitalize ${getSeverityColor(severity)}`}>
                      {severity}
                    </span>
                    <Badge variant="secondary" className="text-[#d1a954]">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4">
          <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
            <CardHeader>
              <CardTitle className="text-white">Escalation Status</CardTitle>
              <CardDescription>Notifications escalated to different teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byEscalation).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className={`text-white capitalize ${getEscalationColor(level)}`}>
                      {level === 'none' ? 'No Escalation' : level.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className="text-[#d1a954]">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card className="bg-[#1a1a1a] border-[#5a5a5a]/30">
            <CardHeader>
              <CardTitle className="text-white">Test Notifications</CardTitle>
              <CardDescription>Send test notifications to verify the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Quick Tests</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(NotificationType.INFO, NotificationSeverity.LOW)}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Info
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(NotificationType.WARNING, NotificationSeverity.MEDIUM)}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Warning
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(NotificationType.ERROR, NotificationSeverity.HIGH)}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Error
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestNotification(NotificationType.SECURITY, NotificationSeverity.CRITICAL)}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Security
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Emergency Test</h4>
                  <Button
                    variant="destructive"
                    onClick={handleEmergencyTest}
                    disabled={isSending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Test Emergency Alert
                  </Button>
                  <p className="text-xs text-[#5a5a5a] mt-2">
                    This will trigger immediate escalation to security team
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Performance Test</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestNotification(NotificationType.PERFORMANCE, NotificationSeverity.HIGH)}
                    disabled={isSending}
                    className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                  >
                    Performance Alert
                  </Button>
                  <p className="text-xs text-[#5a5a5a] mt-2">
                    Will escalate to DevOps after 30 minutes
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Telegram Test</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTelegramTest('default')}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Test Default Channel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTelegramTest('security')}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Test Security Channel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTelegramTest('emergency')}
                      disabled={isSending}
                      className="border-[#5a5a5a] text-white hover:border-[#d1a954] hover:text-[#d1a954]"
                    >
                      Test Emergency Channel
                    </Button>
                  </div>
                  <p className="text-xs text-[#5a5a5a] mt-2">
                    Test Telegram notifications to different channels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
