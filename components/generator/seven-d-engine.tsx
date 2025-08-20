'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface SevenDConfig {
  domain: string;
  scale: string;
  urgency: string;
  complexity: string;
  resources: string;
  application: string;
  output: string;
}

const DOMAIN_OPTIONS = [
  'Health & Medicine',
  'Legal & Compliance',
  'Government & Public Sector',
  'Media & Entertainment',
  'Finance & Banking',
  'Education & Training',
  'Technology & Software',
  'Manufacturing & Industry',
  'Retail & E-commerce',
  'Research & Development'
];

const SCALE_OPTIONS = [
  'Individual',
  'Small Team (2-10)',
  'Medium Organization (11-100)',
  'Large Enterprise (100+)',
  'Multi-National',
  'Government Agency'
];

const URGENCY_OPTIONS = [
  'Low Priority',
  'Standard Timeline',
  'High Priority',
  'Critical/Urgent',
  'Emergency Response'
];

const COMPLEXITY_OPTIONS = [
  'Simple Task',
  'Moderate Complexity',
  'Complex System',
  'Highly Complex',
  'Research/Innovation'
];

const RESOURCES_OPTIONS = [
  'Minimal Resources',
  'Standard Resources',
  'Adequate Resources',
  'Abundant Resources',
  'Unlimited Budget'
];

const APPLICATION_OPTIONS = [
  'Internal Use',
  'Client Delivery',
  'Public Release',
  'Research Publication',
  'Commercial Product',
  'Educational Content'
];

const OUTPUT_OPTIONS = [
  'Text Response',
  'Structured Data',
  'Code/Technical',
  'Creative Content',
  'Analysis Report',
  'Multi-format'
];

export function SevenDEngine() {
  const [config, setConfig] = useState<SevenDConfig>({
    domain: DOMAIN_OPTIONS[0],
    scale: SCALE_OPTIONS[0],
    urgency: URGENCY_OPTIONS[0],
    complexity: COMPLEXITY_OPTIONS[0],
    resources: RESOURCES_OPTIONS[0],
    application: APPLICATION_OPTIONS[0],
    output: OUTPUT_OPTIONS[0]
  });

  const [showDetails, setShowDetails] = useState(false);

  const handleConfigChange = (dimension: keyof SevenDConfig, value: string) => {
    setConfig(prev => ({ ...prev, [dimension]: value }));
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-amber-400 font-montserrat mb-2">
          7-D Configuration Engine
        </h2>
        <p className="text-slate-300 font-open-sans">
          Configure your prompt generation across seven key dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Domain */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Domain
          </label>
          <select
            value={config.domain}
            onChange={(e) => handleConfigChange('domain', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {DOMAIN_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Scale
          </label>
          <select
            value={config.scale}
            onChange={(e) => handleConfigChange('scale', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {SCALE_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Urgency
          </label>
          <select
            value={config.urgency}
            onChange={(e) => handleConfigChange('urgency', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {URGENCY_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Complexity
          </label>
          <select
            value={config.complexity}
            onChange={(e) => handleConfigChange('complexity', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {COMPLEXITY_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Resources */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Resources
          </label>
          <select
            value={config.resources}
            onChange={(e) => handleConfigChange('resources', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {RESOURCES_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Application */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Application
          </label>
          <select
            value={config.application}
            onChange={(e) => handleConfigChange('application', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {APPLICATION_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-amber-300 font-montserrat">
            Output
          </label>
          <select
            value={config.output}
            onChange={(e) => handleConfigChange('output', e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          >
            {OUTPUT_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-slate-700 text-slate-200">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Configuration Display */}
      <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold text-amber-300 font-montserrat mb-3">
          Current Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-slate-400">Domain:</span> <span className="text-slate-200">{config.domain}</span></div>
          <div><span className="text-slate-400">Scale:</span> <span className="text-slate-200">{config.scale}</span></div>
          <div><span className="text-slate-400">Urgency:</span> <span className="text-slate-200">{config.urgency}</span></div>
          <div><span className="text-slate-400">Complexity:</span> <span className="text-slate-200">{config.complexity}</span></div>
          <div><span className="text-slate-400">Resources:</span> <span className="text-slate-200">{config.resources}</span></div>
          <div><span className="text-slate-400">Application:</span> <span className="text-slate-200">{config.application}</span></div>
          <div><span className="text-slate-400">Output:</span> <span className="text-slate-200">{config.output}</span></div>
        </div>
      </div>

      {/* Implementation Details Collapsible */}
      <div className="border-t border-slate-700/50 pt-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left text-lg font-semibold text-amber-300 font-montserrat hover:text-amber-400 transition-colors"
        >
          Implementation Details
          {showDetails ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
        
        {showDetails && (
          <div className="mt-4 p-4 bg-slate-700/30 rounded-xl text-slate-300 font-open-sans space-y-3">
            <p>
              <strong>Domain:</strong> Determines the industry-specific terminology, compliance requirements, and best practices applied to the prompt generation.
            </p>
            <p>
              <strong>Scale:</strong> Adjusts the prompt complexity and scope based on organizational size and resource availability.
            </p>
            <p>
              <strong>Urgency:</strong> Influences the prompt structure to prioritize speed vs. thoroughness in AI responses.
            </p>
            <p>
              <strong>Complexity:</strong> Controls the technical depth and sophistication level of the generated prompts.
            </p>
            <p>
              <strong>Resources:</strong> Adjusts prompt requirements based on available time, budget, and human resources.
            </p>
            <p>
              <strong>Application:</strong> Tailors the prompt format and content for specific use cases and audiences.
            </p>
            <p>
              <strong>Output:</strong> Defines the expected response format and structure from the AI system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
