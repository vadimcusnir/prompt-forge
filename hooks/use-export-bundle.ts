import { useState } from 'react';
import { PromptBundle, ExportFormats, BundleExporter } from '@/lib/export-bundle';

export function useExportBundle() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportBundle = async (bundle: PromptBundle, formats: string[] = ['md'], userPlan: string) => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Filtrează format-urile disponibile pentru plan
      const availableFormats = getAvailableFormats(userPlan);
      const selectedFormats = formats.filter(f => availableFormats.includes(f));
      
      if (selectedFormats.length === 0) {
        throw new Error('No formats available for your plan');
      }

      const exportFormats = await BundleExporter.generateBundle(bundle);
      
      setExportProgress(50);
      
      // Download files
      for (let i = 0; i < selectedFormats.length; i++) {
        const format = selectedFormats[i];
        const content = exportFormats[format as keyof ExportFormats];
        const filename = `prompt_${bundle.metadata.moduleId}_${bundle.metadata.hash}.${format}`;
        
        if (format === 'pdf') {
          // PDF download
          const blob = new Blob([content as Buffer], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          // Text-based downloads
          const blob = new Blob([content as string], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }
        
        setExportProgress(50 + ((i + 1) * 25));
      }
      
      // Bundle ZIP pentru Enterprise
      if (userPlan === 'enterprise' && selectedFormats.length >= 3) {
        setExportProgress(90);
        const zipBlob = await BundleExporter.createBundleZip(bundle, exportFormats);
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prompt_bundle_${bundle.metadata.hash}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      setExportProgress(100);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getAvailableFormats = (userPlan: string): string[] => {
    switch (userPlan) {
      case 'free': return ['txt'];
      case 'creator': return ['txt', 'md'];
      case 'pro': return ['txt', 'md', 'json', 'pdf'];
      case 'enterprise': return ['txt', 'md', 'json', 'pdf', 'bundle'];
      default: return ['txt'];
    }
  };

  return {
    exportBundle,
    isExporting,
    exportProgress
  };
}
