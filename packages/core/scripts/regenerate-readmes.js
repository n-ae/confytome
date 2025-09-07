#!/usr/bin/env node
/**
 * Regenerate README Files Script
 * 
 * Uses Mustache templates to regenerate README files with enhanced
 * features like conditionals, loops, and structured data.
 */

import { generateAllREADMEs, validateREADMETemplates, compareREADMEApproaches } from '../utils/mustache-readme-generator.js';

/**
 * Main regeneration function
 */
async function regenerateREADMEs() {
  console.log('🚀 Regenerating README files with Mustache templates...\n');

  // Validate templates first
  const templatesValid = validateREADMETemplates();
  if (!templatesValid) {
    console.error('❌ Template validation failed. Aborting.');
    process.exit(1);
  }

  console.log('');

  // Generate all READMEs
  const results = await generateAllREADMEs();

  // Summary
  const successful = results.filter(r => r.path);
  const failed = results.filter(r => r.error);

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully generated: ${successful.length} READMEs`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.type}: ${f.error}`));
    process.exit(1);
  } else {
    console.log(`🎉 All READMEs updated successfully!`);
  }
}

/**
 * Compare old vs new approaches
 */
async function compareApproaches() {
  console.log('🔍 Comparing old vs new README generation approaches...\n');

  const packageTypes = ['workspace', 'core', 'html', 'markdown', 'swagger', 'postman'];
  
  for (const packageType of packageTypes) {
    const comparison = compareREADMEApproaches(packageType);
    
    console.log(`📄 ${packageType}:`);
    if (comparison.error) {
      console.log(`   ❌ Error: ${comparison.error}`);
    } else {
      console.log(`   📏 Size: ${comparison.existingLength} → ${comparison.newLength} chars (${comparison.sizeDiff > 0 ? '+' : ''}${comparison.sizeDiff})`);
      console.log(`   🔄 Changed: ${comparison.hasChanges ? 'Yes' : 'No'}`);
    }
    console.log('');
  }
}

/**
 * Preview generated content without writing files
 */
async function previewREADMEs() {
  console.log('👀 Previewing generated README content...\n');

  const packageTypes = ['workspace', 'core', 'html', 'markdown'];
  
  for (const packageType of packageTypes) {
    try {
      const comparison = compareREADMEApproaches(packageType);
      
      console.log(`📄 ${packageType.toUpperCase()} README Preview:`);
      console.log('─'.repeat(50));
      console.log(comparison.newContent);
      console.log('─'.repeat(50));
      console.log('');
    } catch (error) {
      console.error(`❌ Error previewing ${packageType}:`, error.message);
    }
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--validate')) {
  validateREADMETemplates();
} else if (args.includes('--compare')) {
  await compareApproaches();
} else if (args.includes('--preview')) {
  await previewREADMEs();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node regenerate-readmes.js [options]

Options:
  --validate    Validate Mustache templates without generating
  --compare     Compare old vs new generation approaches
  --preview     Preview generated content without writing files
  --help, -h    Show this help message

This script uses Mustache templates to regenerate README files across
all packages with enhanced features like conditionals, loops, and 
structured data.

Features:
- Real Mustache templating (not just string replacement)
- Conditional sections for optional content
- Loop support for lists and tables
- Structured data with proper escaping
- Template validation and error reporting
  `);
} else {
  // Default action: regenerate all READMEs
  await regenerateREADMEs();
}