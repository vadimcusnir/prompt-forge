import { useState } from 'react';
import { useExportBundle } from '@/hooks/use-export-bundle';
import { PromptBundle } from '@/lib/export-bundle';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  FileCode, 
  FilePdf, 
  Archive,
  AlertCircle
} from 'lucide-react';

interface ExportBundleProps {
  bundle: PromptBundle;
  userPlan: 'free' | 'creator' | 'pro' | 'enterprise';
}

export function ExportBundle({ bundle, userPlan }: ExportBundleProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['md']);
  const { exportBundle, isExporting, exportProgress } = useExportBundle();

  const availableFormats = {
    free: ['txt'],
    creator: ['txt', 'md'],
    pro: ['txt', 'md', 'json', 'pdf'],
    enterprise: ['txt', 'md', 'json', 'pdf', 'bundle']
  };

  const formatIcons = {
    txt: FileText,
    md: FileText,
    json: FileCode,
    pdf: FilePdf,
    bundle: Archive
  };

  const formatLabels = {
    txt: 'Plain Text',
    md: 'Markdown',
    json: 'JSON',
    pdf: 'PDF',
    bundle: 'Bundle (.zip)'
  };

  const handleFormatToggle = (format: string) => {
    if (selectedFormats.includes(format)) {
      setSelectedFormats(selectedFormats.filter(f => f !== format));
    } else {
      setSelectedFormats([...selectedFormats, format]);
    }
  };

  const handleExport = async () => {
    try {
      await exportBundle(bundle, selectedFormats, userPlan);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Export Bundle</h3>
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedFormats.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availableFormats[userPlan].map((format) => {
          const Icon = formatIcons[format as keyof typeof formatIcons];
          const isSelected = selectedFormats.includes(format);
          
          return (
            <button
              key={format}
              onClick={() => handleFormatToggle(format)}
              className={`p-3 border rounded-lg flex items-center gap-2 transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300' 
                  : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{formatLabels[format as keyof typeof formatLabels]}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      {isExporting && (
        <div className="space-y-2">
          <Progress value={exportProgress} className="w-full" />
          <p className="text-sm text-gray-400 text-center">
            Exporting... {exportProgress}%
          </p>
        </div>
      )}

      {/* Plan Restrictions */}
      {userPlan === 'free' && (
        <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              Upgrade to Creator for Markdown export, Pro for PDF/JSON, or Enterprise for bundle export.
            </p>
          </div>
        </div>
      )}

      {userPlan === 'creator' && (
        <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-blue-300">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              Upgrade to Pro for PDF/JSON export and GPT Test Engine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
