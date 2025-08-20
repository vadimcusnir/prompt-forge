# PROMPTFORGE v3 — GitHub Actions Workflows

Pipeline-ul complet de CI/CD pentru PROMPTFORGE v3 cu deployment automat pe Vercel și Supabase.

## 🚀 Workflow-uri Active

### 1. **Build & Deploy** (`build-deploy.yml`)
**Trigger:** Push la main/develop, PR, manual
**Scop:** Build, deploy pe Vercel, migrații Supabase

```mermaid
graph TD
    A[Push/PR] --> B[Validate & Test]
    B --> C[Deploy to Vercel]
    B --> D[Supabase Migration]
    C --> E[Notify Success]
    D --> E
    E --> F[Update Status]
```

**Jobs:**
- ✅ **Validate & Test** - Type check, lint, test, schema validation
- 🚀 **Deploy to Vercel** - Build și deploy automat pe production
- 🗄️ **Supabase Migration** - Migrații DB cu schema.sql
- 📢 **Notify Success** - Notificări și status updates

---

### 2. **Testing & Quality** (`testing.yml`)
**Trigger:** Push la main/develop, PR, weekly (Monday 2 AM)
**Scop:** Testare completă, security scanning, quality gates

### 3. **Quality Gates** (`quality-gates.yml`)
**Trigger:** PR la main/develop, manual
**Scop:** Quality gates, block merge, GitHub comments, labels

```mermaid
graph TD
    A[Trigger] --> B[Unit Tests]
    A --> C[Security Scan]
    A --> D[Code Quality]
    A --> E[Performance Tests]
    A --> F[Database Tests]
    B --> G[Quality Gate]
    C --> G
    D --> G
    E --> G
    F --> G
    G --> H[Report & Notify]
```

**Jobs:**
- 🧪 **Run Tests** - Unit, integration, E2E tests (Node 18 & 20)
- 🔒 **Security Scan** - npm audit, Snyk, CodeQL analysis
- ✨ **Code Quality** - ESLint, Prettier, TypeScript, console.log check
- ⚡ **Performance Tests** - Lighthouse CI, bundle analysis
- 🗄️ **Database Tests** - Local Supabase testing
- 🚦 **Quality Gate** - Verificare finală și raportare

---

### 4. **Monitoring & Backup** (`monitoring.yml`)
**Trigger:** Daily (3 AM), weekly (Sunday 12 PM), manual
**Scop:** Monitoring, backup-uri, health checks

### 5. **Security Alerts** (`security-alerts.yml`)
**Trigger:** Push la main/develop, PR, every 6 hours, manual
**Scop:** Security scanning, block deployment, automatic rollback

### 6. **Monitoring Alerts** (`monitoring-alerts.yml`)
**Trigger:** Every 2 hours, daily 9 AM, workflow completion, manual
**Scop:** System health, GitHub Issues, Slack notifications, automated reports

```mermaid
graph TD
    A[Schedule] --> B[Database Backup]
    A --> C[Performance Monitoring]
    A --> D[Health Checks]
    A --> E[Security Monitoring]
    B --> F[Notifications]
    C --> F
    D --> F
    E --> F
    F --> G[Slack + GitHub]
```

**Jobs:**
- 💾 **Database Backup** - Backup automat Supabase cu verificare integritate
- 📊 **Performance Monitoring** - Teste performance și bundle analysis
- 🏥 **Health Checks** - Supabase, API, database connections
- 🔒 **Security Monitoring** - Vulnerabilities, dependency updates
- 📢 **Notifications** - Slack + GitHub Issues pentru alerts

---

### 7. **Workflow Orchestration** (`orchestration.yml`)
**Trigger:** Push la main/develop, PR, manual dispatch
**Scop:** Orchestration completă, label management, workflow coordination

### 8. **Label Management** (`label-management.yml`)
**Trigger:** Weekly (Sunday 2 AM), workflow changes, manual
**Scop:** Label creation, validation, maintenance, reporting

### 9. **Cache & Dependencies** (`cache.yml`)
**Trigger:** Weekly (Sunday 4 AM), package.json changes, manual
**Scop:** Optimizare cache, dependency management

```mermaid
graph TD
    A[Trigger] --> B[Dependency Updates]
    A --> C[Cache Optimization]
    A --> D[Performance Optimization]
    A --> E[Automated Updates]
    A --> F[Cache Cleanup]
    B --> G[Summary Report]
    C --> G
    D --> G
    E --> G
    F --> G
```

**Jobs:**
- 📦 **Dependency Updates** - Check outdated, security vulnerabilities
- 🚀 **Cache Optimization** - Build cache analysis și optimizare
- ⚡ **Performance Optimization** - Bundle size, unused dependencies
- 🤖 **Automated Updates** - PR automat pentru major updates
- 🧹 **Cache Cleanup** - Cleanup npm, build cache, temp files

---

## 🔧 Configurare

### Secrets Required
```bash
# Vercel
VERCEL_TOKEN=riCE7PWBxBmCvexa8yHW2ARt
VERCEL_ORG_ID=X8NgCPLYds5qboTU474kMjxA
VERCEL_PROJECT_ID=prj_I0F9ksxoN16PEXMhTfBcSmECSaOV

# Supabase
SUPABASE_URL=https://siebamncfgfgbzorkiwo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=<your-access-token>

# Stripe
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_LABaaLypGKgyw6qnPt0ugpOT6ozDQvrq

# OpenAI
OPENAI_API_KEY=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

# Optional
SNYK_TOKEN=<your-snyk-token>
SLACK_WEBHOOK_URL=<your-slack-webhook>
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://siebamncfgfgbzorkiwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RnpkGGcCmkUZPV6SHA1YkmOhd30qN2kAxm5n6iE4ZHNjzU84ZFWifiZQ22cKntXM38KfRkIriTeOHqiBrdPHWWG00dw7WcY9p
```

---

## 📋 Pipeline Flow

### Development Flow
```mermaid
graph LR
    A[Feature Branch] --> B[Push/PR]
    B --> C[Validate & Test]
    C --> D[Quality Gate]
    D --> E[Deploy Preview]
    E --> F[Review & Approve]
    F --> G[Merge to Main]
    G --> H[Production Deploy]
    H --> I[Database Migration]
```

### Production Flow
```mermaid
graph LR
    A[Main Branch] --> B[Automated Tests]
    B --> C[Security Scan]
    C --> D[Build & Deploy]
    D --> E[Health Checks]
    E --> F[Monitoring]
    F --> G[Backup & Maintenance]
```

---

## 🚨 Alerts & Notifications

### Quality Gate Failure
- ❌ **Block merge** dacă tests/security/quality eșuează
- 📢 **GitHub comments** cu detalii eșec
- 🏷️ **Labels** pentru tracking
- 🚫 **Automatic blocking** cu labels `🚫 blocked` și `quality-gate-failed`

### Monitoring Alerts
- 🚨 **GitHub Issues** pentru failures
- 📱 **Slack notifications** pentru monitoring
- 📊 **Automated reports** cu status
- 🔍 **System health monitoring** (Supabase, Vercel, API, Workflows)
- ⚠️ **Warning alerts** pentru system degradation

### Security Alerts
- 🔒 **Block deployment** pentru vulnerabilități
- 📢 **Security team notification**
- 🚫 **Automatic rollback** pentru issues critice
- 🚨 **Critical security blocking** cu labels `🚫 security-blocked`
- 🔍 **Comprehensive scanning** (npm audit, Snyk, secrets, permissions)

---

## 🔄 Maintenance

### Weekly Tasks
- **Sunday 2 AM** - Label management, system maintenance
- **Sunday 4 AM** - Cache optimization, dependency updates
- **Monday 2 AM** - Weekly testing & quality checks

### Daily Tasks
- **3 AM** - Database backup, health checks
- **Every 2 hours** - System health monitoring
- **Every 6 hours** - Security scanning
- **Continuous** - Security monitoring, performance tracking

### Monthly Tasks
- **Dependency audit** - Security review
- **Performance review** - Bundle size analysis
- **Cache cleanup** - Optimization review
- **Label audit** - System cleanup and optimization

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

## 🆘 Troubleshooting

### Common Issues
1. **Build fails** - Check Node.js version, dependencies
2. **Deploy fails** - Verify Vercel tokens, project ID
3. **Migration fails** - Check Supabase access, schema.sql
4. **Tests fail** - Review test configuration, environment

### Support
- 📧 **Issues** - Create GitHub issue cu label-ul corespunzător
- 🔍 **Logs** - Check Actions tab pentru detalii
- 📊 **Status** - Monitor workflow execution în real-time
