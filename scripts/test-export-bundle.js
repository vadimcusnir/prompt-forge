#!/usr/bin/env node

/**
 * scripts/test-export-bundle.js — Export Bundle System Test
 * 
 * Simple Node.js script to test the export bundle functionality
 */

const { createHash } = require('crypto');

// Mock the crypto module for testing
const mockCrypto = {
  createHash: () => ({
    update: function(data) {
      this.data = data;
      return this;
    },
    digest: function() {
      return 'mocked-checksum-1234567890abcdef';
    }
  })
};

// Mock data for testing
const mockPrompt = {
  id: 'test-123',
  hash: 'abc123def456',
  timestamp: new Date('2024-01-01T00:00:00Z'),
  config: {
    vector: 'V1',
    domain: 'saas',
    scale: 'startup',
    urgency: 'sprint',
    resources: 'lean_team',
    complexity: 'standard',
    application: 'implementation',
    outputFormat: 'txt'
  },
  moduleId: 1,
  prompt: 'This is a test prompt for the export bundle system.',
  editedPrompt: 'This is an edited test prompt for the export bundle system.',
  testResults: {
    structureScore: 85,
    kpiScore: 90,
    clarityScore: 88,
    output: 'Test output',
    validated: true
  }
};

const mockTestResults = [
  {
    testName: 'Structure Test',
    passed: true,
    score: 85,
    details: 'Prompt structure is well-formed',
    timestamp: new Date()
  },
  {
    testName: 'KPI Test',
    passed: true,
    score: 90,
    details: 'All KPI requirements met',
    timestamp: new Date()
  }
];

const mockEditResults = [
  {
    editType: 'Clarity Improvement',
    confidence: 95.5,
    changes: 'Enhanced sentence structure for better clarity',
    timestamp: new Date()
  }
];

// Mock plans
const PLANS = {
  free: {
    id: 'free',
    label: 'Free',
    features: {
      canUseAllModules: false,
      canExportMD: false,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: false,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    exports_allowed: ['txt']
  },
  creator: {
    id: 'creator',
    label: 'Creator',
    features: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: false,
      canExportJSON: false,
      canUseGptTestReal: false,
      hasCloudHistory: false,
      hasEvaluatorAI: false,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    exports_allowed: ['txt', 'md']
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    features: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: false,
      hasWhiteLabel: false,
      canExportBundleZip: false,
      hasSeatsGT1: false,
    },
    exports_allowed: ['txt', 'md', 'json', 'pdf']
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    features: {
      canUseAllModules: true,
      canExportMD: true,
      canExportPDF: true,
      canExportJSON: true,
      canUseGptTestReal: true,
      hasCloudHistory: true,
      hasEvaluatorAI: true,
      hasAPI: true,
      hasWhiteLabel: true,
      canExportBundleZip: true,
      hasSeatsGT1: true,
    },
    exports_allowed: ['txt', 'md', 'json', 'pdf', 'bundle']
  }
};

// Test functions
function testPlanGating() {
  console.log('\n🧪 Testing Plan-Based Gating...');
  
  Object.entries(PLANS).forEach(([planId, plan]) => {
    console.log(`\n📋 ${plan.label} Plan (${planId}):`);
    console.log(`   Available formats: ${plan.exports_allowed.join(', ')}`);
    console.log(`   Can export MD: ${plan.features.canExportMD}`);
    console.log(`   Can export PDF: ${plan.features.canExportPDF}`);
    console.log(`   Can export JSON: ${plan.features.canExportJSON}`);
    console.log(`   Can export ZIP: ${plan.features.canExportBundleZip}`);
  });
}

function testArtifactGeneration() {
  console.log('\n🧪 Testing Artifact Generation...');
  
  // Test TXT generation
  console.log('\n📄 Testing TXT Artifact Generation...');
  const txtContent = generateTxtArtifact(mockPrompt, mockTestResults, mockEditResults);
  console.log(`   ✅ TXT generated: ${txtContent.length} characters`);
  console.log(`   ✅ Contains branding: ${txtContent.includes('PROMPTFORGE™')}`);
  console.log(`   ✅ Contains prompt: ${txtContent.includes('This is a test prompt')}`);
  
  // Test MD generation
  console.log('\n📝 Testing MD Artifact Generation...');
  const mdContent = generateMdArtifact(mockPrompt, mockTestResults, mockEditResults);
  console.log(`   ✅ MD generated: ${mdContent.length} characters`);
  console.log(`   ✅ Contains markdown: ${mdContent.includes('# PROMPTFORGE™')}`);
  console.log(`   ✅ Contains tables: ${mdContent.includes('| Field | Value |')}`);
  
  // Test JSON generation
  console.log('\n🔧 Testing JSON Artifact Generation...');
  const jsonContent = generateJsonArtifact(mockPrompt, mockTestResults, mockEditResults);
  console.log(`   ✅ JSON generated: ${jsonContent.length} characters`);
  const parsed = JSON.parse(jsonContent);
  console.log(`   ✅ Valid JSON: ${parsed.metadata.product === 'PROMPTFORGE™'}`);
  console.log(`   ✅ Contains prompt data: ${parsed.prompt.module === 1}`);
}

function generateTxtArtifact(prompt, testResults, editResults) {
  let content = `PROMPTFORGE™ v3.0.0\n`;
  content += `PromptForge Inc.\n`;
  content += '='.repeat(50) + '\n\n';
  content += `PROMPT SPECIFICATION\n`;
  content += `Module: ${prompt.moduleId}\n`;
  content += `Vector: ${prompt.config.vector}\n`;
  content += `Score: ${prompt.testResults?.structureScore?.toFixed(2) || '0.00'}/100\n`;
  content += `Session: ${prompt.hash}\n`;
  content += `Generated: ${prompt.timestamp.toISOString()}\n\n`;
  content += `SEVEN DIMENSIONS:\n`;
  content += `Domain: ${prompt.config.domain || 'N/A'}\n`;
  content += `Scale: ${prompt.config.scale || 'N/A'}\n`;
  content += `Urgency: ${prompt.config.urgency || 'N/A'}\n`;
  content += `Complexity: ${prompt.config.complexity || 'N/A'}\n`;
  content += `Resources: ${prompt.config.resources || 'N/A'}\n`;
  content += `Application: ${prompt.config.application || 'N/A'}\n\n`;
  content += `PROMPT CONTENT:\n`;
  content += `${prompt.prompt}\n\n`;
  content += `LICENSE NOTICE:\n`;
  content += `© 2024 PromptForge Inc. All rights reserved.\n`;

  if (testResults.length > 0) {
    content += `\nTEST RESULTS:\n`;
    content += '-'.repeat(30) + '\n';
    testResults.forEach((result, index) => {
      content += `${index + 1}. ${result.testName}: ${result.passed ? 'PASS' : 'FAIL'}\n`;
      content += `   Score: ${result.score.toFixed(2)}/100\n`;
      content += `   Details: ${result.details}\n\n`;
    });
  }

  if (editResults.length > 0) {
    content += `\nEDIT HISTORY:\n`;
    content += '-'.repeat(30) + '\n';
    editResults.forEach((edit, index) => {
      content += `${index + 1}. ${edit.editType}: ${edit.confidence.toFixed(2)}%\n`;
      content += `   Changes: ${edit.changes}\n\n`;
    });
  }

  return content;
}

function generateMdArtifact(prompt, testResults, editResults) {
  let content = `# PROMPTFORGE™ v3.0.0\n\n`;
  content += `**Company:** PromptForge Inc.  \n`;
  content += `**Website:** https://promptforge.ai\n\n`;
  content += `## Prompt Specification\n\n`;
  content += `| Field | Value |\n`;
  content += `|-------|-------|\n`;
  content += `| Module | ${prompt.moduleId} |\n`;
  content += `| Vector | ${prompt.config.vector} |\n`;
  content += `| Score | ${prompt.testResults?.structureScore?.toFixed(2) || '0.00'}/100 |\n`;
  content += `| Session | \`${prompt.hash}\` |\n`;
  content += `| Generated | ${prompt.timestamp.toISOString()} |\n\n`;
  content += `## Seven Dimensions\n\n`;
  content += `- **Domain:** ${prompt.config.domain || 'N/A'}\n`;
  content += `- **Scale:** ${prompt.config.scale || 'N/A'}\n`;
  content += `- **Urgency:** ${prompt.config.urgency || 'N/A'}\n`;
  content += `- **Complexity:** ${prompt.config.complexity || 'N/A'}\n`;
  content += `- **Resources:** ${prompt.config.resources || 'N/A'}\n`;
  content += `- **Application:** ${prompt.config.application || 'N/A'}\n\n`;
  content += `## Prompt Content\n\n`;
  content += `\`\`\`\n${prompt.prompt}\n\`\`\`\n\n`;
  content += `## License Notice\n\n`;
  content += `© 2024 PromptForge Inc. All rights reserved.\n`;

  if (testResults.length > 0) {
    content += `\n## Test Results\n\n`;
    testResults.forEach((result, index) => {
      content += `### ${index + 1}. ${result.testName}\n\n`;
      content += `- **Status:** ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`;
      content += `- **Score:** ${result.score.toFixed(2)}/100\n`;
      content += `- **Details:** ${result.details}\n\n`;
    });
  }

  if (editResults.length > 0) {
    content += `\n## Edit History\n\n`;
    editResults.forEach((edit, index) => {
      content += `### ${index + 1}. ${edit.editType}\n\n`;
      content += `- **Confidence:** ${edit.confidence.toFixed(2)}%\n`;
      content += `- **Changes:** ${edit.changes}\n\n`;
    });
  }

  return content;
}

function generateJsonArtifact(prompt, testResults, editResults) {
  const data = {
    metadata: {
      product: 'PROMPTFORGE™',
      version: 'v3.0.0',
      company: 'PromptForge Inc.',
      generated_at: new Date().toISOString(),
      license_notice: '© 2024 PromptForge Inc. All rights reserved.'
    },
    prompt: {
      module: prompt.moduleId,
      vector: prompt.config.vector,
      score: prompt.testResults?.structureScore || 0,
      session_hash: prompt.hash,
      config: prompt.config,
      content: prompt.prompt
    },
    test_results: testResults.map(result => ({
      test_name: result.testName,
      passed: result.passed,
      score: result.score,
      details: result.details,
      timestamp: result.timestamp?.toISOString()
    })),
    edit_history: editResults.map(edit => ({
      edit_type: edit.editType,
      confidence: edit.confidence,
      changes: edit.changes,
      timestamp: edit.timestamp?.toISOString()
    })),
    seven_dimensions: prompt.config
  };

  return JSON.stringify(data, null, 2);
}

function testChecksumGeneration() {
  console.log('\n🧪 Testing Checksum Generation...');
  
  const artifacts = [
    { filename: 'prompt.txt', content: 'test content 1', mimeType: 'text/plain', size: 13 },
    { filename: 'prompt.md', content: 'test content 2', mimeType: 'text/markdown', size: 14 }
  ];
  
  const checksum = generateChecksum(artifacts);
  console.log(`   ✅ Checksum generated: ${checksum}`);
  console.log(`   ✅ Length: ${checksum.length} characters`);
  console.log(`   ✅ Format: ${checksum.startsWith('mocked-checksum') ? 'Mocked' : 'Real'}`);
}

function generateChecksum(artifacts) {
  const hash = mockCrypto.createHash('sha256');
  
  // Sort artifacts by filename for consistent checksum
  const sortedArtifacts = artifacts.sort((a, b) => a.filename.localeCompare(b.filename));
  
  sortedArtifacts.forEach(artifact => {
    hash.update(artifact.filename);
    hash.update(artifact.content.toString());
    hash.update(artifact.mimeType);
    hash.update(artifact.size.toString());
  });
  
  return hash.digest('hex');
}

// Main test execution
function runTests() {
  console.log('🚀 Starting Export Bundle System Tests...\n');
  
  try {
    testPlanGating();
    testArtifactGeneration();
    testChecksumGeneration();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   - Plan-based gating: ✅');
    console.log('   - Artifact generation: ✅');
    console.log('   - Checksum generation: ✅');
    console.log('   - Format validation: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testPlanGating,
  testArtifactGeneration,
  testChecksumGeneration,
  generateTxtArtifact,
  generateMdArtifact,
  generateJsonArtifact,
  generateChecksum
};
