-- Migration: 0037_notifications_system.sql
-- Description: Create notifications table and related structures for the notification system

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('security', 'performance', 'error', 'warning', 'info', 'success')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    source TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    escalation_level TEXT NOT NULL DEFAULT 'none' CHECK (escalation_level IN ('none', 'team_lead', 'devops', 'security', 'emergency')),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_escalation_level ON notifications(escalation_level);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source);
CREATE INDEX IF NOT EXISTS idx_notifications_tags ON notifications USING GIN(tags);

-- Create notification_escalations table to track escalation history
CREATE TABLE IF NOT EXISTS notification_escalations (
    id SERIAL PRIMARY KEY,
    notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    from_level TEXT NOT NULL,
    to_level TEXT NOT NULL,
    escalated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    escalated_by TEXT,
    reason TEXT,
    response_time_minutes INTEGER,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- Create indexes for escalations
CREATE INDEX IF NOT EXISTS idx_notification_escalations_notification_id ON notification_escalations(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_escalations_to_level ON notification_escalations(to_level);
CREATE INDEX IF NOT EXISTS idx_notification_escalations_escalated_at ON notification_escalations(escalated_at);

-- Create notification_channels table for channel-specific configurations
CREATE TABLE IF NOT EXISTS notification_channels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('slack', 'github', 'email', 'webhook')),
    config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification_templates table for reusable notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('security', 'performance', 'error', 'warning', 'info', 'success')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    default_tags TEXT[] DEFAULT '{}',
    default_metadata JSONB,
    escalation_rules JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification_teams table for escalation team management
CREATE TABLE IF NOT EXISTS notification_teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slack_channel TEXT,
    github_team TEXT,
    escalation_delay_minutes INTEGER NOT NULL DEFAULT 0,
    auto_assign BOOLEAN NOT NULL DEFAULT true,
    members JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default notification teams
INSERT INTO notification_teams (name, slack_channel, github_team, escalation_delay_minutes, auto_assign) VALUES
    ('team_lead', '#team-leads', 'team-leads', 15, true),
    ('devops', '#devops-alerts', 'devops-team', 30, true),
    ('security', '#security-incidents', 'security-team', 5, true),
    ('emergency', '#emergency-response', 'emergency-response', 0, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default notification templates
INSERT INTO notification_templates (name, type, severity, title_template, message_template, default_tags, escalation_rules) VALUES
    ('security_critical', 'security', 'critical', 'Security Incident: {incident_type}', 'A critical security issue has been identified: {description}', ARRAY['security', 'critical', 'incident'], '{"escalation_level": "security", "delay_minutes": 0}'),
    ('performance_degradation', 'performance', 'critical', 'Performance Degradation: {component}', 'System performance has degraded to critical levels: {details}', ARRAY['performance', 'critical', 'monitoring'], '{"escalation_level": "devops", "delay_minutes": 30}'),
    ('deployment_failure', 'error', 'high', 'Deployment Failed: {environment}', 'Deployment to {environment} failed: {error}', ARRAY['deployment', 'failure', 'ci-cd', 'urgent'], '{"escalation_level": "devops", "delay_minutes": 15}'),
    ('system_error', 'error', 'critical', 'Critical System Error: {component}', 'A critical error has occurred in {component}: {details}', ARRAY['error', 'critical', 'system'], '{"escalation_level": "team_lead", "delay_minutes": 15}')
ON CONFLICT (name) DO NOTHING;

-- Create notification_statistics view for easy reporting
CREATE OR REPLACE VIEW notification_statistics AS
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as notifications_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as notifications_7d,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as notifications_30d,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE severity = 'high') as high_count,
    COUNT(*) FILTER (WHERE severity = 'medium') as medium_count,
    COUNT(*) FILTER (WHERE severity = 'low') as low_count,
    COUNT(*) FILTER (WHERE escalation_level != 'none') as escalated_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_response_time_minutes
FROM notifications;

-- Create notification_type_statistics view
CREATE OR REPLACE VIEW notification_type_statistics AS
SELECT 
    type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as count_24h,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE severity = 'high') as high_count,
    COUNT(*) FILTER (WHERE escalation_level != 'none') as escalated_count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- Create notification_escalation_statistics view
CREATE OR REPLACE VIEW notification_escalation_statistics AS
SELECT 
    escalation_level,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as count_24h,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_response_time_minutes
FROM notifications
GROUP BY escalation_level
ORDER BY count DESC;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_channels_updated_at
    BEFORE UPDATE ON notification_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_teams_updated_at
    BEFORE UPDATE ON notification_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- Create function to automatically escalate notifications based on rules
CREATE OR REPLACE FUNCTION auto_escalate_notifications()
RETURNS void AS $$
DECLARE
    notification_record RECORD;
    escalation_rule RECORD;
    escalation_delay INTERVAL;
BEGIN
    -- Find notifications that need escalation
    FOR notification_record IN 
        SELECT * FROM notifications 
        WHERE escalation_level = 'none' 
        AND created_at < NOW() - INTERVAL '1 minute'
    LOOP
        -- Check escalation rules
        FOR escalation_rule IN 
            SELECT * FROM notification_templates 
            WHERE type = notification_record.type 
            AND severity = notification_record.severity
            AND is_active = true
        LOOP
            -- Parse escalation rules from template
            IF escalation_rule.escalation_rules->>'escalation_level' IS NOT NULL THEN
                escalation_delay := (escalation_rule.escalation_rules->>'delay_minutes')::INTEGER * INTERVAL '1 minute';
                
                -- Check if escalation delay has passed
                IF notification_record.created_at + escalation_delay <= NOW() THEN
                    -- Update notification escalation level
                    UPDATE notifications 
                    SET escalation_level = escalation_rule.escalation_rules->>'escalation_level'
                    WHERE id = notification_record.id;
                    
                    -- Log escalation
                    INSERT INTO notification_escalations (
                        notification_id, 
                        from_level, 
                        to_level, 
                        escalated_at, 
                        reason
                    ) VALUES (
                        notification_record.id,
                        'none',
                        escalation_rule.escalation_rules->>'escalation_level',
                        NOW(),
                        'Automatic escalation based on template rules'
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run escalation checks (this would be set up with pg_cron in production)
-- SELECT cron.schedule('check-notification-escalations', '*/5 * * * *', 'SELECT auto_escalate_notifications();');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON notification_statistics TO authenticated;
GRANT SELECT ON notification_type_statistics TO authenticated;
GRANT SELECT ON notification_escalation_statistics TO authenticated;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view notifications" ON notifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert notifications" ON notifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update notifications" ON notifications
    FOR UPDATE TO authenticated USING (true);

-- Similar policies for other tables...
CREATE POLICY "Allow authenticated users to view escalations" ON notification_escalations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view channels" ON notification_channels
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view templates" ON notification_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view teams" ON notification_teams
    FOR SELECT TO authenticated USING (true);
