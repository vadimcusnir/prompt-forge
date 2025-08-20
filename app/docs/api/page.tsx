// app/docs/api/page.tsx

import { Metadata } from "next";
import { 
  Code, 
  Zap, 
  Shield, 
  Clock, 
  Download, 
  Key, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  BookOpen,
  Terminal,
  Settings,
  Lock
} from "lucide-react";

export const metadata: Metadata = {
  title: "API Documentation — PromptForge Enterprise",
  description: "Complete API reference for PromptForge Enterprise plan - run modules, get artifacts, and access telemetry",
};

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  return (
    <div className="relative">
      <div className="absolute top-3 right-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{language}</span>
      </div>
      <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto border border-white/10">
        <code className="text-sm text-gray-100 font-mono">{children}</code>
      </pre>
    </div>
  );
}

function ApiEndpoint() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">API Endpoint</h2>
            <p className="text-gray-400">Run modules and get artifacts with telemetry</p>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">POST</span>
            <code className="text-lg text-white font-mono">/api/run/{'{moduleId}'}</code>
          </div>
          <p className="text-gray-300 text-sm">
            Execute a prompt engineering module and retrieve optimized prompts with artifacts and telemetry data.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Authentication
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              All API requests require an Enterprise API key in the Authorization header:
            </p>
            <CodeBlock language="bash">
{`Authorization: Bearer pf_enterprise_xxxxxxxxxxxxxxxxxxxxx`}
            </CodeBlock>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Rate Limiting
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Enterprise plans include generous rate limits:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Requests per minute:</span>
                <span className="text-white font-mono">100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Requests per hour:</span>
                <span className="text-white font-mono">1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Concurrent requests:</span>
                <span className="text-white font-mono">10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ParametersSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Settings className="w-6 h-6 text-amber-400" />
          Request Parameters
        </h2>
        
        <div className="space-y-6">
          {/* Required Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Required Parameters
            </h3>
            
            <div className="bg-slate-800 rounded-lg p-4 border border-white/10 mb-4">
              <h4 className="text-white font-semibold mb-2">params7D</h4>
              <p className="text-gray-300 text-sm mb-3">
                The 7-dimensional parameter object that defines your prompt vector:
              </p>
              <CodeBlock language="json">
{`{
  "domain": "string",        // Business domain (e.g., "ecommerce", "healthcare")
  "scale": "string",         // Scope size ("small", "medium", "large")
  "urgency": "string",       // Time sensitivity ("low", "medium", "high")
  "complexity": "string",    // Technical complexity ("simple", "moderate", "advanced")
  "resources": "string",     // Available resources ("limited", "adequate", "abundant")
  "application": "string",   // Use case ("internal", "customer-facing", "public")
  "output": "string"         // Desired output format ("text", "structured", "creative")
}`}
              </CodeBlock>
            </div>
          </div>
          
          {/* Optional Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-amber-400" />
              Optional Parameters
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">variant</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Test variant identifier for A/B testing different prompt approaches.
                </p>
                <CodeBlock language="json">
{`"variant": "aggressive"`}
                </CodeBlock>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">seed</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Deterministic seed for reproducible results across runs.
                </p>
                <CodeBlock language="json">
{`"seed": 12345`}
                </CodeBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExamplesSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Terminal className="w-6 h-6 text-blue-400" />
          Request Examples
        </h2>
        
        <div className="space-y-6">
          {/* cURL Example */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">cURL Request</h3>
            <CodeBlock language="bash">
{`curl -X POST https://api.promptforge.com/api/run/M01 \\
  -H "Authorization: Bearer pf_enterprise_xxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "params7D": {
      "domain": "ecommerce",
      "scale": "medium",
      "urgency": "medium",
      "complexity": "moderate",
      "resources": "adequate",
      "application": "customer-facing",
      "output": "structured"
    },
    "variant": "professional",
    "seed": 42
  }'`}
            </CodeBlock>
          </div>
          
          {/* JavaScript Example */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">JavaScript/Node.js</h3>
            <CodeBlock language="javascript">
{`const response = await fetch('https://api.promptforge.com/api/run/M01', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pf_enterprise_xxxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    params7D: {
      domain: 'ecommerce',
      scale: 'medium',
      urgency: 'medium',
      complexity: 'moderate',
      resources: 'adequate',
      application: 'customer-facing',
      output: 'structured'
    },
    variant: 'professional',
    seed: 42
  })
});

const result = await response.json();`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResponseSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Download className="w-6 h-6 text-green-400" />
          Response Format
        </h2>
        
        <div className="space-y-6">
          {/* Success Response */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Success Response (200)
            </h3>
            <CodeBlock language="json">
{`{
  "success": true,
  "data": {
    "run_id": "RUN_20240115_103000_M01_001",
    "module_id": "M01",
    "status": "completed",
    "start_ts": "2024-01-15T10:30:00.000Z",
    "end_ts": "2024-01-15T10:30:45.000Z",
    "duration_ms": 45000,
    "tokens": {
      "input": 1250,
      "output": 890,
      "total": 2140
    },
    "cost": 0.025,
    "scores": {
      "clarity": 92,
      "execution": 88,
      "ambiguity": 15,
      "alignment": 95,
      "business_fit": 89,
      "overall": 89.8
    },
    "artifacts": {
      "txt": "https://api.promptforge.com/artifacts/RUN_001/optimized_prompt.txt",
      "md": "https://api.promptforge.com/artifacts/RUN_001/optimized_prompt.md",
      "json": "https://api.promptforge.com/artifacts/RUN_001/optimized_prompt.json",
      "pdf": "https://api.promptforge.com/artifacts/RUN_001/optimized_prompt.pdf",
      "bundle": "https://api.promptforge.com/artifacts/RUN_001/bundle.zip"
    },
    "prompts": {
      "original": "Create a product description for wireless headphones",
      "optimized": "Create a compelling product description for premium wireless headphones, emphasizing sound quality and comfort for professional use. Include key features, benefits, and target audience considerations.",
      "variants": [
        "professional",
        "casual",
        "technical"
      ]
    }
  }
}`}
            </CodeBlock>
          </div>
          
          {/* Error Response */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Error Response (4xx/5xx)
            </h3>
            <CodeBlock language="json">
{`{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_ENTITLEMENTS",
    "message": "Your plan does not include PDF export functionality",
    "details": {
      "required_entitlement": "pdf_export",
      "current_plan": "pro",
      "upgrade_url": "https://promptforge.com/pricing"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function EntitlementsSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Lock className="w-6 h-6 text-purple-400" />
          Entitlements & Access Control
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">API Access Levels</h3>
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Pro Plan</span>
                  <span className="text-amber-400 text-sm">Limited</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 100 API calls/month</li>
                  <li>• Basic artifacts (.txt, .md)</li>
                  <li>• Standard rate limiting</li>
                </ul>
              </div>
              
              <div className="bg-slate-800 rounded-lg p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Enterprise Plan</span>
                  <span className="text-emerald-400 text-sm">Full Access</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Unlimited API calls</li>
                  <li>• All artifacts (.txt, .md, .json, .pdf, .zip)</li>
                  <li>• Premium rate limiting</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Middleware Verification</h3>
            <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
              <p className="text-gray-300 text-sm mb-3">
                Our middleware automatically verifies your entitlements before processing requests:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">API key validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Plan verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Feature entitlements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300">Rate limit checking</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Quality Gates
              </h4>
              <p className="text-amber-200 text-sm">
                Prompts with scores below 80 will trigger warnings and may require manual review before artifact generation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GettingStartedSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Getting Started
        </h2>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-black font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Get API Key</h3>
              <p className="text-gray-300 text-sm mb-4">
                Upgrade to Enterprise plan and generate your API key from the dashboard.
              </p>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all duration-300">
                Upgrade to Enterprise
              </button>
            </div>
            
            {/* Step 2 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Configure Request</h3>
              <p className="text-gray-300 text-sm mb-4">
                Set up your 7-D parameters and optional variants for optimal results.
              </p>
              <div className="text-xs text-gray-400">
                Use our parameter builder in the dashboard for guidance.
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Handle Responses</h3>
              <p className="text-gray-300 text-sm mb-4">
                Process artifacts and telemetry data according to your application needs.
              </p>
              <div className="text-xs text-gray-400">
                Implement proper error handling for edge cases.
              </div>
            </div>
          </div>
          
          {/* Error Handling */}
          <div className="bg-slate-800 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Error Handling Best Practices
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-2">Common Error Codes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">401:</span>
                    <span className="text-red-400">Invalid API key</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">403:</span>
                    <span className="text-red-400">Insufficient entitlements</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">429:</span>
                    <span className="text-red-400">Rate limit exceeded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">422:</span>
                    <span className="text-red-400">Invalid parameters</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Retry Strategy</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Implement exponential backoff for rate limits</p>
                  <p>• Retry failed requests up to 3 times</p>
                  <p>• Log errors for debugging and monitoring</p>
                  <p>• Handle partial failures gracefully</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="mb-12">
      <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30 p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Upgrade to Enterprise plan to unlock unlimited API access, all artifact formats, and priority support for your prompt engineering needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300">
            View Enterprise Plans
          </button>
          <button className="px-8 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Complete API reference for PromptForge Enterprise plan. Run modules, get artifacts, and access comprehensive telemetry data.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Enterprise Only
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Rate Limited
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-green-400" />
                Multiple Formats
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ApiEndpoint />
        <ParametersSection />
        <ExamplesSection />
        <ResponseSection />
        <EntitlementsSection />
        <GettingStartedSection />
        <ContactSection />
      </div>
    </div>
  );
}
