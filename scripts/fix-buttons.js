#!/usr/bin/env node

/**
 * Fix Button Components Script
 * 
 * This script automatically replaces all Button components with onClick handlers
 * with native HTML button elements to fix the "Event handlers cannot be passed to Client Component props" error.
 * 
 * Usage: node scripts/fix-buttons.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to replace Button components with onClick
function replaceButtonWithOnClick(content) {
  // Pattern to match Button components with onClick
  const buttonPattern = /<Button\s+([^>]*?)onClick\s*=\s*\{([^}]+)\}([^>]*?)>/g;
  
  return content.replace(buttonPattern, (match, beforeOnClick, onClickValue, afterOnClick) => {
    // Extract variant and other props
    const variantMatch = beforeOnClick.match(/variant\s*=\s*["']([^"']+)["']/);
    const sizeMatch = beforeOnClick.match(/size\s*=\s*["']([^"']+)["']/);
    const disabledMatch = beforeOnClick.match(/disabled\s*=\s*\{([^}]+)\}/);
    const classNameMatch = beforeOnClick.match(/className\s*=\s*["']([^"']+)["']/);
    
    // Build button element
    let buttonElement = '<button';
    
    // Add onClick
    buttonElement += ` onClick={${onClickValue}}`;
    
    // Add other props
    if (disabledMatch) {
      buttonElement += ` disabled={${disabledMatch[1]}}`;
    }
    
    // Add className with Button styles
    let buttonClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2';
    
    if (variantMatch) {
      const variant = variantMatch[1];
      switch (variant) {
        case 'outline':
          buttonClasses += ' border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground';
          break;
        case 'ghost':
          buttonClasses += ' hover:bg-accent hover:text-accent-foreground';
          break;
        case 'destructive':
          buttonClasses += ' bg-destructive text-white shadow-xs hover:bg-destructive/90';
          break;
        case 'secondary':
          buttonClasses += ' bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80';
          break;
        case 'link':
          buttonClasses += ' text-primary underline-offset-4 hover:underline';
          break;
        default:
          buttonClasses += ' bg-primary text-primary-foreground shadow-xs hover:bg-primary/90';
      }
    } else {
      buttonClasses += ' bg-primary text-primary-foreground shadow-xs hover:bg-primary/90';
    }
    
    if (sizeMatch) {
      const size = sizeMatch[1];
      switch (size) {
        case 'sm':
          buttonClasses += ' h-8 rounded-md gap-1.5 px-3';
          break;
        case 'lg':
          buttonClasses += ' h-10 rounded-md px-6';
          break;
        case 'icon':
          buttonClasses += ' size-9';
          break;
        default:
          buttonClasses += ' h-9 px-4 py-2';
      }
    }
    
    if (classNameMatch) {
      buttonClasses += ` ${classNameMatch[1]}`;
    }
    
    buttonElement += ` className="${buttonClasses}"`;
    
    // Add other attributes
    const otherProps = beforeOnClick.replace(/variant\s*=\s*["'][^"']+["']/, '')
                                   .replace(/size\s*=\s*["'][^"']+["']/, '')
                                   .replace(/className\s*=\s*["'][^"']+["']/, '')
                                   .replace(/disabled\s*=\s*\{[^}]+\}/, '')
                                   .replace(/onClick\s*=\s*\{[^}]+\}/, '')
                                   .trim();
    
    if (otherProps) {
      buttonElement += ` ${otherProps}`;
    }
    
    buttonElement += '>';
    
    return buttonElement;
  });
}

// Function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replaceButtonWithOnClick(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Fixing Button components with onClick handlers...\n');
  
  // Find all TypeScript/TSX files
  const files = glob.sync('components/**/*.{ts,tsx}');
  const appFiles = glob.sync('app/**/*.{ts,tsx}');
  const allFiles = [...files, ...appFiles];
  
  let fixedCount = 0;
  
  for (const file of allFiles) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files!`);
  console.log('\n📋 Next steps:');
  console.log('   1. Run: pnpm build');
  console.log('   2. If successful, run: pnpm start');
  console.log('\n⚠️  Note: You may need to manually adjust some button styles');
  console.log('   if they don\'t look exactly the same.');
}

main().catch(console.error);
