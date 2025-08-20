/**
 * components/analytics-dashboard.tsx — Analytics Dashboard
 * 
 * Provides user-facing analytics interface with real-time data
 * Shows performance metrics, usage statistics, and insights
 */

"use client"

import { HomeInteractive } from "@/components/home-interactive";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  Activity,
  Download,
  RefreshCw
} from "lucide-react"

interface AnalyticsData {
  totalRuns: number
  successRate: number
  averageScore: number
  qualityDistribution: {
    excellent: number
    good: number
    acceptable: number
    poor: number
  }
  recentActivity: {
    runs: any[]
    scores: any[]
    bundles: any[]
  }
}

interface BusinessMetrics {
  totalUsers: number
  activeUsers: number
  totalRuns: number
  successRate: number
  averageScore: number
  popularModules: Array<{ moduleId: string; count: number }>
  planDistribution: Record<string, number>
  monthlyGrowth: number
}

export function HomeInteractive() () {
  const [userAnalytics, setUserAnalytics] = useState<AnalyticsData | null>(null)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Load user analytics
      const userResponse = await fetch('/api/analytics/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserAnalytics(userData)
      }

      // Load business metrics (admin only)
      const businessResponse = await fetch('/api/analytics/business')
      if (businessResponse.ok) {
        const businessData = await businessResponse.json()
        setBusinessMetrics(businessData)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`)
      if (response.ok) {
        const data = await response.text()
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${Date.now()}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your performance and track system insights
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAnalytics} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button onClick={() => exportAnalytics('json')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
          <button onClick={() => exportAnalytics('csv')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics?.totalRuns || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time executions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics?.successRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Successful executions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAnalytics?.averageScore || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Quality assessment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessMetrics?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Distribution</CardTitle>
              <CardDescription>
                Breakdown of prompt quality scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Excellent (90-100%)</span>
                <div className="flex items-center gap-2">
                  <Progress value={userAnalytics?.qualityDistribution?.excellent || 0} className="w-24" />
                  <Badge variant="secondary">{userAnalytics?.qualityDistribution?.excellent || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Good (80-89%)</span>
                <div className="flex items-center gap-2">
                  <Progress value={userAnalytics?.qualityDistribution?.good || 0} className="w-24" />
                  <Badge variant="secondary">{userAnalytics?.qualityDistribution?.good || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Acceptable (70-79%)</span>
                <div className="flex items-center gap-2">
                  <Progress value={userAnalytics?.qualityDistribution?.acceptable || 0} className="w-24" />
                  <Badge variant="secondary">{userAnalytics?.qualityDistribution?.acceptable || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Poor (&lt;70%)</span>
                <div className="flex items-center gap-2">
                  <Progress value={userAnalytics?.qualityDistribution?.poor || 0} className="w-24" />
                  <Badge variant="secondary">{userAnalytics?.qualityDistribution?.poor || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                System performance and response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">GPT Response Time</h4>
                  <div className="text-2xl font-bold text-green-600">~2.3s</div>
                  <p className="text-sm text-muted-foreground">Average response time</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Token Usage</h4>
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest runs and evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userAnalytics?.recentActivity?.runs?.slice(0, 5).map((run, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Module {run.moduleId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(run.startTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={run.success ? "default" : "destructive"}>
                      {run.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Popular Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Modules</CardTitle>
              <CardDescription>
                Most frequently used modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessMetrics?.popularModules?.slice(0, 5).map((module, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">Module {module.moduleId}</span>
                    <Badge variant="outline">{module.count} runs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>
                User subscription breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessMetrics?.planDistribution && Object.entries(businessMetrics.planDistribution).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{plan}</span>
                    <Badge variant="secondary">{count} users</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
