import { 
  NotificationConfig, 
  EscalationTeam, 
  EscalationRule,
  NotificationType,
  NotificationSeverity,
  EscalationLevel 
} from './notification-manager'

// Escalation teams configuration
export const escalationTeams: EscalationTeam[] = [
  {
    name: 'team_lead',
    slackChannel: '#team-leads',
    telegramChatId: process.env.TELEGRAM_TEAM_LEAD_CHAT_ID || '',
    githubTeam: 'team-leads',
    escalationDelay: 15, // 15 minutes
    autoAssign: true
  },
  {
    name: 'devops',
    slackChannel: '#devops-alerts',
    telegramChatId: process.env.TELEGRAM_DEVOPS_CHAT_ID || '',
    githubTeam: 'devops-team',
    escalationDelay: 30, // 30 minutes
    autoAssign: true
  },
  {
    name: 'security',
    slackChannel: '#security-incidents',
    telegramChatId: process.env.TELEGRAM_SECURITY_CHAT_ID || '',
    githubTeam: 'security-team',
    escalationDelay: 5, // 5 minutes for security
    autoAssign: true
  },
  {
    name: 'emergency',
    slackChannel: '#emergency-response',
    telegramChatId: process.env.TELEGRAM_EMERGENCY_CHAT_ID || '',
    githubTeam: 'emergency-response',
    escalationDelay: 0, // Immediate
    autoAssign: true
  }
]

// Escalation rules
export const escalationRules: EscalationRule[] = [
  // Security incidents - immediate escalation
  {
    condition: (notification) => 
      notification.type === NotificationType.SECURITY && 
      notification.severity === NotificationSeverity.CRITICAL,
    escalationLevel: EscalationLevel.SECURITY,
    delay: 0,
    autoAssign: true
  },
  
  // Performance issues - escalate to DevOps after 30 minutes
  {
    condition: (notification) => 
      notification.type === NotificationType.PERFORMANCE && 
      notification.severity === NotificationSeverity.HIGH,
    escalationLevel: EscalationLevel.DEVOPS,
    delay: 30,
    autoAssign: true
  },
  
  // Critical errors - escalate to team lead after 15 minutes
  {
    condition: (notification) => 
      notification.type === NotificationType.ERROR && 
      notification.severity === NotificationSeverity.CRITICAL,
    escalationLevel: EscalationLevel.TEAM_LEAD,
    delay: 15,
    autoAssign: true
  },
  
  // High severity warnings - escalate to team lead after 1 hour
  {
    condition: (notification) => 
      notification.type === NotificationType.WARNING && 
      notification.severity === NotificationSeverity.HIGH,
    escalationLevel: EscalationLevel.TEAM_LEAD,
    delay: 60,
    autoAssign: true
  },
  
  // Emergency conditions - immediate escalation
  {
    condition: (notification) => 
      notification.severity === NotificationSeverity.CRITICAL && 
      notification.tags.includes('emergency'),
    escalationLevel: EscalationLevel.EMERGENCY,
    delay: 0,
    autoAssign: true
  }
]

// Main notification configuration
export const notificationConfig: NotificationConfig = {
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    defaultChannel: '#general',
    channels: {
      [NotificationType.SECURITY]: '#security-alerts',
      [NotificationType.PERFORMANCE]: '#performance-monitoring',
      [NotificationType.ERROR]: '#error-tracking',
      [NotificationType.WARNING]: '#warnings',
      [NotificationType.INFO]: '#info',
      [NotificationType.SUCCESS]: '#success'
    }
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    enabled: process.env.TELEGRAM_ENABLED === 'true',
    defaultChatId: process.env.TELEGRAM_CHAT_ID || '',
    channels: {
      [NotificationType.SECURITY]: process.env.TELEGRAM_CHANNELS_SECURITY || process.env.TELEGRAM_CHAT_ID || '',
      [NotificationType.PERFORMANCE]: process.env.TELEGRAM_CHANNELS_PERFORMANCE || process.env.TELEGRAM_CHAT_ID || '',
      [NotificationType.ERROR]: process.env.TELEGRAM_CHANNELS_ERROR || process.env.TELEGRAM_CHAT_ID || '',
      [NotificationType.WARNING]: process.env.TELEGRAM_CHANNELS_WARNING || process.env.TELEGRAM_CHAT_ID || '',
      [NotificationType.INFO]: process.env.TELEGRAM_CHANNELS_INFO || process.env.TELEGRAM_CHAT_ID || '',
      [NotificationType.SUCCESS]: process.env.TELEGRAM_CHANNELS_SUCCESS || process.env.TELEGRAM_CHAT_ID || ''
    },
    teamChatIds: {
      [EscalationLevel.NONE]: '',
      [EscalationLevel.TEAM_LEAD]: process.env.TELEGRAM_TEAM_LEAD_CHAT_ID || '',
      [EscalationLevel.DEVOPS]: process.env.TELEGRAM_DEVOPS_CHAT_ID || '',
      [EscalationLevel.SECURITY]: process.env.TELEGRAM_SECURITY_CHAT_ID || '',
      [EscalationLevel.EMERGENCY]: process.env.TELEGRAM_EMERGENCY_CHAT_ID || ''
    }
  },
  
  github: {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || 'your-org',
    repo: process.env.GITHUB_REPO || 'promptforge',
    labels: {
      [NotificationType.SECURITY]: ['security', 'incident', 'urgent'],
      [NotificationType.PERFORMANCE]: ['performance', 'monitoring'],
      [NotificationType.ERROR]: ['bug', 'error', 'urgent'],
      [NotificationType.WARNING]: ['warning', 'monitoring'],
      [NotificationType.INFO]: ['info', 'documentation'],
      [NotificationType.SUCCESS]: ['success', 'deployment']
    },
    assignees: {
      [EscalationLevel.NONE]: [],
      [EscalationLevel.TEAM_LEAD]: ['team-lead-1', 'team-lead-2'],
      [EscalationLevel.DEVOPS]: ['devops-1', 'devops-2'],
      [EscalationLevel.SECURITY]: ['security-1', 'security-2'],
      [EscalationLevel.EMERGENCY]: ['emergency-1', 'emergency-2', 'oncall']
    }
  },
  
  escalation: {
    teams: escalationTeams,
    rules: escalationRules
  }
}

// Environment-specific overrides
export const getEnvironmentConfig = (): NotificationConfig => {
  const env = process.env.NODE_ENV || 'development'
  
  if (env === 'development') {
    return {
      ...notificationConfig,
      slack: {
        ...notificationConfig.slack,
        defaultChannel: '#dev-testing',
        channels: {
          ...notificationConfig.slack.channels,
          [NotificationType.SECURITY]: '#dev-security',
          [NotificationType.ERROR]: '#dev-errors'
        }
      },
      telegram: {
        ...notificationConfig.telegram,
        defaultChatId: process.env.TELEGRAM_TEST_CHAT_ID || notificationConfig.telegram.defaultChatId,
        channels: {
          ...notificationConfig.telegram.channels,
          [NotificationType.SECURITY]: process.env.TELEGRAM_TEST_CHAT_ID || notificationConfig.telegram.channels[NotificationType.SECURITY],
          [NotificationType.ERROR]: process.env.TELEGRAM_TEST_CHAT_ID || notificationConfig.telegram.channels[NotificationType.ERROR]
        }
      }
    }
  }
  
  if (env !== 'production') {
    return {
      ...notificationConfig,
      slack: {
        ...notificationConfig.slack,
        defaultChannel: '#staging-alerts',
        channels: {
          ...notificationConfig.slack.channels,
          [NotificationType.SECURITY]: '#staging-security',
          [NotificationType.PERFORMANCE]: '#staging-performance'
        }
      }
    }
  }
  
  return notificationConfig
}

// Channel-specific configurations
export const getChannelConfig = (channel: string) => {
  const config = getEnvironmentConfig()
  
  switch (channel) {
    case '#security-alerts':
      return {
        mentionUsers: ['@security-team', '@oncall'],
        autoThread: true,
        priority: 'high'
      }
    
    case '#performance-monitoring':
      return {
        mentionUsers: ['@devops-team'],
        autoThread: false,
        priority: 'medium'
      }
    
    case '#error-tracking':
      return {
        mentionUsers: ['@engineering-team'],
        autoThread: true,
        priority: 'high'
      }
    
    case '#emergency-response':
      return {
        mentionUsers: ['@emergency-response', '@oncall', '@management'],
        autoThread: true,
        priority: 'critical',
        alertSound: true
      }
    
    default:
      return {
        mentionUsers: [],
        autoThread: false,
        priority: 'normal'
      }
  }
}

// Telegram channel configurations
export const getTelegramChannelConfig = (chatId: string) => {
  const config = getEnvironmentConfig()
  
  switch (chatId) {
    case config.telegram.channels[NotificationType.SECURITY]:
      return {
        mentionUsers: ['@security_team', '@oncall'],
        priority: 'high',
        disableNotification: false
      }
    
    case config.telegram.channels[NotificationType.PERFORMANCE]:
      return {
        mentionUsers: ['@devops_team'],
        priority: 'medium',
        disableNotification: false
      }
    
    case config.telegram.channels[NotificationType.ERROR]:
      return {
        mentionUsers: ['@engineering_team'],
        priority: 'high',
        disableNotification: false
      }
    
    case config.telegram.teamChatIds[EscalationLevel.EMERGENCY]:
      return {
        mentionUsers: ['@emergency_response', '@oncall', '@management'],
        priority: 'critical',
        disableNotification: false
      }
    
    default:
      return {
        mentionUsers: [],
        priority: 'normal',
        disableNotification: false
      }
  }
}

// Notification templates for common scenarios
export const notificationTemplates = {
  security: {
    critical: {
      title: 'Security Incident Detected',
      message: 'A critical security issue has been identified that requires immediate attention.',
      tags: ['security', 'critical', 'incident'],
      escalationLevel: EscalationLevel.SECURITY
    },
    high: {
      title: 'Security Warning',
      message: 'A high-priority security concern has been detected.',
      tags: ['security', 'high', 'warning'],
      escalationLevel: EscalationLevel.TEAM_LEAD
    }
  },
  
  performance: {
    critical: {
      title: 'Performance Degradation',
      message: 'System performance has degraded to critical levels.',
      tags: ['performance', 'critical', 'monitoring'],
      escalationLevel: EscalationLevel.DEVOPS
    },
    high: {
      title: 'Performance Warning',
      message: 'Performance metrics indicate potential issues.',
      tags: ['performance', 'high', 'monitoring'],
      escalationLevel: EscalationLevel.TEAM_LEAD
    }
  },
  
  error: {
    critical: {
      title: 'Critical System Error',
      message: 'A critical error has occurred that may affect system stability.',
      tags: ['error', 'critical', 'system'],
      escalationLevel: EscalationLevel.TEAM_LEAD
    },
    high: {
      title: 'High Priority Error',
      message: 'A high-priority error has been detected.',
      tags: ['error', 'high', 'priority'],
      escalationLevel: EscalationLevel.NONE
    }
  },
  
  deployment: {
    success: {
      title: 'Deployment Successful',
      message: 'Application deployment completed successfully.',
      tags: ['deployment', 'success', 'ci-cd'],
      escalationLevel: EscalationLevel.NONE
    },
    failure: {
      title: 'Deployment Failed',
      message: 'Application deployment has failed and requires investigation.',
      tags: ['deployment', 'failure', 'ci-cd', 'urgent'],
      escalationLevel: EscalationLevel.DEVOPS
    }
  }
}
