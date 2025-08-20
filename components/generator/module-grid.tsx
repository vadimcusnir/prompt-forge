'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ModuleCard } from './module-card';
import { ModuleSidePanel } from './module-side-panel';
import { useEntitlements } from '@/lib/entitlements/useEntitlements';

interface Module {
  id: string;
  name: string;
  vector: string;
  description: string;
  aiScore: number;
  category: string;
}

// Sample modules data - replace with actual data from your backend
const SAMPLE_MODULES: Module[] = [
  { id: 'M01', name: 'Content Generation', vector: 'Creative', description: 'Generate engaging content for various platforms', aiScore: 92, category: 'Content' },
  { id: 'M02', name: 'Code Review', vector: 'Technical', description: 'Comprehensive code analysis and improvement suggestions', aiScore: 89, category: 'Development' },
  { id: 'M03', name: 'Data Analysis', vector: 'Analytical', description: 'Deep data insights and statistical analysis', aiScore: 94, category: 'Analytics' },
  { id: 'M04', name: 'Legal Document Review', vector: 'Compliance', description: 'Legal document analysis and risk assessment', aiScore: 87, category: 'Legal' },
  { id: 'M05', name: 'Medical Diagnosis Support', vector: 'Healthcare', description: 'AI-assisted medical diagnosis and treatment planning', aiScore: 91, category: 'Healthcare' },
  { id: 'M06', name: 'Financial Planning', vector: 'Financial', description: 'Personal and business financial planning assistance', aiScore: 88, category: 'Finance' },
  { id: 'M07', name: 'Risk Assessment', vector: 'Analytical', description: 'Comprehensive risk evaluation and mitigation strategies', aiScore: 93, category: 'Risk Management' },
  { id: 'M08', name: 'Educational Content', vector: 'Educational', description: 'Create engaging educational materials and courses', aiScore: 90, category: 'Education' },
  { id: 'M09', name: 'Marketing Strategy', vector: 'Creative', description: 'Develop comprehensive marketing campaigns and strategies', aiScore: 86, category: 'Marketing' },
  { id: 'M10', name: 'Project Management', vector: 'Organizational', description: 'Project planning, tracking, and optimization', aiScore: 89, category: 'Management' },
  // Add more modules as needed...
];

const VECTOR_OPTIONS = ['All', 'Creative', 'Technical', 'Analytical', 'Compliance', 'Healthcare', 'Financial', 'Educational', 'Organizational', 'Risk Management'];

export function ModuleGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVector, setSelectedVector] = useState('All');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const { plan } = useEntitlements();

  const filteredModules = useMemo(() => {
    return SAMPLE_MODULES.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVector = selectedVector === 'All' || module.vector === selectedVector;
      return matchesSearch && matchesVector;
    });
  }, [searchTerm, selectedVector]);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setShowSidePanel(true);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedModule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-amber-400 font-montserrat mb-2">
          Module Library
        </h2>
        <p className="text-slate-300 font-open-sans">
          Browse and select from our comprehensive collection of specialized modules
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
            />
          </div>

          {/* Vector Filter */}
          <div className="lg:w-64">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedVector}
                onChange={(e) => setSelectedVector(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all appearance-none"
              >
                {VECTOR_OPTIONS.map((vector) => (
                  <option key={vector} value={vector} className="bg-slate-700 text-slate-200">
                    {vector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-400">
          Showing {filteredModules.length} of {SAMPLE_MODULES.length} modules
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onSelect={() => handleModuleSelect(module)}
            plan={plan}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-300 font-montserrat mb-2">
            No modules found
          </h3>
          <p className="text-slate-400 font-open-sans">
            Try adjusting your search terms or filter criteria
          </p>
        </div>
      )}

      {/* Module Side Panel */}
      {showSidePanel && selectedModule && (
        <ModuleSidePanel
          module={selectedModule}
          onClose={closeSidePanel}
          plan={plan}
        />
      )}
    </div>
  );
}
