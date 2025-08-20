-- PROMPTFORGE v3 — Database Seeds
-- Initial data: plans, modules M01-M50, industry packs
-- Run after schema.sql and rls_policies.sql

-- ============================================================================
-- SEED PLANS (Free/Pro/Enterprise)
-- ============================================================================

INSERT INTO plans (id, name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 'Get started with basic prompt optimization', 0.00, 0.00, 
  '{"canUseAllModules": false, "canExportMD": true, "canExportPDF": false, "canExportJSON": false, "canUseGptTestReal": false, "hasCloudHistory": false, "hasEvaluatorAI": false, "hasAPI": false, "hasWhiteLabel": false, "canExportBundleZip": false, "hasSeatsGT1": false}',
  '{"runs_per_month": 10, "modules_per_run": 1, "export_formats": ["md"], "max_prompt_length": 1000, "retention_days": 30}'
),
('pro', 'Pro', 'Professional prompt engineering with advanced features', 29.00, 290.00,
  '{"canUseAllModules": true, "canExportMD": true, "canExportPDF": true, "canExportJSON": true, "canUseGptTestReal": true, "hasCloudHistory": true, "hasEvaluatorAI": true, "hasAPI": false, "hasWhiteLabel": false, "canExportBundleZip": false, "hasSeatsGT1": false}',
  '{"runs_per_month": 100, "modules_per_run": 5, "export_formats": ["md", "pdf", "json"], "max_prompt_length": 5000, "retention_days": 365}'
),
('enterprise', 'Enterprise', 'Enterprise-grade prompt engineering with full API access', 99.00, 990.00,
  '{"canUseAllModules": true, "canExportMD": true, "canExportPDF": true, "canExportJSON": true, "canUseGptTestReal": true, "hasCloudHistory": true, "hasEvaluatorAI": true, "hasAPI": true, "hasWhiteLabel": true, "canExportBundleZip": true, "hasSeatsGT1": true}',
  '{"runs_per_month": 1000, "modules_per_run": 10, "export_formats": ["md", "pdf", "json", "zip"], "max_prompt_length": 10000, "retention_days": 2555}'
);

-- ============================================================================
-- SEED MODULES (M01-M50)
-- ============================================================================

-- Core modules based on existing data
INSERT INTO modules (id, name, description, requirements, spec, output_schema, kpi, guardrails, vectors, category, tags) VALUES
(1, 'AI-IDEI.SOPFORGE', 'Pipeline multi-agent research validation SOP cu telemetrie', '[SUBIECT], [NIVEL], [CONTEXT], [FORMAT], [LIMBA], [DEADLINE], [BUDGET], 6+ surse cu autor+data', 'Proces 4-agenti: SourceMiner ConflictResolver ProcedureBuilder QAPilot', '{goal,scope,roles,tools,steps,risks,fallbacks,checklist,sources}', 'TTI, steps_passed, coverage surse, defect rate <2%', 'no guesswork, citeaza oficial', '{1,6,5}', 'Research & Validation', ARRAY['research', 'validation', 'sop', 'multi-agent']),

(2, 'AI-IDEI.LATENTMAP', 'Mapeaza corpus si deriva traiectorii latente', '[CORPUS_PATHS], [HORIZON_DAYS], [DEPTH], anti_surface=true', 'Embeddings multi-scale + topic mining + dependency graph', '{latent_graph, motifs, strategies, trajectories, actions}', 'modularity>0.35, NMI pe validare >0.6', 'test out-of-domain; fallback interpretabil', '{2,5}', 'Data Analysis', ARRAY['corpus', 'latent', 'trajectories', 'embeddings']),

(3, 'Codul 7:1', 'Generator campanii end-to-end cu KPI', '[PRODUS], [AVATAR], [OBIECTIV], [BUGET], [KPI]', 'Pipeline 7 etape la 1 verdict comercial', '{wound,paradox,strip,unpacking,psych_funnel,metaphor,verdict,assets,tests}', 'uplift CR target +15%', 'fara promisiuni nerealiste; probe sociale atasate', '{2,6}', 'Marketing & Sales', ARRAY['campaign', 'conversion', 'psychology', 'kpi']),

(4, 'Dictionarul Semiotic 8VULTUS', 'Invocabil in GPT + teste memetice', '[BRAND_SYSTEM], [SYMBOL_SET], [DOMENIU]', 'Mapare simbol la functie retorica la exemple validabile', '{symbol,meaning,do_say,dont_say,memetic_tests}', 'recall semnificare >90%', 'coerenta inter-document', '{2,5}', 'Branding & Semiotics', ARRAY['semiotics', 'branding', 'memetic', 'rhetoric']),

(5, 'ORAKON Memory Grid', 'Memorie stratificata + politici de uitare controlata', '[LAYERS:{core,project,session,ephemeral}], [TTL], [RETENTION_POLICY]', 'Rules: ce intra in fiecare layer; LRU + TTL', '{write_rules,read_rules,forget_rules,compaction_jobs}', 'hit-rate >70%, leak=0', 'PII hashing', '{4,5}', 'Memory & Storage', ARRAY['memory', 'storage', 'ttl', 'pii']),

(6, 'PromptForge.Core', 'Core prompt engineering framework', '[CONTEXT], [OBJECTIVE], [CONSTRAINTS], [OUTPUT_FORMAT]', 'Standardized prompt structure with validation', '{prompt,validation,optimization,suggestions}', 'clarity score >85, execution score >80', 'no hallucination, cite sources', '{1,3}', 'Core Framework', ARRAY['core', 'framework', 'validation', 'optimization']),

(7, 'ContentOps.Master', 'Content operations automation', '[CONTENT_TYPE], [TARGET_AUDIENCE], [BRAND_VOICE], [CHANNELS]', 'Multi-channel content generation pipeline', '{content,channels,optimization,analytics}', 'engagement +20%, consistency score >90%', 'brand compliance, audience alignment', '{3,6}', 'Content Operations', ARRAY['content', 'operations', 'automation', 'multi-channel']),

(8, 'SalesEnablement.Pro', 'Sales enablement content generation', '[PRODUCT], [TARGET_ROLE], [SALES_STAGE], [OBJECTION_TYPE]', 'Sales content for every stage and objection', '{content,stage,objection,conversion}', 'conversion rate +25%, sales cycle -15%', 'no false claims, compliance first', '{2,6}', 'Sales Enablement', ARRAY['sales', 'enablement', 'conversion', 'objections']),

(9, 'CustomerSupport.AI', 'AI-powered customer support automation', '[ISSUE_TYPE], [CUSTOMER_SEGMENT], [URGENCY], [COMPLEXITY]', 'Intelligent support response generation', '{response,escalation,resolution,feedback}', 'first response time <2h, satisfaction >90%', 'empathy first, escalate complex issues', '{4,6}', 'Customer Support', ARRAY['support', 'automation', 'ai', 'customer']),

(10, 'Training.Automation', 'Automated training content creation', '[SKILL_LEVEL], [LEARNING_OBJECTIVE], [DURATION], [FORMAT]', 'Adaptive learning content generation', '{content,assessment,progression,feedback}', 'completion rate >85%, skill improvement >30%', 'accessibility compliance, progressive difficulty', '{3,5}', 'Training & Education', ARRAY['training', 'education', 'automation', 'learning']),

(11, 'Documentation.Genius', 'Intelligent documentation generation', '[PRODUCT], [USER_TYPE], [USE_CASE], [FORMAT]', 'Multi-format documentation pipeline', '{docs,examples,troubleshooting,updates}', 'user satisfaction >90%, support tickets -40%', 'accuracy first, user-friendly language', '{1,3}', 'Documentation', ARRAY['documentation', 'generation', 'user-guides', 'technical']),

(12, 'DataAnalysis.Insights', 'Data analysis and insights generation', '[DATA_SOURCE], [ANALYSIS_TYPE], [BUSINESS_QUESTION], [OUTPUT_FORMAT]', 'Statistical analysis and insight generation', '{analysis,insights,visualizations,recommendations}', 'insight accuracy >95%, actionability score >80%', 'statistical rigor, clear interpretation', '{5,6}', 'Data Analysis', ARRAY['data', 'analysis', 'insights', 'statistics']),

(13, 'CrisisManagement.PR', 'Crisis communication and PR management', '[CRISIS_TYPE], [STAKEHOLDERS], [SEVERITY], [TIMELINE]', 'Crisis response and communication strategy', '{response,stakeholders,escalation,recovery}', 'response time <1h, reputation protection >90%', 'transparency, legal compliance', '{7,6}', 'Crisis Management', ARRAY['crisis', 'pr', 'communication', 'management']),

(14, 'ProductDevelopment.AI', 'AI-assisted product development', '[PRODUCT_STAGE], [USER_RESEARCH], [FEATURES], [TIMELINE]', 'Product strategy and feature prioritization', '{strategy,features,roadmap,validation}', 'user adoption >80%, feature success >70%', 'user-centric design, data-driven decisions', '{1,4}', 'Product Development', ARRAY['product', 'development', 'strategy', 'features']),

(15, 'MarketResearch.Intelligence', 'Market research and competitive intelligence', '[MARKET_SEGMENT], [COMPETITORS], [TRENDS], [TIMEFRAME]', 'Market analysis and competitive positioning', '{analysis,insights,positioning,recommendations}', 'insight accuracy >90%, strategic value >85%', 'fact-based analysis, ethical research', '{2,5}', 'Market Research', ARRAY['market', 'research', 'intelligence', 'competitive']),

(16, 'LegalCompliance.AI', 'Legal compliance and risk management', '[JURISDICTION], [REGULATION], [BUSINESS_AREA], [RISK_LEVEL]', 'Compliance assessment and risk mitigation', '{assessment,compliance,risks,mitigation}', 'compliance score >95%, risk reduction >60%', 'legal accuracy, professional advice', '{7,4}', 'Legal & Compliance', ARRAY['legal', 'compliance', 'risk', 'regulation']),

(17, 'Healthcare.Clinical', 'Healthcare clinical content generation', '[SPECIALTY], [PATIENT_TYPE], [CLINICAL_QUESTION], [EVIDENCE_LEVEL]', 'Evidence-based clinical content creation', '{content,evidence,guidelines,recommendations}', 'clinical accuracy >98%, evidence compliance >95%', 'medical accuracy, evidence-based', '{4,7}', 'Healthcare', ARRAY['healthcare', 'clinical', 'medical', 'evidence']),

(18, 'FinancialServices.Analysis', 'Financial services analysis and reporting', '[FINANCIAL_PRODUCT], [ANALYSIS_TYPE], [REGULATORY_FRAMEWORK], [TIMEFRAME]', 'Financial analysis and regulatory reporting', '{analysis,report,compliance,recommendations}', 'accuracy >97%, compliance score >95%', 'regulatory compliance, accuracy first', '{5,7}', 'Financial Services', ARRAY['financial', 'analysis', 'compliance', 'reporting']),

(19, 'Ecommerce.Optimization', 'E-commerce conversion optimization', '[PRODUCT_CATEGORY], [TARGET_AUDIENCE], [CONVERSION_GOAL], [CHANNEL]', 'Conversion optimization and user experience', '{optimization,testing,analytics,improvements}', 'conversion rate +30%, revenue +25%', 'user experience first, ethical optimization', '{2,6}', 'E-commerce', ARRAY['ecommerce', 'conversion', 'optimization', 'ux']),

(20, 'Education.Curriculum', 'Educational curriculum development', '[SUBJECT], [GRADE_LEVEL], [LEARNING_STYLE], [OBJECTIVES]', 'Curriculum design and lesson planning', '{curriculum,lessons,assessments,resources}', 'student engagement >85%, learning outcomes >80%', 'educational standards, accessibility', '{3,5}', 'Education', ARRAY['education', 'curriculum', 'learning', 'teaching']);

-- Continue with modules 21-50 (showing pattern, can be extended)
INSERT INTO modules (id, name, description, requirements, spec, output_schema, kpi, guardrails, vectors, category, tags) VALUES
(21, 'HR.Recruitment', 'AI-powered recruitment and hiring', '[POSITION], [COMPANY_CULTURE], [REQUIREMENTS], [CANDIDATE_POOL]', 'Recruitment strategy and candidate assessment', '{strategy,assessment,process,metrics}', 'time-to-hire -30%, quality score +25%', 'fair assessment, diversity focus', '{4,6}', 'Human Resources', ARRAY['hr', 'recruitment', 'hiring', 'assessment']),

(22, 'Marketing.Automation', 'Marketing automation and campaign management', '[CAMPAIGN_TYPE], [TARGET_AUDIENCE], [BUDGET], [OBJECTIVES]', 'Automated marketing campaign execution', '{campaign,automation,analytics,optimization}', 'roi +40%, automation efficiency +60%', 'brand consistency, audience respect', '{2,6}', 'Marketing', ARRAY['marketing', 'automation', 'campaigns', 'roi']),

(23, 'CustomerSuccess.Strategy', 'Customer success and retention strategy', '[CUSTOMER_SEGMENT], [LIFECYCLE_STAGE], [SUCCESS_METRICS], [RETENTION_GOALS]', 'Customer success and retention optimization', '{strategy,metrics,interventions,improvements}', 'retention rate +25%, customer satisfaction +30%', 'customer-centric approach, value focus', '{4,6}', 'Customer Success', ARRAY['customer', 'success', 'retention', 'satisfaction']),

(24, 'Operations.Efficiency', 'Business operations optimization', '[PROCESS_AREA], [EFFICIENCY_METRICS], [RESOURCES], [GOALS]', 'Process optimization and efficiency improvement', '{analysis,optimization,implementation,metrics}', 'efficiency +35%, cost reduction +20%', 'sustainable improvement, employee impact', '{1,4}', 'Operations', ARRAY['operations', 'efficiency', 'optimization', 'processes']),

(25, 'Innovation.Strategy', 'Innovation strategy and R&D management', '[INNOVATION_AREA], [RESOURCES], [TIMEFRAME], [SUCCESS_CRITERIA]', 'Innovation strategy and R&D pipeline', '{strategy,pipeline,metrics,success}', 'innovation success rate +40%, time-to-market -25%', 'risk management, strategic alignment', '{1,4}', 'Innovation', ARRAY['innovation', 'strategy', 'rd', 'pipeline']);

-- ============================================================================
-- SEED INDUSTRY PACKS
-- ============================================================================

INSERT INTO industry_packs (name, slug, description, industry, modules, parameter_sets, is_public, metadata) VALUES
('E-commerce Excellence', 'ecommerce-excellence', 'Complete e-commerce optimization pack with conversion focus', 'ecommerce', 
  ARRAY[19, 22, 23, 24, 25], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["conversion_optimization", "customer_retention", "marketing_automation"], "target_audience": "ecommerce_managers", "difficulty": "intermediate"}'
),

('Education Innovation', 'education-innovation', 'Educational technology and curriculum development pack', 'education', 
  ARRAY[20, 10, 11, 24, 25], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["curriculum_design", "learning_optimization", "educational_technology"], "target_audience": "educators", "difficulty": "beginner"}'
),

('Financial Services Pro', 'financial-services-pro', 'Financial analysis and compliance management pack', 'fintech', 
  ARRAY[18, 16, 12, 24, 25], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["financial_analysis", "compliance_management", "risk_assessment"], "target_audience": "financial_analysts", "difficulty": "advanced"}'
),

('Healthcare Innovation', 'healthcare-innovation', 'Healthcare content and clinical decision support pack', 'healthcare', 
  ARRAY[17, 12, 11, 24, 25], 
  ARRAY[]::UUID[], 
  '{"use_cases": ["clinical_content", "evidence_based_practice", "healthcare_innovation"], "target_audience": "healthcare_professionals", "difficulty": "advanced"}'
),

('Legal & Compliance', 'legal-compliance', 'Legal compliance and risk management pack', 'legal', 
  ARRAY[16, 12, 24, 25], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["compliance_management", "risk_assessment", "legal_research"], "target_audience": "legal_professionals", "difficulty": "advanced"}'
),

('Marketing Mastery', 'marketing-mastery', 'Complete marketing automation and optimization pack', 'marketing', 
  ARRAY[22, 7, 8, 19, 23], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["campaign_automation", "content_optimization", "conversion_optimization"], "target_audience": "marketing_professionals", "difficulty": "intermediate"}'
),

('Sales Enablement Pro', 'sales-enablement-pro', 'Sales enablement and conversion optimization pack', 'sales', 
  ARRAY[8, 22, 23, 19, 24], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["sales_content", "conversion_optimization", "customer_success"], "target_audience": "sales_professionals", "difficulty": "intermediate"}'
),

('Startup Growth', 'startup-growth', 'Startup growth and scaling strategies pack', 'startup', 
  ARRAY[25, 22, 23, 24, 19], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["growth_strategy", "scaling_operations", "market_expansion"], "target_audience": "startup_founders", "difficulty": "beginner"}'
),

('Enterprise Operations', 'enterprise-operations', 'Enterprise operations and efficiency optimization pack', 'enterprise', 
  ARRAY[24, 25, 12, 16, 17], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["operations_optimization", "compliance_management", "efficiency_improvement"], "target_audience": "operations_managers", "difficulty": "advanced"}'
),

('Content Creation', 'content-creation', 'Content creation and optimization pack', 'content', 
  ARRAY[7, 10, 11, 22, 23], 
  ARRAY[]::UUID[], 
  true, 
  '{"use_cases": ["content_generation", "optimization", "multi_channel_distribution"], "target_audience": "content_creators", "difficulty": "beginner"}'
);

-- ============================================================================
-- SEED DEFAULT PARAMETER SETS
-- ============================================================================

-- Generic parameter sets for common use cases
INSERT INTO parameter_sets (module_id, name, domain, scale, urgency, complexity, resources, application, output_format, is_default, is_public) VALUES
(1, 'Research Standard', 'generic', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(2, 'Data Analysis Basic', 'generic', 'team', 'normal', 'medium', 'standard', 'analysis', 'bundle', true, true),
(3, 'Marketing Campaign', 'marketing', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(4, 'Brand Development', 'marketing', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(5, 'Memory Management', 'technical', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(6, 'Core Framework', 'generic', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(7, 'Content Operations', 'marketing', 'team', 'normal', 'medium', 'standard', 'content_ops', 'bundle', true, true),
(8, 'Sales Enablement', 'sales', 'team', 'normal', 'medium', 'standard', 'sales_enablement', 'bundle', true, true),
(9, 'Customer Support', 'support', 'team', 'high', 'medium', 'standard', 'customer_support', 'bundle', true, true),
(10, 'Training Development', 'education', 'team', 'normal', 'medium', 'standard', 'training', 'bundle', true, true);

-- ============================================================================
-- SEED RULESET VERSION
-- ============================================================================

INSERT INTO ruleset_versions (version, checksum, content_hash, metadata, is_active, activated_at) VALUES
('1.0.0', 'a1b2c3d4e5f6...', 'hash123...', 
  '{"release_notes": "Initial PROMPTFORGE v3 ruleset", "features": ["7D validation", "entitlements", "export_bundle"], "compatibility": "v3.0+"}', 
  true, NOW()
);

-- ============================================================================
-- SEED SAMPLE ORGANIZATION (for testing)
-- ============================================================================

INSERT INTO orgs (name, slug, domain, plan_id, status) VALUES
('PromptForge Demo', 'demo', 'demo.promptforge.dev', 'pro', 'active'),
('Test Organization', 'test-org', 'test.example.com', 'free', 'active');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify seeds were created
SELECT 'Plans' as table_name, COUNT(*) as count FROM plans
UNION ALL
SELECT 'Modules' as table_name, COUNT(*) as count FROM modules
UNION ALL
SELECT 'Industry Packs' as table_name, COUNT(*) as count FROM industry_packs
UNION ALL
SELECT 'Parameter Sets' as table_name, COUNT(*) as count FROM parameter_sets
UNION ALL
SELECT 'Ruleset Versions' as table_name, COUNT(*) as count FROM ruleset_versions
UNION ALL
SELECT 'Organizations' as table_name, COUNT(*) as count FROM orgs;
