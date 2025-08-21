/**
 * app/api/entitlements/route.ts — Entitlements API
 * 
 * GET /api/entitlements - Returns effective entitlement flags for the authenticated user
 * Tries user-specific entitlements first, falls back to org-wide entitlements
 */

import { NextRequest, NextResponse } from 'next/server'
import { getEffectiveEntitlements, getOrganization, updateUserEntitlements } from '@/lib/supabase'
import { sessionManager } from '@/lib/auth/session-manager'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user session from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await sessionManager.validateSession(token)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id
    const orgId = authResult.user.orgId

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // Get effective entitlements
    const entitlements = await getEffectiveEntitlements(userId, orgId)
    
    // Get organization details for additional context
    const organization = await getOrganization(orgId)

    return NextResponse.json({
      success: true,
      data: {
        entitlements,
        organization: {
          id: organization?.id,
          name: organization?.name,
          plan_id: organization?.plan_id,
          status: organization?.status
        },
        user_id: userId,
        org_id: orgId
      }
    })

  } catch (error) {
    console.error('Error in entitlements API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await sessionManager.validateSession(token)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id
    const orgId = authResult.user.orgId

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // Only allow admins to update entitlements
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { entitlements } = body

    if (!entitlements || typeof entitlements !== 'object') {
      return NextResponse.json(
        { error: 'Invalid entitlements data' },
        { status: 400 }
      )
    }

    // Update user entitlements
    await updateUserEntitlements(userId, orgId, entitlements)

    return NextResponse.json({
      success: true,
      message: 'Entitlements updated successfully'
    })

  } catch (error) {
    console.error('Error updating entitlements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
