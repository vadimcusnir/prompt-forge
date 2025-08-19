'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function ProfilulMeuContent() {
  const searchParams = useSearchParams()
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      setSubscriptionStatus('success')
    } else if (canceled === 'true') {
      setSubscriptionStatus('canceled')
    }
    
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-[var(--font-heading)] text-foreground mb-4">
            My Profile
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to PROMPTFORGE™ v3.0
          </p>
        </div>

        {/* Success/Cancel Messages */}
        {subscriptionStatus === 'success' && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <CardTitle className="text-green-800">Payment Successful!</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                Thank you for your subscription! You now have access to all PROMPTFORGE™ features.
                Check your email for confirmation details.
              </p>
            </CardContent>
          </Card>
        )}

        {subscriptionStatus === 'canceled' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <CardTitle className="text-yellow-800">Payment Canceled</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                Your payment was canceled. You can try again anytime or contact support if you need help.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Your current plan and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Plan:</span>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Next Billing:</span>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                Manage Billing
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your activity and module usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Modules Used:</span>
                <span className="text-sm text-muted-foreground">0/∞</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Exports:</span>
                <span className="text-sm text-muted-foreground">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">API Calls:</span>
                <span className="text-sm text-muted-foreground">0</span>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with PROMPTFORGE™</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="w-full" variant="outline">
                  Create New Prompt
                </Button>
                <Button className="w-full" variant="outline">
                  Browse Modules
                </Button>
                <Button className="w-full" variant="outline">
                  Export Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilulMeuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfilulMeuContent />
    </Suspense>
  )
}
