import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Settings, Users, Database, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage PromptForge system configuration and user access
          </p>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Entitlements Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Manage feature flags and access controls for organizations and users
            </p>
            <Link href="/admin/entitlements">
              <Button className="w-full flex items-center gap-2">
                Manage Entitlements
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              View and manage user accounts, permissions, and organization memberships
            </p>
            <Link href="/admin/users">
              <Button className="w-full flex items-center gap-2">
                Manage Users
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Database Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Database monitoring, migrations, and maintenance tools
            </p>
            <Link href="/admin/database">
              <Button className="w-full flex items-center gap-2">
                Database Tools
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-gray-600">Canonical Flags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Live</div>
              <div className="text-sm text-gray-600">Stripe Integration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Ready</div>
              <div className="text-sm text-gray-600">Webhook Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
