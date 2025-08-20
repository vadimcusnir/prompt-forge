'use client';

/**
 * components/testing-dashboard.tsx — Testing Dashboard
 * 
 * Provides interface for running tests and viewing results
 * Includes test execution, results display, and quality metrics
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  SkipForward,
  Download,
  BarChart3,
  Shield,
  Zap
} from "lucide-react"

interface TestResult {
  testId: string
  testName: string
  category: string
  status: 'passed' | 'failed' | 'skipped' | 'error'
  duration: number
  timestamp: string
  details: {
    description: string
    expected: any
    actual: any
    error?: string
    performance?: {
      responseTime: number
      memoryUsage: number
      cpuUsage: number
      throughput: number
    }
  }
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  errors: number
  successRate: number
}

interface AvailableTest {
  type: string
  description: string
}

export function TestingDashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>('')
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadTestInfo()
  }, [])

  const loadTestInfo = async () => {
    try {
      const response = await fetch('/api/testing/run-tests')
      if (response.ok) {
        const data = await response.json()
        setAvailableTests(data.availableTests || [])
        setTestResults(data.recentResults || [])
      }
    } catch (error) {
      console.error('Error loading test info:', error)
    }
  }

  const runTests = async (testType: string) => {
    if (isRunning) return

    setIsRunning(true)
    setCurrentTest(testType)

    try {
      const response = await fetch('/api/testing/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType })
      })

      if (response.ok) {
        const data = await response.json()
        setTestResults(data.results || [])
        setSummary(data.summary || null)
        
        // Refresh test info
        await loadTestInfo()
      }
    } catch (error) {
      console.error('Error running tests:', error)
    } finally {
      setIsRunning(false)
      setCurrentTest('')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'skipped': return <SkipForward className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-[#1a1a1a] text-green-800'
      case 'failed': return 'bg-[#1a1a1a] text-red-800'
      case 'skipped': return 'bg-[#1a1a1a] text-yellow-800'
      case 'error': return 'bg-[#1a1a1a] text-orange-800'
      default: return 'bg-[#1a1a1a] text-gray-800'
    }
  }

  const exportResults = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(testResults, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test-results-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      // Simple CSV export
      const csvRows = ['Test Name,Category,Status,Duration,Timestamp,Description']
      testResults.forEach(result => {
        csvRows.push([
          result.testName,
          result.category,
          result.status,
          result.duration.toString(),
          result.timestamp,
          result.details.description
        ].join(','))
      })
      
      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test-results-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Testing & Quality Assurance</h2>
          <p className="text-muted-foreground">
            Run tests, monitor quality, and ensure system reliability
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTestInfo} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button onClick={() => exportResults('json')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
          <button onClick={() => exportResults('csv')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="execution">Test Execution</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quality Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.total || testResults.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time executions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.successRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Tests passed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.failed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Tests failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.errors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Test errors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate Progress */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Overall Quality Score</CardTitle>
                <CardDescription>
                  Test success rate and quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-medium">{summary.successRate}%</span>
                </div>
                <Progress value={summary.successRate} className="w-full" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Passed:</span>
                    <span className="ml-2 font-medium text-green-600">{summary.passed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed:</span>
                    <span className="ml-2 font-medium text-red-600">{summary.failed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="ml-2 font-medium text-orange-600">{summary.errors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="execution" className="space-y-6">
          {/* Test Execution Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Execution</CardTitle>
              <CardDescription>
                Run different types of tests to validate system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {availableTests.map((test) => (
                  <div key={test.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{test.type.toUpperCase()} Tests</h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                    <button onClick={() => runTests(test.type)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
                      {isRunning && currentTest === test.type ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {isRunning && (
                <div className="flex items-center justify-center p-4 bg-[#1a1a1a] rounded-lg">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-blue-600">Running {currentTest} tests...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Test Categories</CardTitle>
              <CardDescription>
                Different types of testing available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">API Testing</h4>
                    <p className="text-sm text-muted-foreground">Endpoint validation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Performance</h4>
                    <p className="text-sm text-muted-foreground">Speed & efficiency</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-medium">Security</h4>
                    <p className="text-sm text-muted-foreground">Vulnerability testing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed results from test executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results available. Run some tests to see results here.
                  </div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={result.testId || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">{result.testName}</p>
                          <p className="text-sm text-muted-foreground">{result.details.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{result.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {testResults.some(r => r.details.performance) && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Response times and performance data from tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults
                    .filter(r => r.details.performance)
                    .map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{result.testName}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="ml-2 font-medium">{result.details.performance?.responseTime}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory Usage:</span>
                            <span className="ml-2 font-medium">{result.details.performance?.memoryUsage}MB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
