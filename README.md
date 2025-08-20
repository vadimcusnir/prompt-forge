# PROMPTFORGE™ v3.0

**Generatorul Operațional de Prompturi** - 50 module, engine 7‑D, export .md/.json/.pdf

## 🎯 Despre

PROMPTFORGE™ este un sistem industrial de generare prompturi, nu un tool simplu. Configurezi o dată, exporți artefacte repetabile în sub 60 de secunde.

### 🧠 Diferențiatori Cheie

- **50 Module Operaționale** (M01–M50) - fiecare ca micro-serviciu semantic
- **Engine 7‑D** - Domain, Scale, Urgency, Complexity, Resources, Application, Output
- **Export Bundle** - .txt, .md, .json, .pdf cu manifest și checksum
- **Brand Linter** - validare automată cu scor AI ≥ 80/100
- **TTA Garantat** - text < 60s, SOP < 5m

## 🎨 SKRE Protocol Design System

### Paleta de Culori

```css
/* Fundaluri */
--pf-black: #0A0A0A        /* Fundal principal */
--pf-bg-secondary: #0e0e0e /* Secțiuni intermediare */
--pf-bg-tertiary: #1a1a1a  /* Carduri */

/* Accente */
--pf-gold-industrial: #d1a954  /* CTA, highlight, autoritate */
--pf-lead-gray: #5a5a5a        /* Borders, subtitluri, secundar */

/* Vectori Module (badge-uri) */
--vector-v1: #f87171  /* V1 - Systems & Agents */
--vector-v2: #60a5fa  /* V2 - Marketing & Sales */
--vector-v3: #34d399  /* V3 - Content & Education */
--vector-v4: #fbbf24  /* V4 - Decisions & Cognitive */
--vector-v5: #a78bfa  /* V5 - Semiotic Branding */
--vector-v6: #22d3ee  /* V6 - Data & Analytics */
--vector-v7: #fb923c  /* V7 - Crisis & PR */
```

### Tipografie

- **Headings**: Montserrat (600/700/900)
- **Body**: Open Sans (400/500/600/700)
- **Code**: JetBrains Mono

### Efecte Vizuale

- **Glass Effect**: `rgba(255,255,255,0.08)` cu `backdrop-filter: blur(12px)`
- **Glow**: `box-shadow: 0 0 20px rgba(209,169,84,0.3)` pentru CTA-uri
- **Hover States**: `hover:border-gold-industrial` + `hover:shadow-gold-hover`

## 🏗️ Structura Homepage

### 1. Hero Section (Full-screen)
- **H1**: "Generatorul tău operațional de prompturi"
- **Sub**: "50 module. 7 vectori. Exportă în < 60 secunde"
- **CTA Primar**: "Pornește forja" (bg-gold-industrial)
- **CTA Secundar**: "Vezi modulele" (ghost)
- **Proof Bar**: TTA < 60s • AI Score ≥ 80/100 • .md/.json/.pdf export

### 2. Cum Funcționează (3 Carduri)
- **Setezi 7‑D** → LucideWand2 icon
- **Rulezi modul** → LucideCpu icon  
- **Exporti bundle** → LucideDownload icon

### 3. Module Grid Preview
- Afișează primele 12 module (M01–M12)
- Filtrare pe vectori + search
- CTA: "Vezi toate modulele"

### 4. Use Cases (3 Benzi)
- **Agenții & Consultanți** (V2 - Marketing)
- **Soloprenori & Founders** (V3 - Content)
- **Educatori & Course Creators** (V5 - Branding)

### 5. Pricing Preview (3 Carduri)
- **Pilot** - "Ship the core" (0€)
- **Pro** - "Ship at scale" (49€/lună) - *highlighted*
- **Enterprise** - "Ship with governance" (299€/lună)

### 6. CTA Final
- "Construiești sisteme de prompturi, nu piese unice"
- CTA: "Pornește forja acum"

## 🚀 Implementare Tehnică

### Dependințe

```bash
npm install phosphor-react framer-motion next-themes
```

### Structura Fișiere

```
app/
├── page.tsx              # Homepage principal
├── layout.tsx            # Layout cu fonturi + metadata
├── globals.css           # SKRE Protocol CSS tokens
└── components/
    ├── ui/               # shadcn/ui components
    ├── module-grid.tsx   # Grid module preview
    └── theme-provider.tsx # Next-themes provider
```

### Tailwind Config

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      "gold-industrial": "#d1a954",
      "lead-gray": "#5a5a5a",
      // ... vector colors
    },
    fontFamily: {
      heading: ["var(--font-heading)", "Montserrat"],
      sans: ["var(--font-sans)", "Open Sans"],
    }
  }
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 390px (iPhone 12)
- **Tablet**: 768px
- **Desktop**: 1440px

### Adaptări Mobile
- Hero: `bg-pf-hero-mobile` (gradient mai mic)
- Glass effects: `backdrop-filter: blur(8px)`
- Grid: `grid-cols-1` → `grid-cols-3`

## ♿ Accesibilitate

### Preferințe de Mișcare
```css
@media (prefers-reduced-motion: reduce) {
  .glass-effect, .glow-primary { 
    backdrop-filter: none; 
    box-shadow: none; 
  }
}
```

### Contrast
- **Text pe dark**: `#FFFFFF` (contrast 21:1)
- **Text secundar**: `#5a5a5a` (contrast 7:1)
- **CTA**: `#d1a954` pe `#000000` (contrast 15:1)

## 🔍 SEO & Metadata

### Meta Tags
```typescript
export const metadata: Metadata = {
  title: "PromptForge — Generatorul Operațional de Prompturi",
  description: "Construiești sisteme de prompturi, nu piese unice...",
  keywords: ["prompt generator", "AI prompts", "7-D engine"],
  openGraph: { /* ... */ },
  twitter: { /* ... */ }
}
```

### Structura URL
- **Homepage**: `/`
- **Module**: `/modules`
- **Generator**: `/generator`
- **Pricing**: `/pricing`

## 🧪 Testing

### Scripts Disponibile
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Jest tests
npm run preflight    # Preflight checks
```

### Test Coverage
- **Unit Tests**: Components individuale
- **Integration Tests**: Module grid + search
- **E2E Tests**: User flow complet

## 🚀 Deployment

### Vercel
```bash
vercel --prod
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📚 Resurse

### Design System
- [SKRE Protocol Specification](./cursor/forge_v3_branding_web_design.txt)
- [Component Library](./components/ui/)
- [Color Palette](./app/globals.css)

### Documentație
- [Next.js 14](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contribuții

### Cod Style
- **TypeScript strict**: `strict: true`
- **ESLint**: Next.js recommended + custom rules
- **Prettier**: Tailwind CSS class sorting

### Commit Messages
```
feat: add hero section with SKRE Protocol design
fix: resolve glass effect backdrop-filter issues
docs: update README with implementation details
```

## 📄 Licență

MIT License - vezi [LICENSE](./LICENSE) pentru detalii.

---

**PromptForge™** - Construiești sisteme de prompturi, nu piese unice.

*Ultima actualizare: Decembrie 2024*
