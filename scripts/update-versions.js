#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function updateVersion(targetVersion) {
  const files = [
    'package.json',
    ...(await glob('packages/*/package.json', { cwd: rootDir })),
    ...(await glob('packages/*/confytome-plugin.json', { cwd: rootDir }))
  ];

  console.log(`🔄 Updating to ${targetVersion}...`);
  
  files.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.version = targetVersion;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log(`   ✓ ${path.basename(path.dirname(filePath))}`);
  });

  console.log('✅ Done');
}

const [command, arg] = process.argv.slice(2);
const currentVersion = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;

if (command === 'bump') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  updateVersion(newVersion);
} else if (command === 'set' && arg) {
  updateVersion(arg);
} else {
  console.log('Usage: npm run version:bump | npm run version:set <version>');
  console.log(`Current: ${currentVersion}`);
}