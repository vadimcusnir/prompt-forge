import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export interface ParameterSet7D {
  domain: string;
  scale: string;
  urgency: string;
  complexity: string;
  resources: string;
  application: string;
  output: string;
}

export interface PromptBundle {
  prompt: string;
  config: ParameterSet7D;
  metadata: {
    moduleId: string;
    moduleName: string;
    hash: string;
    timestamp: string;
    version: number;
    runId: string;
  };
  telemetry: {
    tokensUsed: number;
    duration: number;
    score?: number;
    policyHits: string[];
  };
}

export interface ExportFormats {
  txt: string;
  md: string;
  json: string;
  pdf: Buffer;
}

export class BundleExporter {
  static async generateBundle(bundle: PromptBundle): Promise<ExportFormats> {
    const formats: ExportFormats = {
      txt: this.generateTXT(bundle),
      md: this.generateMD(bundle),
      json: this.generateJSON(bundle),
      pdf: await this.generatePDF(bundle)
    };
    
    return formats;
  }

  private static generateTXT(bundle: PromptBundle): string {
    return bundle.prompt;
  }

  private static generateMD(bundle: PromptBundle): string {
    const { prompt, config, metadata, telemetry } = bundle;
    
    return `# ${metadata.moduleName} - Prompt Generated

**Generated on:** ${new Date(metadata.timestamp).toLocaleDateString()}  
**Module:** ${metadata.moduleId}  
**Hash:** ${metadata.hash}  
**Version:** ${metadata.version}

## 🎯 Configuration (7D Parameters)
- **Domain:** ${config.domain}
- **Scale:** ${config.scale}
- **Urgency:** ${config.urgency}
- **Complexity:** ${config.complexity}
- **Resources:** ${config.resources}
- **Application:** ${config.application}
- **Output:** ${config.output}

## 🚀 Generated Prompt
\`\`\`
${prompt}
\`\`\`

## 📊 Telemetry
- **Tokens Used:** ${telemetry.tokensUsed}
- **Duration:** ${telemetry.duration}ms
- **Score:** ${telemetry.score || 'N/A'}
- **Policy Hits:** ${telemetry.policyHits.join(', ')}

---
*Generated with PROMPTFORGE™ v3.0*`;
  }

  private static generateJSON(bundle: PromptBundle): string {
    return JSON.stringify(bundle, null, 2);
  }

  private static async generatePDF(bundle: PromptBundle): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Header cu branding
    doc.setFontSize(20);
    doc.setTextColor(8, 145, 178); // PROMPTFORGE teal
    doc.text('PROMPTFORGE™ v3.0', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Module: ${bundle.metadata.moduleName}`, 20, 35);
    doc.text(`Generated: ${new Date(bundle.metadata.timestamp).toLocaleDateString()}`, 20, 45);
    doc.text(`Hash: ${bundle.metadata.hash}`, 20, 55);
    
    // Configurare 7D
    doc.setFontSize(14);
    doc.setTextColor(8, 145, 178);
    doc.text('Configuration (7D Parameters)', 20, 75);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let y = 85;
    Object.entries(config).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 25, y);
      y += 7;
    });
    
    // Prompt
    doc.setFontSize(14);
    doc.setTextColor(8, 145, 178);
    doc.text('Generated Prompt', 20, y + 10);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Split prompt în linii de max 80 caractere
    const lines = this.splitText(bundle.prompt, 80);
    lines.forEach((line, index) => {
      if (y + 20 + (index * 5) < 280) {
        doc.text(line, 25, y + 20 + (index * 5));
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('PROMPTFORGE™ v3.0 - AI-Powered Prompt Engineering', 20, 280);
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  private static splitText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  static async createBundleZip(bundle: PromptBundle, formats: ExportFormats): Promise<Blob> {
    const zip = new JSZip();
    
    // Adaugă fișierele în zip
    zip.file("prompt.txt", formats.txt);
    zip.file("prompt.md", formats.md);
    zip.file("prompt.json", formats.json);
    zip.file("prompt.pdf", formats.pdf);
    
    // Adaugă manifest
    const manifest = {
      version: "1.0",
      generated_at: bundle.metadata.timestamp,
      module: bundle.metadata.moduleId,
      hash: bundle.metadata.hash,
      formats: ["txt", "md", "json", "pdf"]
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    
    // Adaugă checksum
    const checksum = await this.generateChecksum(bundle);
    zip.file("checksum.txt", checksum);
    
    return await zip.generateAsync({ type: "blob" });
  }

  private static async generateChecksum(bundle: PromptBundle): Promise<string> {
    const content = bundle.prompt + JSON.stringify(bundle.config) + bundle.metadata.hash;
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
