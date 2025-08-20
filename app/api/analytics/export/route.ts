/**
 * app/api/analytics/export/route.ts — Analytics Export API
 * 
 * Exports analytics data in various formats
 * Supports JSON and CSV export
 */

import { type NextRequest, NextResponse } from "next/server"
import { analytics } from "@/lib/telemetry/analytics"
import { sessionManager } from "@/lib/auth/session-manager"

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get('authorization')
    let userId = 'default-user'
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const session = sessionManager.getUserFromToken(token)
      if (session) {
        userId = session.id
      }
    }

    // Get export format from query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') as 'json' | 'csv'
    
    if (!format || !['json', 'csv'].includes(format)) {
      return NextResponse.json({ 
        error: "INVALID_FORMAT", 
        details: "Export format must be 'json' or 'csv'",
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Export analytics data
    const exportData = await analytics.exportAnalytics(userId, format)
    
    if (!exportData) {
      return NextResponse.json({ 
        error: "EXPORT_FAILED", 
        details: "Failed to export analytics data",
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Set appropriate headers for download
    const headers = new Headers()
    headers.set('Content-Type', format === 'json' ? 'application/json' : 'text/csv')
    headers.set('Content-Disposition', `attachment; filename="analytics-${Date.now()}.${format}"`)
    headers.set('Cache-Control', 'no-cache')

    return new NextResponse(exportData, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Analytics Export API Error:', error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to export analytics",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
