import { NextRequest, NextResponse } from 'next/server'
import { NotificationManager } from '@/lib/notifications/notification-manager'
import { getEnvironmentConfig } from '@/lib/notifications/notification-config'
import { 
  NotificationType, 
  NotificationSeverity, 
  EscalationLevel 
} from '@/lib/notifications/notification-manager'

// Initialize notification manager
const config = getEnvironmentConfig()
const notificationManager = new NotificationManager(config)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { type, severity, title, message, source, tags = [], details, metadata } = body
    
    if (!type || !severity || !title || !message || !source) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['type', 'severity', 'title', 'message', 'source'],
          received: Object.keys(body)
        },
        { status: 400 }
      )
    }
    
    // Validate enum values
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { 
          error: 'Invalid notification type',
          validTypes: Object.values(NotificationType),
          received: type
        },
        { status: 400 }
      )
    }
    
    if (!Object.values(NotificationSeverity).includes(severity)) {
      return NextResponse.json(
        { 
          error: 'Invalid severity level',
          validSeverities: Object.values(NotificationSeverity),
          received: severity
        },
        { status: 400 }
      )
    }
    
    // Create notification payload
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as NotificationType,
      severity: severity as NotificationSeverity,
      title,
      message,
      details,
      source,
      timestamp: new Date(),
      escalationLevel: EscalationLevel.NONE, // Will be determined by escalation rules
      tags: Array.isArray(tags) ? tags : [],
      metadata
    }
    
    // Send notification
    await notificationManager.sendNotification(notification)
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Notification sent successfully',
        notificationId: notification.id,
        timestamp: notification.timestamp.toISOString()
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Failed to send notification:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get notification statistics
    const stats = await notificationManager.getNotificationStats()
    
    return NextResponse.json(
      { 
        success: true,
        stats,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Failed to get notification stats:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get notification statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
