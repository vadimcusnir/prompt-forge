// app/dashboard/page.tsx

import { Suspense } from "react";
import { Metadata } from "next";
import { 
  Clock, 
  Download, 
  Play, 
  Filter, 
  Search, 
  Calendar,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Package,
  Zap,
  Target,
  Brain,
  Users,
  Building
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — PromptForge",
  description: "View your prompt engineering run history, scores, and artifacts",
};

// Mock data for demonstration
const mockRuns = [
  {
    run_id: "RUN_001",
    timestamp: "2024-01-15T10:30:00Z",
    module_id: "M01",
    domain: "E-commerce",
    version: "1.2.0",
    parameters_7d: "Clarity: High, Context: Business, Style: Professional, Tone: Friendly, Structure: Structured, Length: Medium, Language: EN",
    scores: {
      clarity: 92,
      execution: 88,
      ambiguity: 15,
      alignment: 95,
      business_fit: 89
    },
    duration: "45s",
    status: "completed",
    tokens_used: 1250,
    cost: 0.025,
    original_prompt: "Create a product description for a wireless headphones",
    edited_prompt: "Create a compelling product description for premium wireless headphones, emphasizing sound quality and comfort for professional use"
  },
  {
    run_id: "RUN_002",
    timestamp: "2024-01-15T09:15:00Z",
    module_id: "M02",
    domain: "Education",
    version: "1.1.5",
    parameters_7d: "Clarity: Medium, Context: Academic, Style: Formal, Tone: Neutral, Structure: Flexible, Length: Long, Language: EN",
    scores: {
      clarity: 78,
      execution: 82,
      ambiguity: 25,
      alignment: 75,
      business_fit: 70
    },
    duration: "52s",
    status: "completed",
    tokens_used: 2100,
    cost: 0.042,
    original_prompt: "Explain quantum computing to high school students",
    edited_prompt: "Create an engaging explanation of quantum computing principles suitable for high school students with basic physics knowledge"
  },
  {
    run_id: "RUN_003",
    timestamp: "2024-01-14T16:45:00Z",
    module_id: "M03",
    domain: "Healthcare",
    version: "1.3.0",
    parameters_7d: "Clarity: High, Context: Medical, Style: Technical, Tone: Professional, Structure: Structured, Length: Short, Language: EN",
    scores: {
      clarity: 95,
      execution: 91,
      ambiguity: 8,
      alignment: 98,
      business_fit: 94
    },
    duration: "38s",
    status: "completed",
    tokens_used: 980,
    cost: 0.019,
    original_prompt: "Generate a medical report template",
    edited_prompt: "Create a comprehensive medical report template following HIPAA guidelines with structured sections for patient information, diagnosis, and treatment"
  }
];

const mockModules = [
  { id: "M01", name: "Foundation Prompts", domain: "General" },
  { id: "M02", name: "Advanced Patterns", domain: "Technical" },
  { id: "M03", name: "System Prompts", domain: "Enterprise" },
  { id: "M04", name: "Creative Writing", domain: "Marketing" },
  { id: "M05", name: "Data Analysis", domain: "Analytics" }
];

const mockDomains = ["E-commerce", "Education", "Healthcare", "Finance", "Marketing", "Technology"];

function DashboardHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Run History Dashboard</h1>
      <p className="text-gray-400">Monitor your prompt engineering performance and access artifacts</p>
    </div>
  );
}

function DashboardFilters() {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Filter className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Module Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Module</label>
          <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
            <option value="">All Modules</option>
            {mockModules.map(module => (
              <option key={module.id} value={module.id}>{module.id} - {module.name}</option>
            ))}
          </select>
        </div>
        
        {/* Domain Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
          <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
            <option value="">All Domains</option>
            {mockDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
        
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
          <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        
        {/* Version Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
          <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
            <option value="">All Versions</option>
            <option value="1.3.0">1.3.0</option>
            <option value="1.2.0">1.2.0</option>
            <option value="1.1.5">1.1.5</option>
          </select>
        </div>
        
        {/* Min Score Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Score</label>
          <select className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400">
            <option value="0">Any Score</option>
            <option value="80">80+</option>
            <option value="85">85+</option>
            <option value="90">90+</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          Clear Filters
        </button>
        <div className="text-sm text-gray-400">
          Showing {mockRuns.length} runs
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    if (score >= 80) return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(score)}`}>
      <span>{label}</span>
      <span className="font-bold">{score}</span>
    </div>
  );
}

function RunTable() {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Run ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date/Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Module</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">7-D Parameters</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Scores</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Duration</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {mockRuns.map((run) => (
              <tr key={run.run_id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="font-mono text-sm text-white">{run.run_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(run.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-xs">{run.module_id}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{run.module_id}</div>
                      <div className="text-xs text-gray-400">{run.domain}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-300 line-clamp-2">{run.parameters_7d}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    <ScoreBadge score={run.scores.clarity} label="C" />
                    <ScoreBadge score={run.scores.execution} label="E" />
                    <ScoreBadge score={run.scores.alignment} label="A" />
                    <ScoreBadge score={run.scores.business_fit} label="B" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{run.duration}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {run.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm capitalize ${
                      run.status === 'completed' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors" title="Re-run">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors" title="Download Artifacts">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RunDetailsPanel() {
  const selectedRun = mockRuns[0]; // Mock selected run
  
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Run Details</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Selected:</span>
          <span className="font-mono text-sm text-amber-400">{selectedRun.run_id}</span>
        </div>
      </div>
      
      {/* Original vs Edited Prompt */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Original Prompt
          </h4>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
            <p className="text-white text-sm leading-relaxed">{selectedRun.original_prompt}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Edited Prompt
          </h4>
          <div className="bg-slate-800 rounded-lg p-4 border border-white/10">
            <p className="text-white text-sm leading-relaxed">{selectedRun.edited_prompt}</p>
          </div>
        </div>
      </div>
      
      {/* Detailed Scores */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Detailed Scores
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{selectedRun.scores.clarity}</div>
            <div className="text-xs text-gray-400">Clarity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">{selectedRun.scores.execution}</div>
            <div className="text-xs text-gray-400">Execution</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{selectedRun.scores.ambiguity}</div>
            <div className="text-xs text-gray-400">Ambiguity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{selectedRun.scores.alignment}</div>
            <div className="text-xs text-gray-400">Alignment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{selectedRun.scores.business_fit}</div>
            <div className="text-xs text-gray-400">Business Fit</div>
          </div>
        </div>
      </div>
      
      {/* Telemetry */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Telemetry
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Start Time</div>
            <div className="text-sm text-white font-mono">
              {new Date(selectedRun.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Duration</div>
            <div className="text-sm text-white">{selectedRun.duration}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Tokens</div>
            <div className="text-sm text-white">{selectedRun.tokens_used.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Cost</div>
            <div className="text-sm text-white">${selectedRun.cost.toFixed(3)}</div>
          </div>
        </div>
      </div>
      
      {/* Bundle Links */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Bundle Access
        </h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors text-sm">
            Download PDF
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm">
            Download JSON
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm">
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
}

function UpgradePaywall() {
  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30 p-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Upgrade Required</h3>
      <p className="text-gray-300 mb-4">
        Your current plan doesn't include artifact downloads. Upgrade to Pro or Enterprise to access all features.
      </p>
      <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all duration-300">
        View Plans
      </button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <DashboardFilters />
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <RunTable />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <RunDetailsPanel />
            <UpgradePaywall />
          </div>
        </div>
      </div>
    </div>
  );
}
