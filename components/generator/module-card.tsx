'use client';

interface Module {
  id: string;
  name: string;
  vector: string;
  description: string;
  aiScore: number;
  category: string;
}

interface ModuleCardProps {
  module: Module;
  onSelect: () => void;
  plan?: string;
}

export function ModuleCard({ module, onSelect, plan }: ModuleCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 80) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    if (score >= 70) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const getVectorColor = (vector: string) => {
    const colors: { [key: string]: string } = {
      'Creative': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      'Technical': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      'Analytical': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      'Compliance': 'text-red-400 bg-red-400/10 border-red-400/20',
      'Healthcare': 'text-green-400 bg-green-400/10 border-green-400/20',
      'Financial': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      'Educational': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      'Organizational': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
      'Risk Management': 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    };
    return colors[vector] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div
      onClick={onSelect}
      className="group bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:border-amber-400/50 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200 font-montserrat group-hover:text-amber-300 transition-colors">
            {module.name}
          </h3>
          <p className="text-sm text-slate-400 font-open-sans">
            {module.id}
          </p>
        </div>
        
        {/* AI Score Badge */}
        <div className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getScoreColor(module.aiScore)}`}>
          {module.aiScore}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 font-open-sans text-sm mb-4 line-clamp-3">
        {module.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Vector Badge */}
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getVectorColor(module.vector)}`}>
          {module.vector}
        </span>

        {/* Category */}
        <span className="text-xs text-slate-500 font-open-sans">
          {module.category}
        </span>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
}
