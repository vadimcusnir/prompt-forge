# PromptForge Generator Page

## Overview
The generator page provides a comprehensive interface for creating AI prompts using the 7-Dimensional Configuration Engine and browsing through 50+ specialized modules.

## Components

### 1. GeneratorHeader (`generator-header.tsx`)
- **Purpose**: Main page header with title and description
- **Features**: Gradient text, responsive design
- **Type**: Server Component

### 2. SevenDEngine (`seven-d-engine.tsx`)
- **Purpose**: 7-Dimensional Configuration Engine for prompt generation
- **Dimensions**:
  - **Domain**: Industry-specific settings (Health, Legal, Gov, Media, etc.)
  - **Scale**: Organizational size (Individual to Government Agency)
  - **Urgency**: Priority level (Low to Emergency)
  - **Complexity**: Task complexity (Simple to Research/Innovation)
  - **Resources**: Available resources (Minimal to Unlimited)
  - **Application**: Use case (Internal to Commercial)
  - **Output**: Expected format (Text to Multi-format)
- **Features**: Collapsible implementation details, real-time configuration display
- **Type**: Client Component

### 3. ModuleGrid (`module-grid.tsx`)
- **Purpose**: Grid display of available modules with search and filtering
- **Features**: 
  - Search by name/description
  - Filter by vector (Creative, Technical, Analytical, etc.)
  - Responsive grid layout
  - Module selection opens side panel
- **Type**: Client Component

### 4. ModuleCard (`module-card.tsx`)
- **Purpose**: Individual module display card
- **Features**:
  - Module ID, name, and description
  - AI Score badge with color coding
  - Vector badge with category colors
  - Hover effects and animations
- **Type**: Client Component

### 5. ModuleSidePanel (`module-side-panel.tsx`)
- **Purpose**: Detailed module view with prompt generation and actions
- **Features**:
  - Prompt preview and editor
  - Test simulation (all plans)
  - Real test execution (Pro+ only)
  - Export options with plan restrictions:
    - `.txt` - Free
    - `.md` - Creator+
    - `.pdf`, `.json` - Pro+
    - `.bundle.zip` - Enterprise
  - Test results with run ID and score
- **Type**: Client Component

## Features

### Plan-Based Access Control
- **Free**: Basic generation, txt export
- **Creator+**: md export, advanced generation
- **Pro+**: pdf/json export, real testing
- **Enterprise**: Bundle export, custom modules

### 7-D Configuration Engine
- Real-time configuration updates
- Industry-specific presets
- Technical implementation details
- Responsive grid layout

### Module System
- 50+ specialized modules
- Vector-based categorization
- AI scoring system
- Search and filtering

### Testing & Export
- Test simulation for all users
- Real test execution for Pro+
- Multiple export formats
- Plan-based restrictions

## Usage

1. **Configure 7-D Parameters**: Select appropriate values for your use case
2. **Browse Modules**: Use search and filters to find relevant modules
3. **Select Module**: Click on a module card to open the side panel
4. **Generate Prompt**: Review and edit the generated prompt
5. **Test & Export**: Run tests and export in your preferred format

## Styling

### Design System
- **Dark Glassmorphic**: Slate backgrounds with transparency and blur
- **Golden Accents**: Amber/yellow highlights for primary elements
- **Typography**: Montserrat for headings, Open Sans for body text
- **Responsive**: Mobile-first design with responsive breakpoints

### Color Scheme
- **Primary**: Amber/Yellow gradients
- **Background**: Slate 800-900 with transparency
- **Text**: Slate 200-400 for readability
- **Accents**: Emerald for success, Blue for info, Red for errors

## Dependencies

- **@heroicons/react**: Icon library
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety

## Installation

```bash
npm install @heroicons/react
# or
pnpm add @heroicons/react
```

## Future Enhancements

- Integration with actual prompt generation API
- Real-time collaboration features
- Advanced prompt templates
- Performance analytics dashboard
- Custom module creation (Enterprise)
