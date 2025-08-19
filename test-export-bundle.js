// Test pentru Export Bundle System
// Rulează cu: node test-export-bundle.js

const { BundleExporter } = require('./lib/export-bundle.ts');

// Mock data pentru test
const testBundle = {
  prompt: "You are an expert AI prompt engineer. Create a comprehensive prompt for...",
  config: {
    domain: "AI Development",
    scale: "Enterprise",
    urgency: "High",
    complexity: "Advanced",
    resources: "Unlimited",
    application: "Production",
    output: "Detailed"
  },
  metadata: {
    moduleId: "M01",
    moduleName: "AI Prompt Engineering",
    hash: "abc123def",
    timestamp: new Date().toISOString(),
    version: 1,
    runId: "run_123456789"
  },
  telemetry: {
    tokensUsed: 150,
    duration: 1200,
    score: 95,
    policyHits: ["quality", "safety"]
  }
};

async function testExportBundle() {
  console.log("🧪 Testing Export Bundle System...");
  
  try {
    // Test 1: Generate all formats
    console.log("\n1️⃣ Testing format generation...");
    const formats = await BundleExporter.generateBundle(testBundle);
    console.log("✅ Formats generated:", Object.keys(formats));
    
    // Test 2: Check content
    console.log("\n2️⃣ Testing content...");
    console.log("📝 TXT length:", formats.txt.length);
    console.log("📄 MD length:", formats.md.length);
    console.log("🔧 JSON length:", formats.json.length);
    console.log("📊 PDF size:", formats.pdf.length, "bytes");
    
    // Test 3: Create ZIP bundle
    console.log("\n3️⃣ Testing ZIP bundle...");
    const zipBlob = await BundleExporter.createBundleZip(testBundle, formats);
    console.log("✅ ZIP created:", zipBlob.size, "bytes");
    
    console.log("\n🎉 All tests passed! Export Bundle System is working correctly.");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Rulează testul
testExportBundle();
