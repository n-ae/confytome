#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function updateVersion(targetVersion) {
  const files = [
    'package.json',
    ...(await glob('packages/*/package.json', { cwd: rootDir }))
  ];

  console.log(`🔄 Updating to ${targetVersion}...`);

  files.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.version = targetVersion;
    fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`);
    console.log(`   ✓ ${path.basename(path.dirname(filePath))}`);
  });

  console.log('📝 Regenerating READMEs...');
  execSync('npm run regenerate:readmes', { cwd: rootDir, stdio: 'inherit' });

  console.log('✅ Done');
}

const [command, arg] = process.argv.slice(2);
const currentVersion = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;

if (command === 'bump') {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  await updateVersion(newVersion);
} else if (command === 'set' && arg) {
  await updateVersion(arg);
} else {
  console.log('Usage: npm run version:bump | npm run version:set <version>');
  console.log(`Current: ${currentVersion}`);
}
