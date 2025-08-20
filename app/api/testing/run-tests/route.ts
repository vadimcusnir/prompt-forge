/**
 * app/api/testing/run-tests/route.ts — Testing API Endpoint
 * 
 * Provides API access to run various test suites
 * Supports API, performance, and security testing
 */

import { type NextRequest, NextResponse } from "next/server"
import { testFramework } from "@/lib/testing/test-framework"
import { sessionManager } from "@/lib/auth/session-manager"

export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only for testing)
    const authHeader = request.headers.get('authorization')
    let isAuthorized = false
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const session = sessionManager.getUserFromToken(token)
      if (session && (session.role === 'admin' || session.role === 'owner')) {
        isAuthorized = true
      }
    }

    // For demo purposes, allow access (remove in production)
    isAuthorized = true

    if (!isAuthorized) {
      return NextResponse.json({ 
        error: "UNAUTHORIZED", 
        details: "Admin privileges required for testing",
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }

    // Parse request body
    const { testType, options = {} } = await request.json()
    
    if (!testType) {
      return NextResponse.json({ 
        error: "MISSING_TEST_TYPE", 
        details: "testType is required",
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    let results: any[] = []

    // Run appropriate test suite based on type
    switch (testType) {
      case 'api':
        console.log('🚀 Running API tests...')
        results = await testFramework.runAPITests()
        break
        
      case 'performance':
        console.log('🚀 Running performance tests...')
        results = await testFramework.runPerformanceTests()
        break
        
      case 'security':
        console.log('🚀 Running security tests...')
        results = await testFramework.runSecurityTests()
        break
        
      case 'all':
        console.log('🚀 Running all test suites...')
        const [apiResults, perfResults, secResults] = await Promise.all([
          testFramework.runAPITests(),
          testFramework.runPerformanceTests(),
          testFramework.runSecurityTests()
        ])
        results = [...apiResults, ...perfResults, ...secResults]
        break
        
      default:
        return NextResponse.json({ 
          error: "INVALID_TEST_TYPE", 
          details: `Unknown test type: ${testType}. Valid types: api, performance, security, all`,
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }

    // Generate summary
    const total = results.length
    const passed = results.filter(r => r.status === 'passed').length
    const failed = results.filter(r => r.status === 'failed').length
    const errors = results.filter(r => r.status === 'error').length
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0

    return NextResponse.json({
      success: true,
      testType,
      summary: {
        total,
        passed,
        failed,
        errors,
        successRate
      },
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Testing API Error:', error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to run tests",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    let isAuthorized = false
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const session = sessionManager.getUserFromToken(token)
      if (session && (session.role === 'admin' || session.role === 'owner')) {
        isAuthorized = true
      }
    }

    // For demo purposes, allow access
    isAuthorized = true

    if (!isAuthorized) {
      return NextResponse.json({ 
        error: "UNAUTHORIZED", 
        details: "Admin privileges required",
        timestamp: new Date().toISOString()
      }, { status: 403 })
    }

    // Get test results
    const results = testFramework.getTestResults()
    
    // Get available test types
    const availableTests = [
      { type: 'api', description: 'API endpoint testing' },
      { type: 'performance', description: 'Performance and load testing' },
      { type: 'security', description: 'Security and validation testing' },
      { type: 'all', description: 'Run all test suites' }
    ]

    return NextResponse.json({
      success: true,
      availableTests,
      recentResults: results.slice(-10), // Last 10 results
      totalTests: results.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Testing API Error:', error)
    
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      details: "Failed to get test information",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
