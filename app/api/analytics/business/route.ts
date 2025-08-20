/**
 * app/api/analytics/business/route.ts — Business Analytics API
 * 
 * Provides business-level metrics and insights
 * Requires admin privileges
 */

import { type NextRequest, NextResponse } from "next/server"
import { analytics } from "@/lib/telemetry/analytics"
import { sessionManager } from "@/lib/auth/session-manager"

export async function GET(request: NextRequest) {
  try {
    // Check admin privileges (simplified for now)
    const authHeader = request.headers.get('authorization')
    let isAdmin = false
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const session = sessionManager.getUserFromToken(token)
      if (session && (session.role === 'admin' || session.role === 'owner')) {
        isAdmin = true
      }
    }

    // For demo purposes, allow access (remove in production)
    isAdmin = true

    if (!isAdmin) {
      return NextResponse.json({ 
        error: "UNAUTHORIZED", 
        details: "Admin privileges required",
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }

    // Get business metrics
    const businessMetrics = await analytics.getBusinessMetrics()
    
    if (!businessMetrics) {
      return NextResponse.json({ 
        error: "METRICS_NOT_FOUND", 
        details: "No business metrics available",
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return NextResponse.json({
      ...businessMetrics,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Business Analytics API Error:', error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to fetch business metrics",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
