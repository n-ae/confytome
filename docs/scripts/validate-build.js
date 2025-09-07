#!/usr/bin/env node
/**
 * Build Validation Script
 *
 * Validates that all packages follow consistent build patterns
 * Usage: node docs/scripts/validate-build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const packagesDir = path.join(rootDir, 'packages');

// Expected package structure
const REQUIRED_FILES = {
  core: ['package.json', 'cli.js', 'generate-openapi.js', 'README.md'],
  generator: ['package.json', 'cli.js', 'README.md']
};

const REQUIRED_SCRIPTS = [
  'test', 'lint', 'format', 'clean', 'validate', 'prepublishOnly', 'security:check', 'security:fix'
];

const REQUIRED_FIELDS = [
  'name', 'version', 'description', 'main', 'bin', 'type', 'author', 'license'
];

/**
 * Get all package directories
 */
function getPackages() {
  try {
    return fs.readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        path: path.join(packagesDir, dirent.name),
        type: dirent.name === 'core' ? 'core' : 'generator'
      }));
  } catch (error) {
    console.error('❌ Error reading packages directory:', error.message);
    return [];
  }
}

/**
 * Validate package structure
 */
function validatePackageStructure(pkg) {
  const errors = [];
  const expectedFiles = REQUIRED_FILES[pkg.type];

  for (const file of expectedFiles) {
    const filePath = path.join(pkg.path, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  return errors;
}

/**
 * Validate package.json
 */
function validatePackageJson(pkg) {
  const errors = [];
  const packageJsonPath = path.join(pkg.path, 'package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!packageJson[field]) {
        errors.push(`Missing required field in package.json: ${field}`);
      }
    }

    // Check scripts
    if (!packageJson.scripts) {
      errors.push('Missing scripts section in package.json');
    } else {
      for (const script of REQUIRED_SCRIPTS) {
        if (!packageJson.scripts[script]) {
          errors.push(`Missing required script: ${script}`);
        }
      }
    }

    // Check ES module type
    if (packageJson.type !== 'module') {
      errors.push('Package should use "type": "module"');
    }

    // Check version consistency (basic check)
    if (!packageJson.version || !packageJson.version.match(/^\d+\.\d+\.\d+/)) {
      errors.push('Invalid version format (should be semver)');
    }

  } catch (error) {
    errors.push(`Error reading package.json: ${error.message}`);
  }

  return errors;
}

/**
 * Validate CLI file
 */
function validateCliFile(pkg) {
  const errors = [];
  const cliPath = path.join(pkg.path, 'cli.js');

  try {
    const cliContent = fs.readFileSync(cliPath, 'utf8');

    // Check shebang
    if (!cliContent.startsWith('#!/usr/bin/env node')) {
      errors.push('CLI file missing shebang: #!/usr/bin/env node');
    }

    // Check for ES module imports
    if (!cliContent.includes('import ')) {
      errors.push('CLI file should use ES module imports');
    }

    // Check for commander usage
    if (!cliContent.includes('commander')) {
      errors.push('CLI file should use commander for argument parsing');
    }

  } catch (error) {
    errors.push(`Error reading cli.js: ${error.message}`);
  }

  return errors;
}

/**
 * Validate README file
 */
function validateReadme(pkg) {
  const errors = [];
  const readmePath = path.join(pkg.path, 'README.md');

  try {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Check for required sections
    const requiredSections = [
      '# @confytome/', '## ✨', '## 📦 Installation', '## 🚀'
    ];

    for (const section of requiredSections) {
      if (!readmeContent.includes(section)) {
        errors.push(`README missing required section: ${section}`);
      }
    }

    // Check length (should be substantial)
    if (readmeContent.length < 1000) {
      errors.push('README seems too short (< 1000 characters)');
    }

  } catch (error) {
    errors.push(`Error reading README.md: ${error.message}`);
  }

  return errors;
}

/**
 * Main validation function
 */
function validatePackage(pkg) {
  console.log(`📦 Validating ${pkg.name}...`);

  const allErrors = [
    ...validatePackageStructure(pkg),
    ...validatePackageJson(pkg),
    ...validateCliFile(pkg),
    ...validateReadme(pkg)
  ];

  if (allErrors.length > 0) {
    console.log(`❌ ${pkg.name}: ${allErrors.length} issues found:`);
    allErrors.forEach(error => console.log(`   • ${error}`));
    return false;
  } else {
    console.log(`✅ ${pkg.name}: All validations passed`);
    return true;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Validating build consistency across packages...');
  console.log('');

  const packages = getPackages();

  if (packages.length === 0) {
    console.error('❌ No packages found to validate');
    process.exit(1);
  }

  let allValid = true;

  for (const pkg of packages) {
    const isValid = validatePackage(pkg);
    if (!isValid) {
      allValid = false;
    }
    console.log('');
  }

  if (allValid) {
    console.log(`✅ All ${packages.length} packages passed validation!`);
    console.log('🎉 Build consistency check complete');
  } else {
    console.log('❌ Some packages failed validation');
    console.log('💡 Run with individual package names for detailed errors');
    process.exit(1);
  }
}

// Handle CLI arguments for specific package validation
const targetPackage = process.argv[2];
if (targetPackage) {
  const packages = getPackages();
  const pkg = packages.find(p => p.name === targetPackage);

  if (pkg) {
    validatePackage(pkg);
  } else {
    console.error(`❌ Package not found: ${targetPackage}`);
    console.log(`Available packages: ${packages.map(p => p.name).join(', ')}`);
    process.exit(1);
  }
} else {
  main();
}
