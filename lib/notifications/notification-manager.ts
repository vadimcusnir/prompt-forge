import { createClient } from '@supabase/supabase-js'

// Notification types and severity levels
export enum NotificationType {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success'
}

export enum NotificationSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum EscalationLevel {
  NONE = 'none',
  TEAM_LEAD = 'team_lead',
  DEVOPS = 'devops',
  SECURITY = 'security',
  EMERGENCY = 'emergency'
}

// Notification payload interface
export interface NotificationPayload {
  id: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  details?: Record<string, any>
  source: string
  timestamp: Date
  escalationLevel: EscalationLevel
  tags: string[]
  metadata?: Record<string, any>
}

// Slack notification interface
export interface SlackNotification {
  channel: string
  text: string
  blocks?: any[]
  attachments?: any[]
  thread_ts?: string
}

// Telegram notification interface
export interface TelegramNotification {
  chat_id: string
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
  disable_notification?: boolean
  reply_to_message_id?: number
}

// GitHub Issue interface
export interface GitHubIssue {
  title: string
  body: string
  labels: string[]
  assignees?: string[]
  milestone?: number
}

// Escalation team configuration
export interface EscalationTeam {
  name: string
  slackChannel: string
  telegramChatId: string
  githubTeam: string
  escalationDelay: number // minutes
  autoAssign: boolean
}

// Configuration for different notification types
export interface NotificationConfig {
  slack: {
    webhookUrl: string
    defaultChannel: string
    channels: Record<NotificationType, string>
  }
  telegram: {
    botToken: string
    enabled: boolean
    defaultChatId: string
    channels: Record<NotificationType, string>
    teamChatIds: Record<EscalationLevel, string>
  }
  github: {
    token: string
    owner: string
    repo: string
    labels: Record<NotificationType, string[]>
    assignees: Record<EscalationLevel, string[]>
  }
  escalation: {
    teams: EscalationTeam[]
    rules: EscalationRule[]
  }
}

// Escalation rules
export interface EscalationRule {
  condition: (notification: NotificationPayload) => boolean
  escalationLevel: EscalationLevel
  delay: number // minutes
  autoAssign: boolean
}

export class NotificationManager {
  private config: NotificationConfig
  private supabase: any
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: NotificationConfig) {
    this.config = config
    this.initializeSupabase()
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  /**
   * Send a notification through all configured channels
   */
  async sendNotification(notification: NotificationPayload): Promise<void> {
    try {
      // Store notification in database
      await this.storeNotification(notification)
      
      // Send to Slack
      await this.sendSlackNotification(notification)
      
      // Send to Telegram
      if (this.config.telegram.enabled) {
        await this.sendTelegramNotification(notification)
      }
      
      // Create GitHub Issue if needed
      if (this.shouldCreateGitHubIssue(notification)) {
        await this.createGitHubIssue(notification)
      }
      
      // Handle escalation
      await this.handleEscalation(notification)
      
      console.log(`Notification sent: ${notification.title}`)
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  /**
   * Store notification in database for tracking
   */
  private async storeNotification(notification: NotificationPayload): Promise<void> {
    if (!this.supabase) return

    try {
      await this.supabase
        .from('notifications')
        .insert({
          id: notification.id,
          type: notification.type,
          severity: notification.severity,
          title: notification.title,
          message: notification.message,
          details: notification.details,
          source: notification.source,
          timestamp: notification.timestamp.toISOString(),
          escalation_level: notification.escalationLevel,
          tags: notification.tags,
          metadata: notification.metadata
        })
    } catch (error) {
      console.error('Failed to store notification:', error)
    }
  }

  /**
   * Send notification to Slack
   */
  private async sendSlackNotification(notification: NotificationPayload): Promise<void> {
    const slackNotification = this.formatSlackNotification(notification)
    
    try {
      const response = await fetch(this.config.slack.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackNotification),
      })

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
      throw error
    }
  }

  /**
   * Send notification to Telegram
   */
  private async sendTelegramNotification(notification: NotificationPayload): Promise<void> {
    const telegramNotification = this.formatTelegramNotification(notification)
    
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramNotification),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Telegram API error: ${response.status} - ${errorData.description}`)
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      throw error
    }
  }

  /**
   * Format notification for Slack
   */
  private formatSlackNotification(notification: NotificationPayload): SlackNotification {
    const channel = this.config.slack.channels[notification.type] || this.config.slack.defaultChannel
    
    const color = this.getSeverityColor(notification.severity)
    const emoji = this.getTypeEmoji(notification.type)
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${notification.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: notification.message
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Severity:* ${notification.severity.toUpperCase()} | *Source:* ${notification.source}`
          }
        ]
      }
    ]

    // Add details if available
    if (notification.details) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n\`\`\`${JSON.stringify(notification.details, null, 2)}\`\`\``
        }
      })
    }

    // Add escalation info
    if (notification.escalationLevel !== EscalationLevel.NONE) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Escalation:* ${notification.escalationLevel.toUpperCase()}`
        }
      })
    }

    // Add tags
    if (notification.tags.length > 0) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Tags:* ${notification.tags.map(tag => `\`${tag}\``).join(' ')}`
          }
        ]
      })
    }

    return {
      channel,
      text: `${emoji} ${notification.title}: ${notification.message}`,
      blocks
    }
  }

  /**
   * Format notification for Telegram
   */
  private formatTelegramNotification(notification: NotificationPayload): TelegramNotification {
    const chatId = this.config.telegram.channels[notification.type] || this.config.telegram.defaultChatId
    const emoji = this.getTypeEmoji(notification.type)
    
    let text = `<b>${emoji} ${notification.title}</b>\n\n`
    text += `${notification.message}\n\n`
    text += `<b>Severity:</b> ${notification.severity.toUpperCase()}\n`
    text += `<b>Source:</b> ${notification.source}\n`
    
    // Add escalation info
    if (notification.escalationLevel !== EscalationLevel.NONE) {
      text += `<b>Escalation:</b> ${notification.escalationLevel.toUpperCase()}\n`
    }
    
    // Add tags
    if (notification.tags.length > 0) {
      text += `<b>Tags:</b> ${notification.tags.map(tag => `#${tag}`).join(' ')}\n`
    }
    
    // Add details if available
    if (notification.details) {
      text += `\n<b>Details:</b>\n<code>${JSON.stringify(notification.details, null, 2)}</code>`
    }

    return {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }
  }

  /**
   * Create GitHub Issue for critical notifications
   */
  private async createGitHubIssue(notification: NotificationPayload): Promise<void> {
    if (!this.config.github.token) return

    const issue: GitHubIssue = {
      title: `[${notification.severity.toUpperCase()}] ${notification.title}`,
      body: this.formatGitHubIssueBody(notification),
      labels: this.config.github.labels[notification.type] || [],
      assignees: this.config.github.assignees[notification.escalationLevel] || []
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.github.owner}/${this.config.github.repo}/issues`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.config.github.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issue),
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const issueData = await response.json()
      console.log(`GitHub issue created: ${issueData.html_url}`)
    } catch (error) {
      console.error('Failed to create GitHub issue:', error)
    }
  }

  /**
   * Format notification body for GitHub Issue
   */
  private formatGitHubIssueBody(notification: NotificationPayload): string {
    let body = `## ${notification.title}\n\n`
    body += `${notification.message}\n\n`
    
    if (notification.details) {
      body += `## Details\n\`\`\`json\n${JSON.stringify(notification.details, null, 2)}\n\`\`\`\n\n`
    }
    
    body += `## Metadata\n`
    body += `- **Type:** ${notification.type}\n`
    body += `- **Severity:** ${notification.severity}\n`
    body += `- **Source:** ${notification.source}\n`
    body += `- **Timestamp:** ${notification.timestamp.toISOString()}\n`
    body += `- **Escalation Level:** ${notification.escalationLevel}\n`
    
    if (notification.tags.length > 0) {
      body += `- **Tags:** ${notification.tags.join(', ')}\n`
    }
    
    if (notification.metadata) {
      body += `\n## Additional Metadata\n\`\`\`json\n${JSON.stringify(notification.metadata, null, 2)}\n\`\`\``
    }
    
    return body
  }

  /**
   * Handle escalation based on rules
   */
  private async handleEscalation(notification: NotificationPayload): Promise<void> {
    const escalationRule = this.findEscalationRule(notification)
    
    if (escalationRule && escalationRule.escalationLevel !== EscalationLevel.NONE) {
      // Set escalation timer
      const timer = setTimeout(async () => {
        await this.escalateNotification(notification, escalationRule.escalationLevel)
      }, escalationRule.delay * 60 * 1000)
      
      this.escalationTimers.set(notification.id, timer)
    }
  }

  /**
   * Find applicable escalation rule
   */
  private findEscalationRule(notification: NotificationPayload): EscalationRule | null {
    return this.config.escalation.rules.find(rule => rule.condition(notification)) || null
  }

  /**
   * Escalate notification to appropriate team
   */
  private async escalateNotification(notification: NotificationPayload, escalationLevel: EscalationLevel): Promise<void> {
    const team = this.config.escalation.teams.find(t => t.name === escalationLevel)
    
    if (!team) return

    const escalationNotification: NotificationPayload = {
      ...notification,
      id: `${notification.id}-escalated`,
      title: `ESCALATED: ${notification.title}`,
      message: `Notification escalated to ${team.name} team`,
      escalationLevel,
      tags: [...notification.tags, 'escalated', team.name],
      metadata: {
        ...notification.metadata,
        escalatedFrom: notification.id,
        escalationTeam: team.name,
        escalationTime: new Date().toISOString()
      }
    }

    // Send escalation notification to Slack
    await this.sendSlackNotification(escalationNotification)
    
    // Send escalation notification to Telegram
    if (this.config.telegram.enabled) {
      const telegramChatId = this.config.telegram.teamChatIds[escalationLevel]
      if (telegramChatId) {
        const telegramNotification = this.formatTelegramNotification(escalationNotification)
        telegramNotification.chat_id = telegramChatId
        
        try {
          await fetch(
            `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(telegramNotification),
            }
          )
        } catch (error) {
          console.error('Failed to send Telegram escalation notification:', error)
        }
      }
    }
    
    // Create GitHub issue for escalation
    if (this.shouldCreateGitHubIssue(escalationNotification)) {
      await this.createGitHubIssue(escalationNotification)
    }
  }

  /**
   * Determine if GitHub issue should be created
   */
  private shouldCreateGitHubIssue(notification: NotificationPayload): boolean {
    return notification.severity === NotificationSeverity.CRITICAL || 
           notification.severity === NotificationSeverity.HIGH ||
           notification.escalationLevel !== EscalationLevel.NONE
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: NotificationSeverity): string {
    switch (severity) {
      case NotificationSeverity.CRITICAL: return '#ff0000'
      case NotificationSeverity.HIGH: return '#ff6600'
      case NotificationSeverity.MEDIUM: return '#ffcc00'
      case NotificationSeverity.LOW: return '#00cc00'
      default: return '#cccccc'
    }
  }

  /**
   * Get type emoji for Slack and Telegram
   */
  private getTypeEmoji(type: NotificationType): string {
    switch (type) {
      case NotificationType.SECURITY: return '🔒'
      case NotificationType.PERFORMANCE: return '⚡'
      case NotificationType.ERROR: return '❌'
      case NotificationType.WARNING: return '⚠️'
      case NotificationType.INFO: return 'ℹ️'
      case NotificationType.SUCCESS: return '✅'
      default: return '📢'
    }
  }

  /**
   * Cancel escalation timer
   */
  cancelEscalation(notificationId: string): void {
    const timer = this.escalationTimers.get(notificationId)
    if (timer) {
      clearTimeout(timer)
      this.escalationTimers.delete(notificationId)
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<Record<string, any>> {
    if (!this.supabase) return {}

    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('type, severity, escalation_level, created_at')

      if (error) throw error

      const stats = {
        total: data.length,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byEscalation: {} as Record<string, number>,
        recent: data.filter((n: any) => {
          const createdAt = new Date(n.created_at)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return createdAt > oneDayAgo
        }).length
      }

      // Calculate statistics
      data.forEach((notification: any) => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
        stats.bySeverity[notification.severity] = (stats.bySeverity[notification.severity] || 0) + 1
        stats.byEscalation[notification.escalation_level] = (stats.byEscalation[notification.escalation_level] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Failed to get notification stats:', error)
      return {}
    }
  }

  /**
   * Test Telegram connection
   */
  async testTelegramConnection(): Promise<boolean> {
    if (!this.config.telegram.enabled || !this.config.telegram.botToken) {
      return false
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.telegram.botToken}/getMe`
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log(`Telegram bot connected: ${data.result.username}`)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to test Telegram connection:', error)
      return false
    }
  }

  /**
   * Send test message to Telegram
   */
  async sendTelegramTestMessage(chatId: string, message: string): Promise<boolean> {
    if (!this.config.telegram.enabled || !this.config.telegram.botToken) {
      return false
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.config.telegram.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          }),
        }
      )
      
      return response.ok
    } catch (error) {
      console.error('Failed to send Telegram test message:', error)
      return false
    }
  }
}
