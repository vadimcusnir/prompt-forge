# 🚀 PromptForge CI/CD Pipeline

Sistemul complet de CI/CD cu **11 workflow-uri GitHub Actions** pentru automatizarea completă a development-ului și deployment-ului.

## 📋 Workflow-uri Disponibile

### 1. 🔧 **Dependencies Management** (`01-dependencies.yml`)
- **Trigger**: Push/PR + Daily (2:00 AM UTC)
- **Scop**: Verifică dependențele, audit de securitate, cache management
- **Output**: Security audit reports, dependency validation

### 2. 🧪 **Testing & Quality** (`02-testing.yml`)
- **Trigger**: Push/PR
- **Scop**: Linting, type checking, unit tests, E2E tests
- **Output**: Test coverage, quality reports

### 3. 🔒 **Security Scanning** (`03-security.yml`)
- **Trigger**: Push/PR + Daily (3:00 AM UTC)
- **Scop**: CodeQL, SAST, dependency scanning, container security
- **Output**: Security reports, vulnerability alerts

### 4. ⚡ **Performance Testing** (`04-performance.yml`)
- **Trigger**: Push/PR + Daily (4:00 AM UTC)
- **Scop**: Lighthouse audit, bundle analysis, Core Web Vitals
- **Output**: Performance reports, optimization recommendations

### 5. 🗄️ **Database Management** (`05-database.yml`)
- **Trigger**: Push/PR (migrations) + Daily (5:00 AM UTC)
- **Scop**: Migration testing, health checks, backup simulation
- **Output**: Database reports, migration validation

### 6. 🚀 **Build & Deploy** (`06-build-deploy.yml`)
- **Trigger**: Push to main + PR
- **Scop**: Build, staging deployment, production deployment
- **Output**: Deployed applications, deployment reports

### 7. 💾 **Backup & Recovery** (`07-backup.yml`)
- **Trigger**: Daily (6:00 AM UTC) + Manual
- **Scop**: Database backup, file backup, Vercel config backup
- **Output**: Backup files, integrity reports

### 8. 📊 **Monitoring & Health Checks** (`08-monitoring.yml`)
- **Trigger**: Every 15 minutes + Manual
- **Scop**: API health, database health, frontend health, performance
- **Output**: Health reports, alerting

### 9. 🗂️ **Cache Management** (`09-cache.yml`)
- **Trigger**: Daily (7:00 AM UTC) + Manual
- **Scop**: Cache cleanup, optimization, validation
- **Output**: Cache reports, optimization recommendations

### 10. 🧹 **Cleanup & Maintenance** (`10-cleanup.yml`)
- **Trigger**: Weekly (Sunday 8:00 AM UTC) + Manual
- **Scop**: Artifacts cleanup, logs cleanup, temp files cleanup
- **Output**: Maintenance reports, cleanup summaries

### 11. 📢 **Notifications & Reporting** (`11-notifications.yml`)
- **Trigger**: Workflow completion + Daily (9:00 PM UTC) + Manual
- **Scop**: Daily/weekly reports, deployment notifications, alerts
- **Output**: Aggregated reports, notifications

## 🔑 Secrets Necesare

### Vercel
```bash
VERCEL_TOKEN=vercel_xxxxx
VERCEL_ORG_ID=team_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx
```

### Supabase
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### OpenAI
```bash
OPENAI_API_KEY=sk-xxxxx
```

### Notifications
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxxxx
```

### Security Tools (Optional)
```bash
SEMGREP_APP_TOKEN=xxxxx
SNYK_TOKEN=xxxxx
```

## 🚀 Setup Rapid

### 1. Adaugă Secrets în GitHub
```bash
# În GitHub → Settings → Secrets and variables → Actions
# Adaugă toate secret-urile de mai sus
```

### 2. Configurează Environments
```bash
# Creează environment-urile:
# - preview (pentru staging)
# - production (pentru production)
```

### 3. Activează Workflow-urile
```bash
# Toate workflow-urile sunt activate automat
# Verifică în Actions tab
```

## 📊 Pipeline Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dependencies  │───▶│     Testing     │───▶│    Security     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Performance   │───▶│     Database    │───▶│  Build & Deploy │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Backup      │───▶│    Monitoring   │───▶│      Cache      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Cleanup     │───▶│  Notifications  │───▶│   Maintenance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Branch Strategy

### `main` Branch
- ✅ **Auto-deploy** la production
- ✅ **Full pipeline** execution
- ✅ **Security scanning** mandatory
- ✅ **Performance testing** mandatory

### `develop` Branch
- ✅ **Auto-deploy** la staging
- ✅ **Full pipeline** execution
- ✅ **Testing** mandatory

### `hotfix/*` Branches
- ✅ **Limited pipeline** (dependencies + testing + security)
- ✅ **Manual deployment** required
- ✅ **Fast feedback** loop

### `feature/*` Branches
- ✅ **Basic pipeline** (dependencies + testing)
- ✅ **No deployment**
- ✅ **Code quality** focus

## 📈 Monitoring & Alerts

### Health Checks
- **API endpoints**: Every 15 minutes
- **Database**: Daily
- **Performance**: Daily
- **Security**: Daily

### Alerting
- **Slack**: Deployment success/failure
- **Slack**: Security alerts
- **Slack**: Performance alerts
- **Email**: Critical security issues

### Reports
- **Daily**: System status, key metrics
- **Weekly**: Performance trends, deployment summary
- **Monthly**: Comprehensive system health

## 🛠️ Customization

### Workflow Triggers
```yaml
# Modifică cron schedules în fiecare workflow
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
```

### Job Dependencies
```yaml
# Modifică needs pentru a schimba ordinea
needs: [dependency-check, security-audit]
```

### Environment Variables
```yaml
# Adaugă variabile noi în build job
env:
  NEW_VAR: ${{ secrets.NEW_VAR }}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Build Fails**
```bash
# Verifică:
- Dependencies în package.json
- Environment variables
- Build logs în Actions tab
```

#### 2. **Deployment Fails**
```bash
# Verifică:
- Vercel secrets
- Environment configuration
- Build artifacts
```

#### 3. **Security Scan Fails**
```bash
# Verifică:
- Dependency vulnerabilities
- Code security issues
- Secret leaks
```

### Debug Commands
```bash
# Local testing
pnpm install --frozen-lockfile
pnpm build
pnpm test

# Cache cleanup
pnpm store prune
rm -rf .next/cache
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Next.js Build Optimization](https://nextjs.org/docs/advanced-features/compiler)

## 🤝 Contributing

Pentru a modifica workflow-urile:

1. **Fork** repository-ul
2. **Create** feature branch
3. **Modify** workflow-urile
4. **Test** local cu act
5. **Submit** PR cu descriere detaliată

## 📞 Support

Pentru probleme cu CI/CD:

1. **Check** Actions tab pentru logs
2. **Review** workflow configuration
3. **Verify** secrets și environment variables
4. **Create** issue cu logs relevante
