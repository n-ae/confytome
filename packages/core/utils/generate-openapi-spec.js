import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

export async function generateOpenApiSpec(configPath, files, outputDir) {
  return new Promise((resolve, reject) => {
    const absoluteOutputDir = path.resolve(outputDir);
    const specPath = path.join(absoluteOutputDir, 'api-spec.json');

    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    let args;

    if (configPath && fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.serverConfig && config.routeFiles) {
          args = ['generate', '--config', configPath, '--output', absoluteOutputDir];
          console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);
        } else {
          args = ['openapi', '-c', configPath, '-f', ...(files || []), '-o', absoluteOutputDir];
          console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);
        }
      } catch (error) {
        reject(new Error(`Invalid config file: ${error.message}`));
        return;
      }
    } else if (files && files.length > 0) {
      reject(new Error('Config file is required when providing JSDoc files'));
      return;
    } else {
      reject(new Error('Either config file or JSDoc files must be provided'));
      return;
    }

    const child = spawn('npx', ['@confytome/core', ...args], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        const possiblePaths = [
          specPath,
          path.join(process.cwd(), 'confytome', 'api-spec.json'),
          path.join(absoluteOutputDir, 'confytome', 'api-spec.json')
        ];

        let foundPath = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundPath = possiblePath;
            break;
          }
        }

        if (foundPath) {
          if (foundPath !== specPath) {
            fs.copyFileSync(foundPath, specPath);
            console.log(`📋 Moved spec from ${foundPath} to ${specPath}`);
          }
          console.log(`✅ OpenAPI spec ready: ${specPath}`);
          resolve(specPath);
        } else {
          reject(new Error(`OpenAPI spec not found in any expected location: ${possiblePaths.join(', ')}`));
        }
      } else {
        reject(new Error(`@confytome/core exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start @confytome/core: ${error.message}`));
    });
  });
}
