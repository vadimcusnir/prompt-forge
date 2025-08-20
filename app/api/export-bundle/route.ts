/**
 * app/api/export-bundle/route.ts — Export Bundle API
 * 
 * Handles export bundle generation with plan-based gating
 * Free = txt, Creator = txt+md, Pro = +pdf/json, Enterprise = all+zip+API
 */

import { NextRequest, NextResponse } from 'next/server'
import { ExportBundleManager } from '@/lib/export-bundle'
import { getAvailableExportFormats, PLANS } from '@/lib/entitlements/types'
import type { GeneratedPrompt } from '@/types/promptforge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, testResults = [], editResults = [], userPlan = 'free', format = 'txt' } = body

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      )
    }

    // Validate user plan
    if (!PLANS[userPlan]) {
      return NextResponse.json(
        { error: `Invalid plan: ${userPlan}` },
        { status: 400 }
      )
    }

    // Check if requested format is allowed for user plan
    const availableFormats = getAvailableExportFormats(userPlan)
    if (!availableFormats.includes(format)) {
      const requiredPlan = getMinPlanForFeature(format)
      const requiredPlanInfo = PLANS[requiredPlan]
      
      return NextResponse.json(
        { 
          error: `Format '${format}' not available for plan '${userPlan}'`,
          requiredPlan: requiredPlanInfo?.label || requiredPlan,
          upgradeMessage: `Upgrade to ${requiredPlanInfo?.label || requiredPlan} plan to unlock ${format} export`
        },
        { status: 403 }
      )
    }

    // Generate export bundle
    const bundle = await ExportBundleManager.generateBundle({
      prompt,
      testResults,
      editResults,
      userPlan,
      includeTelemetry: true,
      includeChecksum: true,
      includeManifest: true
    })

    // Return appropriate response based on format
    if (format === 'bundle' && bundle.zipBuffer) {
      // Return ZIP bundle for Enterprise users
      return new NextResponse(bundle.zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="promptforge-bundle-${prompt.moduleId}-${Date.now()}.zip"`,
          'X-Bundle-Checksum': bundle.checksum,
          'X-Artifact-Count': bundle.artifacts.length.toString()
        }
      })
    } else {
      // Return single artifact
      const artifact = bundle.artifacts.find(a => a.filename.includes(format))
      if (!artifact) {
        return NextResponse.json(
          { error: `Format '${format}' not found in bundle` },
          { status: 404 }
        )
      }

      return new NextResponse(artifact.content, {
        headers: {
          'Content-Type': artifact.mimeType,
          'Content-Disposition': `attachment; filename="${artifact.filename}"`,
          'X-Bundle-Checksum': bundle.checksum,
          'X-Artifact-Count': bundle.artifacts.length.toString(),
          'X-Format': format
        }
      })
    }

  } catch (error) {
    console.error('Export bundle API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Export bundle generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userPlan = searchParams.get('plan') || 'free'

    // Return available formats for the user plan
    const availableFormats = getAvailableExportFormats(userPlan)
    const planInfo = PLANS[userPlan]

    return NextResponse.json({
      userPlan,
      planInfo: planInfo ? {
        label: planInfo.label,
        exports_allowed: planInfo.exports_allowed,
        features: planInfo.features
      } : null,
      availableFormats,
      supportedFormats: ['txt', 'md', 'json', 'pdf', 'bundle'],
      planRestrictions: {
        free: ['txt'],
        creator: ['txt', 'md'],
        pro: ['txt', 'md', 'json', 'pdf'],
        enterprise: ['txt', 'md', 'json', 'pdf', 'bundle']
      }
    })

  } catch (error) {
    console.error('Export bundle info API error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get export bundle information' },
      { status: 500 }
    )
  }
}

// Helper function to get minimum plan required for a feature
function getMinPlanForFeature(feature: string): string {
  const featureGates = {
    'txt': 'free',
    'md': 'creator',
    'json': 'pro',
    'pdf': 'pro',
    'bundle': 'enterprise'
  }
  return featureGates[feature as keyof typeof featureGates] || 'free'
}
