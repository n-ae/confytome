#!/usr/bin/env node

/**
 * Quick status check for confytome project
 * Run with: node scripts/session-status.js
 */

import { execSync } from 'child_process';
import fs from 'fs';

const packages = ['core', 'markdown', 'confluence', 'swagger', 'html', 'postman'];

console.log('🍃 Confytome Project Status Check');
console.log('================================\n');

// Check versions
console.log('📦 Package Versions:');
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`Workspace: v${rootPkg.version}`);

packages.forEach(pkg => {
  const pkgPath = `packages/${pkg}/package.json`;
  if (fs.existsSync(pkgPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`  @confytome/${pkg}: v${pkgJson.version}`);
  }
});

console.log('\n🧪 Quick Test Status:');
try {
  execSync('npm run test:core > /dev/null 2>&1');
  console.log('✅ Core tests: PASSING');
} catch {
  console.log('❌ Core tests: FAILING');
}

try {
  execSync('npm run lint > /dev/null 2>&1');
  console.log('✅ Lint checks: PASSING');
} catch {
  console.log('❌ Lint checks: FAILING');
}

console.log('\n🚀 Recent Features (v1.9.1):');
console.log('• Tag-based sectioning (OpenAPI tags → documentation sections)');
console.log('• Parameter examples with multiple example support');
console.log('• Hierarchical Quick Reference navigation');
console.log('• Confluence generator with full markdown feature parity');
console.log('• Authentication section prioritization');

console.log('\n📁 Key Files to Remember:');
console.log('• OpenApiProcessor.js - Core processing logic with new features');
console.log('• main.mustache - Markdown template with hierarchical structure');
console.log('• confluence/ - Updated generator with modern architecture');
console.log('• ADR-020 - Confluence dependency architecture decision');

console.log('\n🔧 Quick Commands:');
console.log('• npm run validate - Full validation (lint + test)');
console.log('• npm run test:core - Core functionality tests');
console.log('• npm run publish:dry-run - Test publishing process');
console.log('• npm run version:set X.Y.Z - Update all package versions');

const sessionSummary = '.session-summary.md';
if (fs.existsSync(sessionSummary)) {
  console.log(`\n📋 See ${sessionSummary} for detailed session notes`);
}

console.log('\n✨ Project is ready for continued development!');
