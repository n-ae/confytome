#!/usr/bin/env node

/**
 * Test Runner for Confytome Project
 * 
 * Orchestrates all test types including unit tests, functional tests,
 * and standalone package tests.
 */

import { execSync } from 'node:child_process';

console.log('🧪 Confytome Complete Test Suite');
console.log('=================================');
console.log('');

const tests = [
  {
    name: 'Unit Tests (Jest)',
    command: 'NODE_OPTIONS="--experimental-vm-modules" jest',
    description: 'Core unit tests and component testing'
  },
  {
    name: 'Functionality Tests',
    command: 'npm run test:functionality',
    description: 'End-to-end CLI functionality validation'
  },
  {
    name: 'Standalone Markdown Tests',
    command: 'npm run test:standalone-markdown',
    description: '@confytome/markdown standalone package validation'
  }
];

let totalPassed = 0;
let totalFailed = 0;
const startTime = Date.now();

for (const test of tests) {
  console.log(`🔬 Running: ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log('');
  
  try {
    const result = execSync(test.command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
    console.log(`✅ ${test.name} PASSED`);
    totalPassed++;
  } catch (error) {
    console.log(`❌ ${test.name} FAILED`);
    totalFailed++;
  }
  
  console.log('');
  console.log('-'.repeat(50));
  console.log('');
}

const duration = (Date.now() - startTime) / 1000;

console.log('📊 Test Suite Summary');
console.log('====================');
console.log(`Total Test Categories: ${tests.length}`);
console.log(`Passed: ${totalPassed} ✅`);
console.log(`Failed: ${totalFailed} ${totalFailed > 0 ? '❌' : '✅'}`);
console.log(`Duration: ${duration.toFixed(2)}s`);

if (totalFailed === 0) {
  console.log('');
  console.log('🎉 All test categories passed!');
  console.log('✨ Confytome is ready for use');
} else {
  console.log('');
  console.log('💥 Some test categories failed');
  console.log('🔍 Check individual test output for details');
  process.exit(1);
}