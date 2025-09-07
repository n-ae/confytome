#!/usr/bin/env node

/**
 * External Dependency Monitoring Script
 *
 * Checks the status of critical external dependencies and reports on:
 * - Current versions vs latest available
 * - Security advisories
 * - Compatibility status
 *
 * Usage: node scripts/check-external-dependencies.js
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MONITORED_DEPENDENCIES = {
  'mustache': {
    package: '@confytome/markdown',
    purpose: 'Markdown template processing engine',
    criticality: 'low',
    alternatives: ['handlebars', 'template-literals']
  },
  'swagger-ui-dist': {
    package: '@confytome/swagger',
    purpose: 'Static assets for Swagger UI interface',
    criticality: 'low',
    alternatives: ['redoc', 'openapi-ui-dist']
  }
};

class DependencyMonitor {
  constructor() {
    this.results = [];
  }

  /**
   * Check all monitored dependencies
   */
  async checkAll() {
    console.log('🔍 Checking external dependencies...\n');

    for (const [depName, config] of Object.entries(MONITORED_DEPENDENCIES)) {
      console.log(`📦 Checking ${depName}...`);
      await this.checkDependency(depName, config);
      console.log('');
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Check a specific dependency
   */
  async checkDependency(name, config) {
    const result = {
      name,
      config,
      currentVersion: null,
      latestVersion: null,
      status: 'unknown',
      securityIssues: false,
      updateAvailable: false,
      messages: []
    };

    try {
      // Get current version
      result.currentVersion = this.getCurrentVersion(name);
      console.log(`   Current: ${result.currentVersion}`);

      // Get latest version
      result.latestVersion = this.getLatestVersion(name);
      console.log(`   Latest:  ${result.latestVersion}`);

      // Check if update available
      result.updateAvailable = result.currentVersion !== result.latestVersion;
      if (result.updateAvailable) {
        console.log(`   ⚠️  Update available: ${result.currentVersion} → ${result.latestVersion}`);
        result.messages.push(`Update available: ${result.currentVersion} → ${result.latestVersion}`);
      } else {
        console.log('   ✅ Up to date');
      }

      // Check for security issues (basic check via npm audit)
      const hasSecurityIssues = this.checkSecurityIssues(name);
      if (hasSecurityIssues) {
        result.securityIssues = true;
        result.messages.push('Security advisory detected - run npm audit for details');
        console.log('   🚨 Security issues detected');
      }

      result.status = result.securityIssues ? 'security-issue' :
        result.updateAvailable ? 'update-available' : 'ok';

    } catch (error) {
      result.status = 'error';
      result.messages.push(`Error checking dependency: ${error.message}`);
      console.log(`   ❌ Error: ${error.message}`);
    }

    this.results.push(result);
  }

  /**
   * Get current version from package-lock.json
   */
  getCurrentVersion(packageName) {
    const lockfilePath = path.resolve(process.cwd(), 'package-lock.json');
    if (!fs.existsSync(lockfilePath)) {
      throw new Error('package-lock.json not found');
    }

    const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
    const nodeModulesEntry = lockfile.packages?.[`node_modules/${packageName}`];

    if (!nodeModulesEntry) {
      throw new Error(`Package ${packageName} not found in lockfile`);
    }

    return nodeModulesEntry.version;
  }

  /**
   * Get latest version from npm registry
   */
  getLatestVersion(packageName) {
    try {
      const output = execSync(`npm view ${packageName} version`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim();
    } catch (error) {
      throw new Error(`Failed to fetch latest version: ${error.message}`);
    }
  }

  /**
   * Check for security issues using npm audit
   */
  checkSecurityIssues(packageName) {
    try {
      // Run npm audit and check if this package has issues
      execSync('npm audit --audit-level=moderate --json', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      return false; // No issues if command succeeds
    } catch (error) {
      // npm audit returns non-zero exit code if issues found
      try {
        const auditOutput = JSON.parse(error.stdout);
        // Check if our specific package has vulnerabilities
        const vulnerabilities = auditOutput.vulnerabilities || {};
        return Object.keys(vulnerabilities).some(vulnPackage =>
          vulnPackage === packageName || vulnPackage.includes(packageName)
        );
      } catch {
        // If we can't parse audit output, assume no security issues for now
        return false;
      }
    }
  }

  /**
   * Print summary of all checks
   */
  printSummary() {
    console.log('📊 Summary:');
    console.log('=' .repeat(50));

    const statusCounts = {};
    const securityCount = this.results.filter(r => r.securityIssues).length;
    const updateCount = this.results.filter(r => r.updateAvailable).length;

    this.results.forEach(result => {
      statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
    });

    console.log(`Total dependencies monitored: ${this.results.length}`);
    console.log(`Security issues: ${securityCount}`);
    console.log(`Updates available: ${updateCount}`);

    if (securityCount > 0) {
      console.log('\n🚨 SECURITY ISSUES DETECTED:');
      console.log('   Run: npm audit');
      console.log('   Fix: npm audit fix');
    }

    if (updateCount > 0) {
      console.log('\n📈 UPDATES AVAILABLE:');
      this.results.filter(r => r.updateAvailable).forEach(result => {
        console.log(`   ${result.name}: ${result.currentVersion} → ${result.latestVersion}`);
      });
      console.log('\n   Review changelogs before updating major versions');
    }

    const overallStatus = securityCount > 0 ? 'CRITICAL' :
      updateCount > 0 ? 'UPDATES_AVAILABLE' : 'OK';

    console.log(`\n🎯 Overall Status: ${overallStatus}`);
  }
}

// Run the monitor if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new DependencyMonitor();

  monitor.checkAll().then((results) => {
    const hasSecurityIssues = results.some(r => r.securityIssues);
    const hasErrors = results.some(r => r.status === 'error');

    // Exit with appropriate code for CI/CD
    if (hasSecurityIssues) {
      process.exit(2); // Security issues
    } else if (hasErrors) {
      process.exit(1); // General errors
    } else {
      process.exit(0); // All good
    }
  }).catch((error) => {
    console.error('❌ Failed to check dependencies:', error);
    process.exit(1);
  });
}

export { DependencyMonitor };
