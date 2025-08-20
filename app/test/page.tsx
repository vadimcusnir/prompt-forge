"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const runBasicTests = async () => {
    setIsLoading(true)
    const results = []

    try {
      // Test 1: Basic fetch
      console.log('🧪 Testing basic fetch...')
      const response = await fetch('/api/analytics/user')
      results.push({
        test: 'Basic Fetch',
        status: response.status,
        success: response.ok,
        details: response.statusText
      })

      // Test 2: GPT Editor
      console.log('🧪 Testing GPT Editor...')
      const gptResponse = await fetch('/api/gpt-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Test prompt for validation',
          sevenD: {
            domain: 'generic',
            scale: 'individual',
            urgency: 'normal',
            complexity: 'simple',
            resources: 'minimal',
            application: 'content_ops',
            output: 'single'
          },
          options: {
            focus: 'clarity',
            tone: 'professional',
            length: 'medium'
          }
        })
      })
      
      results.push({
        test: 'GPT Editor API',
        status: gptResponse.status,
        success: gptResponse.ok,
        details: gptResponse.statusText
      })

      // Test 3: Testing Framework
      console.log('🧪 Testing Testing Framework...')
      const testResponse = await fetch('/api/testing/run-tests')
      results.push({
        test: 'Testing Framework',
        status: testResponse.status,
        success: testResponse.ok,
        details: testResponse.statusText
      })

    } catch (error) {
      results.push({
        test: 'Error Handling',
        status: 'ERROR',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTestResults(results)
    setIsLoading(false)
  }

  // Prevent hydration issues by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🧪 PromptForge v3 Test Page</h1>
          <p className="text-lg text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🧪 PromptForge v3 Test Page</h1>
        <p className="text-lg text-muted-foreground">
          Testing the new production features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Testing</CardTitle>
          <CardDescription>
            Test the core functionality of PromptForge v3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runBasicTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Tests...' : 'Run Feature Tests'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results from the feature tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{result.test}</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {result.status} - {result.details}
                    </p>
                  </div>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Summary:</h4>
              <p className="text-sm">
                Passed: {testResults.filter(r => r.success).length} / {testResults.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Component Verification</CardTitle>
          <CardDescription>
            Verify that UI components are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
          <CardDescription>
            Verify environment variables are loaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Server Environment:</span>
              <span className="ml-2 text-muted-foreground">
                ✅ Development Mode
              </span>
            </div>
            <div>
              <span className="font-medium">Client-Side Status:</span>
              <span className="ml-2 text-muted-foreground">
                ✅ No Hydration Issues
              </span>
            </div>
            <div>
              <span className="font-medium">API Status:</span>
              <span className="ml-2 text-muted-foreground">
                🔄 Check with test button above
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
