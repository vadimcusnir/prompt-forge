# 🚀 GitHub Actions Setup - PromptForge

## ⚡ Setup Rapid (5 minute)

### 1. 🔑 Adaugă Secrets în GitHub

În repository → **Settings** → **Secrets and variables** → **Actions**:

#### **Vercel (Obligatoriu)**
```bash
VERCEL_TOKEN=vercel_xxxxx
VERCEL_ORG_ID=team_xxxxx  
VERCEL_PROJECT_ID=prj_xxxxx
```

#### **Supabase (Obligatoriu)**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

#### **Stripe (Obligatoriu)**
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

#### **OpenAI (Obligatoriu)**
```bash
OPENAI_API_KEY=sk-xxxxx
```

#### **Notifications (Opțional)**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxxxx
```

### 2. 🌍 Configurează Environments

În repository → **Settings** → **Environments**:

#### **preview** (pentru staging)
- **Protection rules**: None
- **Environment variables**: Empty

#### **production** (pentru production)
- **Protection rules**: 
  - ✅ Require reviewers
  - ✅ Restrict deployments to matching branches
- **Environment variables**: Empty

### 3. ✅ Activează Workflow-urile

În repository → **Actions**:
- Toate workflow-urile sunt activate automat
- Verifică că apar în lista de workflows

## 🔄 Pipeline Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dependencies  │───▶│     Testing     │───▶│    Security     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Performance   │───▶│     Database    │───▶│  Build & Deploy │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Branch Strategy

| Branch | Pipeline | Deploy | Notes |
|--------|----------|---------|-------|
| `main` | Full | Production | Auto-deploy, full security |
| `develop` | Full | Staging | Auto-deploy, testing focus |
| `hotfix/*` | Limited | Manual | Fast feedback, security check |
| `feature/*` | Basic | None | Code quality only |

## 📊 Monitoring Schedule

| Workflow | Frequency | Purpose |
|----------|-----------|---------|
| **Dependencies** | Daily 2:00 AM | Security updates |
| **Security** | Daily 3:00 AM | Vulnerability scan |
| **Performance** | Daily 4:00 AM | Performance check |
| **Database** | Daily 5:00 AM | Health check |
| **Backup** | Daily 6:00 AM | Data backup |
| **Cache** | Daily 7:00 AM | Cache cleanup |
| **Cleanup** | Weekly Sunday 8:00 AM | Maintenance |
| **Monitoring** | Every 15 minutes | Health check |
| **Reports** | Daily 9:00 PM | Status report |

## 🚨 Alerts & Notifications

### **Slack Notifications**
- ✅ Deployment success/failure
- 🚨 Security alerts
- ⚠️ Performance warnings

### **Email Alerts**
- 🚨 Critical security issues
- 📊 Weekly reports

## 🔍 Troubleshooting

### **Build Fails**
```bash
# Verifică:
1. Dependencies în package.json
2. Environment variables în secrets
3. Build logs în Actions tab
4. Node.js version compatibility
```

### **Deployment Fails**
```bash
# Verifică:
1. Vercel secrets (TOKEN, ORG_ID, PROJECT_ID)
2. Environment configuration
3. Build artifacts
4. Vercel project settings
```

### **Security Scan Fails**
```bash
# Verifică:
1. Dependency vulnerabilities (pnpm audit)
2. Code security issues
3. Secret leaks în code
4. Security tool configuration
```

## 📱 Local Testing

### **Test Workflow Local**
```bash
# Instalează act (GitHub Actions local)
brew install act

# Rulează workflow local
act -j build
act -j test
```

### **Test Build Local**
```bash
# Verifică build local
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

## 🎉 Success Indicators

### **✅ Pipeline Success**
- All workflows pass
- Build artifacts generated
- Deployment successful
- Health checks pass

### **📊 Monitoring Success**
- 15min health checks pass
- Daily security scans clean
- Performance metrics good
- Backup operations successful

## 🔧 Customization

### **Modifică Cron Schedules**
```yaml
# În fiecare workflow
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
```

### **Adaugă Environment Variables**
```yaml
# În build job
env:
  NEW_VAR: ${{ secrets.NEW_VAR }}
```

### **Modifică Job Dependencies**
```yaml
# Schimbă ordinea job-urilor
needs: [dependency-check, security-audit]
```

## 📞 Support

### **Pentru probleme cu CI/CD:**
1. **Check** Actions tab pentru logs
2. **Review** workflow configuration
3. **Verify** secrets și environment variables
4. **Create** issue cu logs relevante

### **Pentru probleme cu deployment:**
1. **Check** Vercel dashboard
2. **Verify** environment variables
3. **Check** build logs
4. **Verify** project settings

## 🎯 Next Steps

1. **✅ Setup secrets** în GitHub
2. **✅ Configure environments** (preview/production)
3. **✅ Push to main** pentru primul deployment
4. **✅ Monitor** pipeline execution
5. **✅ Configure** Slack notifications (opțional)
6. **✅ Customize** workflows după necesitate

---

**🎉 Felicitări! Ai implementat un sistem complet de CI/CD pentru PromptForge!**
