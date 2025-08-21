# PromptForge™ UI Kit

A comprehensive React/TypeScript component library built with **shadcn/ui** and **Radix primitives**, featuring glassmorphic design, dark theme, and accessibility-first approach.

## 🚀 Features

- **Glassmorphic Design**: Modern backdrop-blur effects with transparency
- **Dark Theme**: Optimized for dark mode with CSS variables
- **Responsive Grid**: 3 columns on desktop, 1 column on mobile
- **Accessibility**: ARIA labels and keyboard navigation support
- **Animations**: Smooth transitions and micro-interactions
- **TypeScript**: Full type safety with comprehensive interfaces
- **Tailwind CSS**: Utility-first styling with custom design tokens

## 📦 Components

### Core Components

#### `PromptForgeCard`
Enhanced card component with KPI indicators, vector badges, and glassmorphic styling.

```tsx
import { PromptForgeCard } from '@/components/ui';

<PromptForgeCard
  title="Content Generation"
  description="Generate engaging content with AI assistance"
  icon={<FileText className="w-5 h-5" />}
  kpi={{ value: 92, label: 'Score', trend: 'up' }}
  vector={{ name: 'Creative', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' }}
  variant="interactive"
  footer={<Button>Generate</Button>}
/>
```

**Props:**
- `title`: Card title
- `description`: Optional description
- `icon`: Lucide React icon
- `kpi`: Key Performance Indicator with trend
- `vector`: Vector classification with color
- `variant`: 'default' | 'featured' | 'interactive'
- `footer`: Optional footer content

#### `PromptForgeButton`
Enhanced button component with multiple variants, sizes, and animations.

```tsx
import { PromptForgeButton } from '@/components/ui';

<PromptForgeButton
  variant="gradient"
  size="lg"
  icon={<Play className="w-4 h-4" />}
  animation="scale"
  fullWidth
>
  Generate Prompt
</PromptForgeButton>
```

**Variants:**
- `default`, `secondary`, `outline`, `ghost`
- `glass`, `gradient`, `success`, `warning`, `info`
- `destructive`, `link`

**Sizes:**
- `sm`, `default`, `lg`, `xl`, `icon`

**Animations:**
- `none`, `pulse`, `bounce`, `spin`, `ping`
- `fadeIn`, `slideUp`, `scale`, `glow`

#### `PromptForgeBadge`
Enhanced badge component with vector-specific styling and animations.

```tsx
import { PromptForgeBadge } from '@/components/ui';

<PromptForgeBadge
  variant="vector"
  size="lg"
  animation="glow"
  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
>
  Creative
</PromptForgeBadge>
```

**Variants:**
- `default`, `success`, `warning`, `error`, `info`
- `glass`, `gradient`
- `vector`: Creative, Technical, Analytical, etc.
- `score`: Excellent, Good, Acceptable, Poor
- `plan`: Free, Creator, Pro, Enterprise

#### `PromptForgeTabs`
Enhanced tabs component with glassmorphic styling and smooth animations.

```tsx
import { PromptForgeTabs, PromptForgeTab } from '@/components/ui';

<PromptForgeTabs variant="glass" size="lg">
  <PromptForgeTab
    value="generator"
    label="Generator"
    icon={<Sparkles className="w-4 h-4" />}
    variant="glass"
    animation="slide"
  >
    Content goes here
  </PromptForgeTab>
</PromptForgeTabs>
```

**Variants:**
- `default`, `glass`, `card`, `minimal`

**Sizes:**
- `sm`, `default`, `lg`

**Animations:**
- `none`, `slide`, `fade`, `scale`, `glow`

### 7D Parameter Engine

#### `SevenDEngine`
Complete parameter configuration system for operational prompt generation.

```tsx
import { SevenDEngine, type SevenDParams } from '@/components/ui';

const [params, setParams] = useState<SevenDParams>({
  domain: 'fintech',
  scale: 'startup',
  urgency: 'planned',
  complexity: 'standard',
  resources: 'lean_team',
  application: 'strategy_design',
  output: 'playbook'
});

<SevenDEngine
  value={params}
  onChange={setParams}
  variant="detailed"
  showLabels={true}
/>
```

**Parameters:**
- **Domain**: FinTech, E-commerce, Healthcare, Education, Legal, Manufacturing, Consulting, Startup
- **Scale**: Personal Brand, Solo, Startup, SMB, Boutique Agency, Corporate, Enterprise
- **Urgency**: Low, Planned, Sprint, Pilot, Crisis
- **Complexity**: Foundational, Standard, Advanced, Expert
- **Resources**: Minimal, Solo, Lean Team, Agency Stack, Full Stack Org, Enterprise Budget
- **Application**: Training, Audit, Implementation, Strategy Design, Crisis Response, Experimentation, Documentation
- **Output**: Text, Markdown, Checklist, Specification, Playbook, JSON, YAML, Diagram, Bundle

**Variants:**
- `default`: Standard layout with labels
- `compact`: Condensed 4-column grid
- `detailed`: Full layout with descriptions and summary

## 🎨 Design System

### Color Palette
- **Primary**: White (`--primary: 0 0% 100%`)
- **Background**: Black (`--background: 0 0% 0%`)
- **Card**: Dark gray (`--card: 0 0% 10%`)
- **Border**: Subtle borders (`--border: 0 0% 14%`)
- **Muted**: Secondary text (`--muted-foreground: 0 0% 65%`)

### Typography
- **Montserrat**: Headings and titles
- **Open Sans**: Body text and descriptions

### Spacing
- **Grid Gap**: 6 (1.5rem) for card layouts
- **Padding**: 6 (1.5rem) for card content
- **Margins**: 8 (2rem) for section spacing

### Animations
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: Default Tailwind easing curves
- **Hover Effects**: Scale, glow, and border color changes

## 📱 Responsive Design

### Grid Layouts
```css
/* Mobile First */
grid-cols-1                    /* 1 column on mobile */

/* Tablet */
md:grid-cols-2                 /* 2 columns on medium screens */

/* Desktop */
lg:grid-cols-3                 /* 3 columns on large screens */

/* Extra Large */
xl:grid-cols-4                 /* 4 columns on extra large screens */
```

### Breakpoints
- **Mobile**: `< 768px` - Single column layout
- **Tablet**: `768px - 1024px` - Two column layout
- **Desktop**: `> 1024px` - Three column layout

## ♿ Accessibility

### ARIA Labels
- All interactive elements have proper `aria-label` attributes
- Form controls include descriptive labels
- Status indicators use appropriate ARIA roles

### Keyboard Navigation
- Tab navigation follows logical order
- Enter/Space key support for interactive elements
- Focus indicators with high contrast

### Screen Reader Support
- Semantic HTML structure
- Descriptive alt text for icons
- Status announcements for dynamic content

## 🚀 Usage Examples

### Basic Module Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {modules.map((module) => (
    <PromptForgeCard
      key={module.id}
      title={module.name}
      description={module.description}
      icon={<FileText className="w-5 h-5" />}
      kpi={module.kpi}
      vector={module.vector}
      variant="interactive"
      onClick={() => handleModuleSelect(module)}
    />
  ))}
</div>
```

### Tabbed Interface
```tsx
<PromptForgeTabs defaultValue="generator" variant="glass">
  <PromptForgeTab value="generator" label="Generator" icon={<Sparkles />}>
    <ModuleGrid />
  </PromptForgeTab>
  <PromptForgeTab value="editor" label="Editor" icon={<Brain />}>
    <PromptEditor />
  </PromptForgeTab>
</PromptForgeTabs>
```

### 7D Parameter Configuration
```tsx
<SevenDEngine
  value={sevenDParams}
  onChange={setSevenDParams}
  variant="detailed"
  showLabels={true}
/>
```

## 🔧 Customization

### Theme Variables
Override CSS variables in your global CSS:

```css
:root {
  --primary: 0 0% 100%;        /* White */
  --background: 0 0% 0%;       /* Black */
  --card: 0 0% 10%;            /* Dark gray */
  --border: 0 0% 14%;          /* Border color */
}
```

### Component Variants
All components support custom variants through the `className` prop:

```tsx
<PromptForgeCard
  className="bg-blue-500/20 border-blue-500/50"
  // ... other props
/>
```

### Animation Customization
Override default animations with custom classes:

```tsx
<PromptForgeButton
  className="animate-bounce hover:animate-pulse"
  // ... other props
/>
```

## 📚 Dependencies

- **React**: 18+ with hooks
- **TypeScript**: 5.0+ for type safety
- **Tailwind CSS**: 3.0+ for styling
- **shadcn/ui**: Base component library
- **Radix UI**: Primitive components
- **Lucide React**: Icon library
- **class-variance-authority**: Component variants

## 🎯 Best Practices

1. **Consistent Spacing**: Use the established spacing scale (4, 6, 8, 12)
2. **Icon Consistency**: Use Lucide React icons with consistent sizing
3. **Color Semantics**: Use semantic color variants (success, warning, error)
4. **Responsive Design**: Always test on mobile, tablet, and desktop
5. **Accessibility**: Include proper ARIA labels and keyboard support
6. **Performance**: Use React.memo for expensive components
7. **Type Safety**: Leverage TypeScript interfaces for all props

## 🐛 Troubleshooting

### Common Issues

**Component not rendering:**
- Check import paths
- Verify all dependencies are installed
- Check console for TypeScript errors

**Styling not applied:**
- Ensure Tailwind CSS is properly configured
- Check CSS variable definitions
- Verify class names are correct

**Animation not working:**
- Check if animation classes are included in Tailwind config
- Verify component animation prop values
- Ensure no conflicting CSS rules

### Performance Tips

- Use `React.memo` for components that don't change often
- Implement proper key props for list rendering
- Avoid inline object creation in render functions
- Use `useCallback` for event handlers passed as props

## 📄 License

This UI kit is part of PromptForge™ and follows the same licensing terms.

---

**Built with ❤️ for the PromptForge™ community**
