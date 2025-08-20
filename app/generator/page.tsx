import { Suspense } from 'react';
import { SevenDEngine } from '@/components/generator/seven-d-engine';
import { ModuleGrid } from '@/components/generator/module-grid';
import { GeneratorHeader } from '@/components/generator/generator-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <GeneratorHeader />
        
        <div className="space-y-8">
          {/* 7-D Configuration Engine */}
          <SevenDEngine />
          
          {/* Module Grid */}
          <Suspense fallback={<LoadingSpinner />}>
            <ModuleGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
