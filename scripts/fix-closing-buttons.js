const fs = require('fs');
const path = require('path');

function fixClosingButtons(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and .git
      if (file.name !== 'node_modules' && file.name !== '.git' && file.name !== '.next') {
        fixClosingButtons(fullPath);
      }
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      console.log(`Processing: ${fullPath}`);
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Fix closing Button tags
      if (content.includes('</Button>')) {
        content = content.replace(/<\/Button>/g, '</button>');
        modified = true;
        console.log(`  Fixed closing Button tags in ${file.name}`);
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

// Start from current directory
const startDir = process.cwd();
console.log(`Starting to fix closing Button tags in: ${startDir}`);

fixClosingButtons(startDir);

console.log('Finished fixing closing Button tags!');
