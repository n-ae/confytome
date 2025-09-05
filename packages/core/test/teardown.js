/**
 * Jest global teardown
 * Runs once after all test suites
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function() {
  // Clean up temporary test directory
  const tempDir = path.join(__dirname, '.temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  console.log('🧹 Test environment cleanup complete');
};
