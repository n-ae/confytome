#!/usr/bin/env node
/**
 * README Quality Validation Script
 *
 * Validates that new Mustache-generated READMEs maintain the same
 * quality and essential content as existing correct READMEs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateREADME } from '../src/mustache-readme-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

/**
 * Validate that a generated README has essential sections
 */
function validateREADMEStructure(content, packageType) {
  const lines = content.split('\n');
  const headers = lines.filter(line => line.startsWith('#'));

  const requiredSections = [
    'Features',
    'Installation',
    'Usage'
  ];

  // Only generator packages should have Options section
  if (packageType !== 'workspace' && packageType !== 'core') {
    requiredSections.push('Options');
  }

  const generatorSections = [
    'Generated Output',
    'Dependencies',
    'Examples',
    'Part of confytome Ecosystem'
  ];

  const missingRequired = requiredSections.filter(section =>
    !headers.some(header => header.toLowerCase().includes(section.toLowerCase()))
  );

  const missingGenerator = packageType !== 'workspace' && packageType !== 'core'
    ? generatorSections.filter(section =>
      !headers.some(header => header.toLowerCase().includes(section.toLowerCase()))
    )
    : [];

  return {
    valid: missingRequired.length === 0 && missingGenerator.length === 0,
    missingRequired,
    missingGenerator,
    totalSections: headers.length,
    headers: headers.slice(0, 10) // First 10 headers for reference
  };
}

/**
 * Validate README content quality
 */
function validateContentQuality(content) {
  const issues = [];

  // Check for common formatting issues
  if (content.includes('```')) {
    const codeBlocks = content.match(/```/g);
    if (codeBlocks && codeBlocks.length % 2 !== 0) {
      issues.push('Unclosed code blocks detected');
    }
  }

  // Check for excessive empty table cells (some are intentional for CLI options)
  const tableCells = content.match(/\|\s*\|/g);
  if (tableCells && tableCells.length > 10) {
    issues.push('Excessive empty table cells detected - verify intentional');
  }

  // Check for broken links (basic check)
  const brokenLinks = content.match(/\[.*?\]\(\s*\)/g);
  if (brokenLinks) {
    issues.push(`Found ${brokenLinks.length} empty links: ${brokenLinks.slice(0, 3).join(', ')}`);
  }

  // Check for unicode support
  const hasEmoji = /[\u{1F600}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(content);
  if (!hasEmoji) {
    issues.push('No emojis found - may indicate formatting issues');
  }

  return {
    valid: issues.length === 0,
    issues,
    length: content.length,
    hasCodeBlocks: content.includes('```'),
    hasTables: content.includes('|'),
    hasEmojis: hasEmoji
  };
}

/**
 * Compare current vs generated README for a package
 */
function comparePackageREADME(packageType) {
  console.log(`\n📄 Validating ${packageType} README...`);

  try {
    // Get current README path
    const packagePath = packageType === 'workspace'
      ? rootDir
      : path.join(rootDir, 'packages', packageType);

    const currentPath = path.join(packagePath, 'README.md');

    if (!fs.existsSync(currentPath)) {
      console.log(`⚠️  No current README found at ${currentPath}`);
      return { packageType, status: 'missing' };
    }

    // Read current README
    const currentContent = fs.readFileSync(currentPath, 'utf8');

    // Generate new README
    const newContent = generateREADME(packageType);

    // Validate structure
    const currentStructure = validateREADMEStructure(currentContent, packageType);
    const newStructure = validateREADMEStructure(newContent, packageType);

    // Validate quality
    const currentQuality = validateContentQuality(currentContent);
    const newQuality = validateContentQuality(newContent);

    console.log(`   📏 Size: ${currentContent.length} → ${newContent.length} chars`);
    console.log(`   📑 Sections: ${currentStructure.totalSections} → ${newStructure.totalSections}`);
    console.log(`   ✅ Current structure valid: ${currentStructure.valid}`);
    console.log(`   ✅ New structure valid: ${newStructure.valid}`);
    console.log(`   ✅ Current quality valid: ${currentQuality.valid}`);
    console.log(`   ✅ New quality valid: ${newQuality.valid}`);

    if (!newStructure.valid) {
      console.log(`   ❌ Missing required sections: ${newStructure.missingRequired.join(', ')}`);
      console.log(`   ❌ Missing generator sections: ${newStructure.missingGenerator.join(', ')}`);
    }

    if (!newQuality.valid) {
      console.log(`   ❌ Quality issues: ${newQuality.issues.join(', ')}`);
    }

    return {
      packageType,
      status: 'compared',
      currentLength: currentContent.length,
      newLength: newContent.length,
      structureValid: newStructure.valid,
      qualityValid: newQuality.valid,
      issues: [...(newStructure.missingRequired || []), ...(newQuality.issues || [])]
    };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { packageType, status: 'error', error: error.message };
  }
}

/**
 * Main validation function
 */
async function validateAllREADMEs() {
  console.log('🔍 Validating README quality for all packages...\n');

  const packages = ['workspace', 'core', 'html', 'markdown', 'swagger', 'postman'];
  const results = [];

  for (const packageType of packages) {
    const result = comparePackageREADME(packageType);
    results.push(result);
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  const valid = results.filter(r => r.structureValid && r.qualityValid && r.status === 'compared');
  const invalid = results.filter(r => !r.structureValid || !r.qualityValid);
  const errors = results.filter(r => r.status === 'error');

  console.log(`✅ Valid READMEs: ${valid.length}`);
  console.log(`❌ Invalid READMEs: ${invalid.length}`);
  console.log(`⚠️  Errors: ${errors.length}`);

  if (invalid.length > 0) {
    console.log('\nInvalid READMEs:');
    invalid.forEach(result => {
      console.log(`   ${result.packageType}: ${result.issues?.join(', ') || 'Structure/quality issues'}`);
    });
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(result => {
      console.log(`   ${result.packageType}: ${result.error}`);
    });
  }

  return results;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  await validateAllREADMEs();
}
