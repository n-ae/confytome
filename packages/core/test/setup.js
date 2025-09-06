/**
 * Jest global setup
 * Runs once before all test suites
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function() {
  // Create temporary test directory
  const tempDir = path.join(__dirname, '.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Store path in global for tests to use
  global.__TEMP_DIR__ = tempDir;

  console.log('🔧 Test environment setup complete');
};
