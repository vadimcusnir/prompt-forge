# Session Manager Documentation

## Overview

The Session Manager is a production-ready authentication system that provides secure session management with JWT tokens, encryption, and comprehensive logging.

## Features

### 🔐 Security
- **JWT Tokens**: Secure JSON Web Tokens with proper signing and verification
- **Session Encryption**: AES-256-GCM encryption for sensitive session data
- **Refresh Tokens**: Long-lived refresh tokens for seamless user experience
- **Input Validation**: Zod schema validation for all inputs
- **Permission System**: Role-based access control with granular permissions

### 📊 Monitoring
- **Structured Logging**: Categorized error logging with context
- **Session Statistics**: Real-time session metrics and monitoring
- **Activity Tracking**: User activity and session lifecycle monitoring
- **Error Classification**: Categorized error types for better debugging

### 🚀 Performance
- **Singleton Pattern**: Efficient memory usage with single instance
- **Automatic Cleanup**: Scheduled cleanup of expired sessions
- **Memory Management**: Optimized storage with encrypted data

## Environment Variables

```bash
# Required for JWT signing
JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# Required for session encryption
SESSION_ENCRYPTION_KEY=your_session_encryption_key_at_least_32_characters_long
```

## Usage

### Basic Session Management

```typescript
import { sessionManager } from '@/lib/auth/session-manager'

// Create a new session
const result = await sessionManager.createSession(
  userId,      // string: User UUID
  orgId,       // string: Organization UUID
  deviceId,    // optional: Device identifier
  ipAddress    // optional: Client IP address
)

if (result.success) {
  const { token, refreshToken, user } = result
  // Store tokens securely, return to client
}
```

### Session Validation

```typescript
// Validate a session token
const validation = sessionManager.validateSession(token)

if (validation.success) {
  const { user } = validation
  // User is authenticated and session is valid
} else {
  // Handle invalid/expired session
  console.error(validation.error)
}
```

### Session Refresh

```typescript
// Refresh session using refresh token
const refresh = sessionManager.refreshSession(refreshToken)

if (refresh.success) {
  const { token: newToken, refreshToken: newRefreshToken } = refresh
  // Return new tokens to client
}
```

### Permission Checking

```typescript
// Check if user has specific permission
const hasPermission = sessionManager.hasPermission(token, 'read:users')

if (hasPermission) {
  // User can read user data
}
```

### Session Cleanup

```typescript
// Manually trigger cleanup (automatically runs every hour)
sessionManager.cleanupExpiredSessions()

// Get session statistics
const stats = sessionManager.getSessionStats()
console.log(`Active sessions: ${stats.activeSessions}`)
```

## Error Handling

The session manager provides structured error handling with categorized error types:

```typescript
import { SessionErrorType, type SessionError } from '@/lib/auth/session-manager'

// Error types include:
// - VALIDATION_ERROR: Input validation failures
// - AUTHENTICATION_ERROR: User authentication issues
// - AUTHORIZATION_ERROR: Permission/access control issues
// - DATABASE_ERROR: Database operation failures
// - ENCRYPTION_ERROR: Encryption/decryption failures
// - TOKEN_ERROR: JWT token issues
// - SYSTEM_ERROR: General system failures
```

## Custom Logging

You can implement custom logging by implementing the Logger interface:

```typescript
import { Logger, sessionManager } from '@/lib/auth/session-manager'

class CustomLogger implements Logger {
  error(error: SessionError): void {
    // Send to your logging service
    console.error(`[${error.type}] ${error.message}`, error)
  }
  
  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${message}`, context)
  }
  
  info(message: string, context?: any): void {
    console.info(`[INFO] ${message}`, context)
  }
  
  debug(message: string, context?: any): void {
    console.debug(`[DEBUG] ${message}`, context)
  }
}

// Set custom logger
sessionManager.setLogger(new CustomLogger())
```

## Security Considerations

### JWT Security
- Tokens are signed with HS256 algorithm
- Session tokens expire in 24 hours
- Refresh tokens expire in 7 days
- All tokens include proper expiration claims

### Encryption
- Sessions are encrypted using AES-256-GCM
- Each session uses a unique initialization vector (IV)
- Authentication tags ensure data integrity
- Encryption keys must be at least 32 characters

### Input Validation
- All inputs are validated using Zod schemas
- UUID validation for user and organization IDs
- Token format validation
- Permission string validation

## Testing

Run the test script to verify functionality:

```bash
node scripts/test-session-manager.js
```

## Migration from Previous Version

If upgrading from the previous session manager:

1. **Install Dependencies**: Add `jsonwebtoken` and `zod` packages
2. **Environment Variables**: Set `JWT_SECRET` and `SESSION_ENCRYPTION_KEY`
3. **Update Imports**: Change import paths if necessary
4. **Test Thoroughly**: Verify all session operations work correctly

## Production Deployment

### Recommended Improvements
1. **Redis Storage**: Replace in-memory storage with Redis for scalability
2. **External Logging**: Integrate with services like DataDog, LogRocket, or ELK stack
3. **Rate Limiting**: Add rate limiting for session creation and refresh
4. **Monitoring**: Add metrics collection and alerting
5. **Backup**: Implement session backup and recovery mechanisms

### Security Checklist
- [ ] JWT_SECRET is at least 32 characters and randomly generated
- [ ] SESSION_ENCRYPTION_KEY is at least 32 characters and randomly generated
- [ ] Environment variables are not committed to version control
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is implemented
- [ ] Logging is configured for security monitoring

## API Reference

### SessionManager Class

#### Methods

- `createSession(userId, orgId, deviceId?, ipAddress?)`: Create new session
- `validateSession(token)`: Validate session token
- `refreshSession(refreshToken)`: Refresh session with new tokens
- `destroySession(token)`: Destroy session and cleanup
- `getUserFromToken(token)`: Get user from valid token
- `hasPermission(token, permission)`: Check user permission
- `cleanupExpiredSessions()`: Clean up expired sessions
- `getSessionStats()`: Get session statistics
- `setLogger(logger)`: Set custom logger
- `getActiveSessions()`: Get all active sessions

#### Properties

- `instance`: Singleton instance (readonly)
- `sessions`: Map of active sessions (private)
- `refreshTokens`: Map of refresh tokens (private)
- `logger`: Logger instance (private)
- `lastCleanup`: Last cleanup timestamp (private)

## Troubleshooting

### Common Issues

1. **JWT_SECRET too short**: Ensure secret is at least 32 characters
2. **Encryption key issues**: Verify SESSION_ENCRYPTION_KEY length
3. **Token validation failures**: Check JWT signature and expiration
4. **Session not found**: Verify session storage and cleanup processes

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Set debug logger
sessionManager.setLogger({
  ...console,
  debug: console.log
})
```

## Support

For issues or questions about the session manager:

1. Check the error logs for specific error types
2. Verify environment variables are set correctly
3. Test with the provided test script
4. Review security considerations and deployment checklist
