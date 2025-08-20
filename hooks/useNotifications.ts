import { useState, useCallback } from 'react'
import { 
  NotificationType, 
  NotificationSeverity, 
  EscalationLevel,
  NotificationPayload 
} from '@/lib/notifications/notification-manager'

interface SendNotificationOptions {
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  source: string
  tags?: string[]
  details?: Record<string, any>
  metadata?: Record<string, any>
}

interface NotificationResponse {
  success: boolean
  notificationId?: string
  error?: string
}

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastNotification, setLastNotification] = useState<NotificationResponse | null>(null)

  const sendNotification = useCallback(async (options: SendNotificationOptions): Promise<NotificationResponse> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      })

      const result = await response.json()
      
      if (response.ok) {
        setLastNotification(result)
        return result
      } else {
        const errorResponse: NotificationResponse = {
          success: false,
          error: result.error || 'Failed to send notification'
        }
        setLastNotification(errorResponse)
        return errorResponse
      }
    } catch (error) {
      const errorResponse: NotificationResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
      setLastNotification(errorResponse)
      return errorResponse
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Convenience methods for common notification types
  const sendSecurityAlert = useCallback((
    severity: NotificationSeverity,
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.SECURITY,
      severity,
      title,
      message,
      source,
      tags: [...tags, 'security', 'alert']
    })
  }, [sendNotification])

  const sendPerformanceAlert = useCallback((
    severity: NotificationSeverity,
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.PERFORMANCE,
      severity,
      title,
      message,
      source,
      tags: [...tags, 'performance', 'monitoring']
    })
  }, [sendNotification])

  const sendErrorAlert = useCallback((
    severity: NotificationSeverity,
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.ERROR,
      severity,
      title,
      message,
      source,
      tags: [...tags, 'error', 'alert']
    })
  }, [sendNotification])

  const sendWarning = useCallback((
    severity: NotificationSeverity,
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.WARNING,
      severity,
      title,
      message,
      source,
      tags: [...tags, 'warning']
    })
  }, [sendNotification])

  const sendInfo = useCallback((
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.INFO,
      severity: NotificationSeverity.LOW,
      title,
      message,
      source,
      tags: [...tags, 'info']
    })
  }, [sendNotification])

  const sendSuccess = useCallback((
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.SUCCESS,
      severity: NotificationSeverity.LOW,
      title,
      message,
      source,
      tags: [...tags, 'success']
    })
  }, [sendNotification])

  // Emergency notification with immediate escalation
  const sendEmergencyAlert = useCallback((
    title: string,
    message: string,
    source: string,
    tags: string[] = []
  ) => {
    return sendNotification({
      type: NotificationType.SECURITY,
      severity: NotificationSeverity.CRITICAL,
      title,
      message,
      source,
      tags: [...tags, 'emergency', 'critical', 'immediate'],
      metadata: {
        emergency: true,
        requiresImmediateResponse: true
      }
    })
  }, [sendNotification])

  // Deployment notifications
  const sendDeploymentSuccess = useCallback((
    environment: string,
    version: string,
    source: string
  ) => {
    return sendSuccess(
      'Deployment Successful',
      `Application deployed successfully to ${environment} (v${version})`,
      source,
      ['deployment', 'success', 'ci-cd', environment]
    )
  }, [sendSuccess])

  const sendDeploymentFailure = useCallback((
    environment: string,
    version: string,
    source: string,
    error: string
  ) => {
    return sendErrorAlert(
      NotificationSeverity.HIGH,
      'Deployment Failed',
      `Deployment to ${environment} (v${version}) failed: ${error}`,
      source,
      ['deployment', 'failure', 'ci-cd', environment, 'urgent']
    )
  }, [sendErrorAlert])

  // System health notifications
  const sendSystemHealthAlert = useCallback((
    severity: NotificationSeverity,
    component: string,
    status: string,
    details: string,
    source: string
  ) => {
    return sendNotification({
      type: NotificationType.PERFORMANCE,
      severity,
      title: `System Health Alert: ${component}`,
      message: `${component} status: ${status}. ${details}`,
      source,
      tags: ['system-health', 'monitoring', component, status],
      details: {
        component,
        status,
        details,
        timestamp: new Date().toISOString()
      }
    })
  }, [sendNotification])

  // Security incident notifications
  const sendSecurityIncident = useCallback((
    severity: NotificationSeverity,
    incidentType: string,
    description: string,
    source: string,
    affectedUsers?: number,
    details?: Record<string, any>
  ) => {
    return sendSecurityAlert(
      severity,
      `Security Incident: ${incidentType}`,
      description,
      source,
      ['incident', incidentType, 'security-breach']
    )
  }, [sendSecurityAlert])

  return {
    // State
    isLoading,
    lastNotification,
    
    // Core method
    sendNotification,
    
    // Convenience methods
    sendSecurityAlert,
    sendPerformanceAlert,
    sendErrorAlert,
    sendWarning,
    sendInfo,
    sendSuccess,
    sendEmergencyAlert,
    
    // Specialized methods
    sendDeploymentSuccess,
    sendDeploymentFailure,
    sendSystemHealthAlert,
    sendSecurityIncident,
    
    // Clear last notification
    clearLastNotification: () => setLastNotification(null)
  }
}
