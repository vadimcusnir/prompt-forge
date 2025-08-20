# PROMPTFORGE™ v3 — Cloud History + Multi-User Implementation

## Overview

Implementarea cloud history și multi-user pentru PROMPTFORGE™ v3 oferă:

- **Cloud History**: Persistența și accesul la toate runs, scores și bundles
- **Multi-User**: Suport pentru organizații cu multiple utilizatori și roluri
- **RLS**: Row Level Security pentru izolarea datelor între organizații
- **Reporting**: Views pentru raportare per proiect și organizație

## Arhitectura

### Tabele Principale

#### 1. Runs (Execuții)
```sql
runs (
  id uuid PK,
  org_id uuid FK(orgs),
  user_id uuid FK(auth.users),
  project_id uuid FK(projects),
  module_id text FK(modules),
  parameter_set_id uuid FK(parameter_sets),
  type text CHECK('generation','test','agent_execution'),
  status text CHECK('queued','success','error'),
  model text,
  tokens_used int,
  cost_usd numeric(10,4),
  duration_ms int,
  telemetry jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz
)
```

#### 2. Prompt Scores (Scoruri Evaluator AI)
```sql
scores (
  run_id uuid PK FK(runs),
  clarity int CHECK(0-100),
  execution int CHECK(0-100),
  ambiguity int CHECK(0-100),
  alignment int CHECK(0-100),
  business_fit int CHECK(0-100),
  composite numeric(5,2),
  verdict text CHECK('pass','partial_pass','fail'),
  feedback jsonb
)
```

#### 3. Bundles (Exporturi)
```sql
bundles (
  id uuid PK,
  run_id uuid FK(runs),
  org_id uuid FK(orgs),
  project_id uuid FK(projects),
  user_id uuid FK(auth.users),
  formats text[], -- {md,json,pdf,zip}
  paths jsonb, -- {md:'url',json:'url',pdf:'url'}
  checksum text,
  version text, -- semver
  exported_at timestamptz,
  license_notice text
)
```

#### 4. Parameter Sets (Engine 7D)
```sql
parameter_sets (
  id uuid PK,
  org_id uuid FK(orgs),
  domain text FK(domain_configs.industry),
  scale text CHECK('personal_brand','solo','startup','boutique_agency','smb','corporate','enterprise'),
  urgency text CHECK('low','planned','sprint','pilot','crisis'),
  complexity text CHECK('foundational','standard','advanced','expert'),
  resources text CHECK('minimal','solo','lean_team','agency_stack','full_stack_org','enterprise_budget'),
  application text CHECK('training','audit','implementation','strategy','crisis_response','experimentation','documentation'),
  output_formats text[],
  overrides jsonb
)
```

### Tabele de Suport

#### 5. Organization Members
```sql
org_members (
  id uuid PK,
  org_id uuid FK(orgs),
  user_id uuid FK(auth.users),
  role text CHECK('owner','admin','member','viewer'),
  created_at timestamptz
)
```

#### 6. Plans & Entitlements
```sql
plans (
  code text PK,
  name text,
  flags jsonb -- {"canExportPDF":true,"hasCloudHistory":true}
)

entitlements (
  id uuid PK,
  org_id uuid FK(orgs),
  user_id uuid FK(auth.users), -- null pentru org-wide
  flag text,
  value boolean,
  source text CHECK('plan','addon','license'),
  expires_at timestamptz
)
```

## RLS (Row Level Security)

### Principii de Bază

1. **Org Isolation**: Fiecare organizație vede doar datele sale
2. **User Scoping**: Utilizatorii văd doar datele din organizațiile lor
3. **Role-Based Access**: Rolurile determină ce poate face utilizatorul

### Policies Implementate

#### Runs
```sql
-- User poate vedea doar runs din org-ul său
create policy runs_read on runs
  for select using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );
```

#### Bundles
```sql
-- User poate vedea doar bundles din org-ul său
create policy bundles_rw on bundles
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );
```

#### Parameter Sets
```sql
-- User poate vedea doar parameter_sets din org-ul său
create policy parameter_sets_rw on parameter_sets
  for all using (
    org_id::text = current_setting('request.jwt.claims', true)::jsonb->>'org_id'
  );
```

## Views pentru Raportare

### 1. Project Runs
```sql
v_project_runs
-- Toate runs-urile unui proiect cu detalii complete
```

### 2. Project Scores
```sql
v_project_scores
-- Toate scorurile unui proiect cu analiză
```

### 3. Project Bundles
```sql
v_project_bundles
-- Toate exporturile unui proiect
```

### 4. Project Analytics
```sql
v_project_analytics
-- Statistici agregate per proiect:
-- - Total runs (successful, failed)
-- - Total bundles
-- - Average score
-- - Total cost
-- - Total tokens
```

### 5. User Activity
```sql
v_user_activity
-- Activitatea utilizatorilor în organizație
```

### 6. Organization Overview
```sql
v_org_overview
-- Overview complet al organizației
```

## Entitlements System

### Feature Flags

```json
{
  "canExportPDF": true,
  "canExportJSON": true,
  "canUseGptTestReal": true,
  "hasCloudHistory": true,
  "hasEvaluatorAI": true,
  "hasAPI": true,
  "maxRunsPerDay": 100,
  "maxProjects": 5,
  "customModules": true
}
```

### Verificare Entitlements

```sql
-- Verifică dacă org-ul are cloud history
select check_entitlement('hasCloudHistory');

-- Verifică dacă user-ul poate exporta PDF
select can_export_pdf(org_id, user_id);

-- Verifică dacă user-ul poate folosi Evaluator AI
select can_use_evaluator_ai(org_id, user_id);
```

## API Endpoints

### 1. Cloud History

```typescript
// GET /api/cloud-history/runs
interface RunsResponse {
  runs: Run[];
  pagination: Pagination;
  filters: RunFilters;
}

// GET /api/cloud-history/scores
interface ScoresResponse {
  scores: Score[];
  analytics: ScoreAnalytics;
}

// GET /api/cloud-history/bundles
interface BundlesResponse {
  bundles: Bundle[];
  formats: string[];
  downloadUrls: Record<string, string>;
}
```

### 2. Multi-User Management

```typescript
// GET /api/org/members
interface MembersResponse {
  members: OrgMember[];
  roles: Role[];
  permissions: Permission[];
}

// POST /api/org/members
interface AddMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

// PUT /api/org/members/:id
interface UpdateMemberRequest {
  role: 'admin' | 'member' | 'viewer';
}
```

### 3. Project Analytics

```typescript
// GET /api/projects/:id/analytics
interface ProjectAnalytics {
  project: Project;
  runs: RunAnalytics;
  scores: ScoreAnalytics;
  bundles: BundleAnalytics;
  costs: CostAnalytics;
  trends: TrendData[];
}
```

## Implementare Frontend

### 1. Cloud History Dashboard

```tsx
const CloudHistoryDashboard = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  
  // Fetch data cu RLS automat
  useEffect(() => {
    fetchCloudHistory();
  }, []);
  
  return (
    <div className="cloud-history-dashboard">
      <RunsTable runs={runs} />
      <ScoresChart scores={scores} />
      <BundlesGrid bundles={bundles} />
    </div>
  );
};
```

### 2. Multi-User Management

```tsx
const OrgMembersManagement = () => {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  const addMember = async (email: string, role: Role) => {
    await api.post('/org/members', { email, role });
    await fetchMembers();
  };
  
  const updateMemberRole = async (memberId: string, role: Role) => {
    await api.put(`/org/members/${memberId}`, { role });
    await fetchMembers();
  };
  
  return (
    <div className="org-members">
      <MembersTable 
        members={members} 
        onRoleUpdate={updateMemberRole}
        canManage={isAdmin}
      />
      <InviteMemberForm onInvite={addMember} />
    </div>
  );
};
```

### 3. Project Analytics

```tsx
const ProjectAnalytics = ({ projectId }: { projectId: string }) => {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  
  useEffect(() => {
    fetchProjectAnalytics(projectId);
  }, [projectId]);
  
  if (!analytics) return <LoadingSpinner />;
  
  return (
    <div className="project-analytics">
      <MetricsGrid metrics={analytics.metrics} />
      <RunsChart data={analytics.runs} />
      <ScoresDistribution scores={analytics.scores} />
      <CostBreakdown costs={analytics.costs} />
    </div>
  );
};
```

## Migrații

### Ordinea de Execuție

1. `0018_cloud_history_multi_user.sql` - Schema și tabele
2. `0019_cloud_history_rls.sql` - RLS policies
3. `0020_cloud_history_seed.sql` - Seed data și funcții

### Verificare Implementare

```bash
# Verifică dacă migrațiile au rulat cu succes
psql -d promptforge -c "SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('runs', 'scores', 'bundles', 'parameter_sets', 'org_members', 'plans', 'entitlements');"

# Verifică RLS policies
psql -d promptforge -c "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename IN ('runs', 'scores', 'bundles');"

# Verifică views
psql -d promptforge -c "SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'v_%';"
```

## Testing

### 1. RLS Testing

```sql
-- Test cu JWT fără org_id
set request.jwt.claims = '{"sub":"user123"}';
select * from runs; -- Ar trebui să returneze 0 rows

-- Test cu JWT cu org_id valid
set request.jwt.claims = '{"sub":"user123","org_id":"org456"}';
select * from runs; -- Ar trebui să returneze doar runs din org456
```

### 2. Entitlements Testing

```sql
-- Test entitlements
select check_entitlement('hasCloudHistory');
select can_export_pdf(org_id, user_id);
select check_runs_limit(org_id, user_id);
```

### 3. Views Testing

```sql
-- Test views cu RLS
set request.jwt.claims = '{"sub":"user123","org_id":"org456"}';
select * from v_project_analytics;
select * from v_user_activity;
```

## Monitorizare și Maintenance

### 1. Cleanup Automat

```sql
-- Curăță datele vechi pentru org-urile fără cloud history
select cleanup_old_data();

-- Programează cleanup zilnic (cu pg_cron)
select cron.schedule('cleanup-old-data', '0 2 * * *', 'select cleanup_old_data();');
```

### 2. Audit Trail

```sql
-- Log audit events
select log_audit_event('runs', 'INSERT', 'run123', null, '{"status":"success"}');
```

### 3. Performance Monitoring

```sql
-- Verifică indexuri
select schemaname, tablename, indexname, indexdef 
from pg_indexes 
where tablename IN ('runs', 'scores', 'bundles');

-- Verifică query performance
explain analyze select * from v_project_analytics where project_id = 'proj123';
```

## Securitate

### 1. JWT Claims

```typescript
interface JWTPayload {
  sub: string;        // user_id
  org_id: string;     // organization_id
  role: string;       // user role in org
  permissions: string[]; // specific permissions
}
```

### 2. API Security

- Toate endpoint-urile verifică JWT
- RLS asigură izolarea datelor
- Rate limiting per org/user
- Audit logging pentru toate operațiile

### 3. Data Privacy

- Soft delete pentru datele importante
- Anonymization pentru datele vechi
- GDPR compliance prin RLS
- Data retention policies

## Deployment

### 1. Supabase

```bash
# Aplică migrațiile
supabase db reset
supabase db push

# Verifică status
supabase status
```

### 2. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Stripe Integration

```bash
# Setup Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhooks
stripe trigger customer.subscription.created
```

## Concluzie

Implementarea cloud history și multi-user oferă:

✅ **Scalabilitate**: Suport pentru organizații mari cu multiple utilizatori  
✅ **Securitate**: RLS pentru izolarea datelor între organizații  
✅ **Flexibilitate**: Entitlements system pentru feature control  
✅ **Raportare**: Views comprehensive pentru analytics  
✅ **Maintenance**: Cleanup automat și audit trail  
✅ **Compliance**: GDPR și securitate enterprise-grade  

Sistemul este gata pentru producție și poate fi extins cu funcționalități suplimentare conform cerințelor business-ului.
