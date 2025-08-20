'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useEntitlements } from '@/lib/entitlements/useEntitlements';

interface Module {
  id: string;
  name: string;
  vector: string;
  description: string;
  aiScore: number;
  category: string;
}

interface ModuleSidePanelProps {
  module: Module;
  onClose: () => void;
  plan?: string;
}

export function ModuleSidePanel({ module, onClose, plan }: ModuleSidePanelProps) {
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(true);
  const { plan: userPlan } = useEntitlements();

  const currentPlan = plan || userPlan || 'free';

  // Generate initial prompt based on module
  useEffect(() => {
    const generatePrompt = async () => {
      setIsGenerating(true);
      try {
        // Simulate API call - replace with actual prompt generation
        const generatedPrompt = `You are an expert ${module.vector.toLowerCase()} AI assistant specializing in ${module.name.toLowerCase()}.

Your task is to provide comprehensive, accurate, and actionable guidance in the field of ${module.category.toLowerCase()}.

Key Requirements:
- Maintain high standards of quality and accuracy
- Provide practical, implementable solutions
- Consider industry best practices and compliance requirements
- Adapt your response based on the user's specific context and needs

Please respond to the user's query with detailed, well-structured information that demonstrates your expertise in ${module.name.toLowerCase()}.`;

        setPromptText(generatedPrompt);
      } catch (error) {
        console.error('Error generating prompt:', error);
        setPromptText('Error generating prompt. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    };

    generatePrompt();
  }, [module]);

  const handleSimulateTest = async () => {
    // Simulate test execution
    setTestResults({
      runId: `run_${Date.now()}`,
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  };

  const handleRunRealTest = async () => {
    if (currentPlan === 'free' || currentPlan === 'creator') {
      alert('Real test execution requires Pro+ plan or higher.');
      return;
    }
    
    // Implement real test execution
    alert('Running real test... (This would integrate with your test engine)');
  };

  const handleExport = async (format: string) => {
    if (format === 'txt' && currentPlan === 'free') {
      // Allow txt export for free users
    } else if (format === 'md' && (currentPlan === 'free' || currentPlan === 'creator')) {
      // Allow md export for creator+ users
    } else if (['pdf', 'json'].includes(format) && currentPlan === 'pro') {
      // Allow pdf/json export for pro+ users
    } else if (format === 'bundle.zip' && currentPlan === 'enterprise') {
      // Allow bundle export for enterprise users
    } else {
      alert(`Export to ${format} requires a higher plan.`);
      return;
    }

    // Implement export logic
    const element = document.createElement('a');
    const file = new Blob([promptText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${module.id}_${module.name.toLowerCase().replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const canExport = (format: string) => {
    switch (format) {
      case 'txt': return true; // Free
      case 'md': return currentPlan !== 'free'; // Creator+
      case 'pdf':
      case 'json': return currentPlan === 'pro' || currentPlan === 'enterprise'; // Pro+
      case 'bundle.zip': return currentPlan === 'enterprise'; // Enterprise only
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-4xl h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-amber-400 font-montserrat">
                {module.name}
              </h2>
              <p className="text-slate-400 font-open-sans">
                {module.id} • {module.vector} • {module.category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Module Info */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200 font-montserrat">
                Module Information
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">AI Score:</span>
                <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-sm font-semibold">
                  {module.aiScore}
                </span>
              </div>
            </div>
            <p className="text-slate-300 font-open-sans">
              {module.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSimulateTest}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
            >
              <PlayIcon className="h-4 w-4" />
              Simulate Test
            </button>
            
            <button
              onClick={handleRunRealTest}
              disabled={currentPlan === 'free' || currentPlan === 'creator'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPlan === 'pro' || currentPlan === 'enterprise'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
              Run Real Test (Pro+)
            </button>
          </div>

          {/* Export Options */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-200 font-montserrat mb-4">
              Export Options
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { format: 'txt', label: 'Text', plan: 'Free' },
                { format: 'md', label: 'Markdown', plan: 'Creator+' },
                { format: 'pdf', label: 'PDF', plan: 'Pro+' },
                { format: 'json', label: 'JSON', plan: 'Pro+' },
                { format: 'bundle.zip', label: 'Bundle', plan: 'Enterprise' }
              ].map(({ format, label, plan: requiredPlan }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={!canExport(format)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    canExport(format)
                      ? 'border-amber-400/50 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-xs opacity-75">{requiredPlan}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-200 font-montserrat mb-4">
                Test Results
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Run ID:</span>
                  <span className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-sm font-mono">
                    {testResults.runId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Score:</span>
                  <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-sm font-semibold">
                    {testResults.score}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Status:</span>
                  <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded text-sm font-semibold">
                    {testResults.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Preview/Editor Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showPreview
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                !showPreview
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Edit
            </button>
          </div>

          {/* Prompt Content */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-slate-200 font-montserrat mb-4">
              Generated Prompt
            </h3>
            
            {showPreview ? (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <pre className="text-slate-200 font-open-sans text-sm whitespace-pre-wrap">
                  {promptText}
                </pre>
              </div>
            ) : (
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full h-64 bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-slate-200 font-open-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                placeholder="Edit your prompt here..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
