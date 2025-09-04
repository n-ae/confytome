/**
 * Primary OpenAPI Spec Generator
 * 
 * This is the first step for all documentation generation.
 * Generates OpenAPI spec from JSDoc which all other generators consume.
 */

import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { OpenAPIGeneratorBase, BaseGenerator } from './utils/base-generator.js';
import { FileManager } from './utils/file-manager.js';

class OpenAPIGenerator extends OpenAPIGeneratorBase {
  constructor() {
    super('generate-openapi', 'Generating OpenAPI spec (JSDoc → OpenAPI)');
  }

  async generate(args) {
    const { serverConfigPath, jsdocFiles } = args;
    
    // Load and validate server configuration
    const serverConfig = this.loadServerConfig(serverConfigPath);
    
    // Process JSDoc files
    console.log(`📖 Processing ${jsdocFiles.length} JSDoc files...`);
    console.log('📖 Processing JSDoc comments...');
    
    const options = {
      definition: serverConfig,
      apis: jsdocFiles,
    };

    // Generate OpenAPI spec
    const openApiSpec = swaggerJSDoc(options);
    
    if (!openApiSpec || Object.keys(openApiSpec).length === 0) {
      throw new Error('Failed to generate OpenAPI spec. Check JSDoc comments in your files.');
    }

    // Write the OpenAPI spec
    const outputPath = path.join(this.outputDir, 'api-spec.json');
    const specContent = JSON.stringify(openApiSpec, null, 2);
    
    FileManager.writeFile(
      outputPath, 
      specContent, 
      this.name, 
      'OpenAPI spec created'
    );

    // Calculate statistics
    this.calculateStats(openApiSpec, specContent);

    return {
      spec: openApiSpec,
      outputPath,
      size: Buffer.byteLength(specContent, 'utf8')
    };
  }

  calculateStats(spec, content) {
    const pathCount = Object.keys(spec.paths || {}).length;
    let endpointCount = 0;
    
    // Count total endpoints
    for (const path in spec.paths || {}) {
      endpointCount += Object.keys(spec.paths[path]).length;
    }
    
    const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
    const serverCount = (spec.servers || []).length;
    const hasAuth = !!(spec.components && spec.components.securitySchemes);

    this.addStat(`${pathCount} unique paths`, '');
    this.addStat(`${endpointCount} endpoint`, '');
    this.addStat(`${sizeKB} KB OpenAPI spec`, '');
    this.addStat('Auth', hasAuth ? 'Included' : 'Not configured');
    this.addStat('Servers', `${serverCount} server(s)`);
  }

  getSuccessMessage() {
    return 'OpenAPI spec generation completed';
  }
}

// Legacy function for backwards compatibility
function main() {
  const generator = new OpenAPIGenerator();
  return generator.run();
}

// Auto-run if this is the main module
BaseGenerator.runIfMain(OpenAPIGenerator, import.meta.url);

// Export both class and legacy function
export { OpenAPIGenerator, main, main as generateOpenApiSpec };
export default main;