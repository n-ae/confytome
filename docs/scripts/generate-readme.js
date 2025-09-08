#!/usr/bin/env node
/**
 * README Generator Script
 *
 * Generates README files from templates using configuration
 * Usage: node docs/scripts/generate-readme.js [package-name]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../templates');
const configPath = path.join(templatesDir, 'template-config.json');
const rootDir = path.resolve(__dirname, '../..');

/**
 * Load template configuration
 */
function loadConfig() {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('❌ Error loading template config:', error.message);
    process.exit(1);
  }
}

/**
 * Load template file
 */
function loadTemplate(templateName) {
  const templatePath = path.join(templatesDir, templateName);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error loading template ${templateName}:`, error.message);
    process.exit(1);
  }
}

/**
 * Replace template variables with values
 */
function processTemplate(template, variables) {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Get output path for package README
 */
function getOutputPath(packageName) {
  let dir = rootDir;

  if (packageName !== 'workspace') {
    dir = path.join(rootDir, 'packages', packageName);
  }

  return path.join(dir, 'README.md');
}

/**
 * Generate README for a specific package
 */
function generateReadme(packageName, config) {
  const packageConfig = config[packageName];

  if (!packageConfig) {
    console.error(`❌ No configuration found for package: ${packageName}`);
    return false;
  }

  console.log(`📝 Generating README for ${packageName}...`);

  // Load template
  const template = loadTemplate(packageConfig.template);

  // Process template with variables
  const content = processTemplate(template, packageConfig.variables);

  // Get output path
  const outputPath = getOutputPath(packageName);

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write README file
  try {
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ Generated: ${path.relative(rootDir, outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${outputPath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  const config = loadConfig();
  const targetPackage = process.argv[2];

  if (targetPackage) {
    // Generate for specific package
    if (!generateReadme(targetPackage, config)) {
      process.exit(1);
    }
  } else {
    // Generate for all packages
    console.log('🚀 Generating all README files...');
    console.log('');

    let success = true;
    const packages = Object.keys(config);

    for (const packageName of packages) {
      if (!generateReadme(packageName, config)) {
        success = false;
      }
    }

    console.log('');
    if (success) {
      console.log(`✅ Successfully generated ${packages.length} README files`);
    } else {
      console.log('❌ Some README files failed to generate');
      process.exit(1);
    }
  }
}

/**
 * Validate templates function
 */
function validateTemplates() {
  const config = loadConfig();
  console.log('🔍 Validating templates...');

  for (const [packageName, packageConfig] of Object.entries(config)) {
    const templatePath = path.join(templatesDir, packageConfig.template);

    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Template not found: ${packageConfig.template} (for ${packageName})`);
      return false;
    }

    // Check for unused variables in template
    const template = fs.readFileSync(templatePath, 'utf8');
    const templateVars = template.match(/\\{\\{[A-Z_]+\\}\\}/g) || [];
    const configVars = Object.keys(packageConfig.variables);

    const unusedVars = templateVars.filter(tVar => {
      const varName = tVar.replace(/[{}]/g, '');
      return !configVars.includes(varName);
    });

    if (unusedVars.length > 0) {
      console.warn(`⚠️  ${packageName}: Undefined variables: ${unusedVars.join(', ')}`);
    }
  }

  console.log('✅ Template validation complete');
  return true;
}

// Handle CLI commands
if (process.argv.includes('--validate')) {
  validateTemplates();
} else {
  main();
}
