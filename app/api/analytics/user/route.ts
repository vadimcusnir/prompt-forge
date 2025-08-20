/**
 * app/api/analytics/user/route.ts — User Analytics API
 * 
 * Provides user-specific analytics data
 * Requires authentication and user context
 */

import { type NextRequest, NextResponse } from "next/server"
import { analytics } from "@/lib/telemetry/analytics"
import { sessionManager } from "@/lib/auth/session-manager"

export async function GET(request: NextRequest) {
  try {
    // Get user from session (simplified for now)
    const authHeader = request.headers.get('authorization')
    let userId = 'default-user' // TODO: Get from auth context
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const session = sessionManager.getUserFromToken(token)
      if (session) {
        userId = session.id
      }
    }

    // Get user analytics
    const userAnalytics = await analytics.getUserAnalytics(userId)
    
    if (!userAnalytics) {
      return NextResponse.json({ 
        error: "ANALYTICS_NOT_FOUND", 
        details: "No analytics data found for user",
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return NextResponse.json({
      ...userAnalytics,
      userId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('User Analytics API Error:', error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to fetch user analytics",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
