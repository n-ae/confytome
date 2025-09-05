/**
 * Custom Widdershins Template Markdown Generator
 * 
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Uses custom widdershins template for Confluence-friendly output with code samples
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';
import { SpecConsumerGeneratorBase, BaseGenerator } from '@confytome/core/utils/base-generator.js';
import { TemplateManager } from './utils/template-manager.js';

const require = createRequire(import.meta.url);

class MarkdownGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('generate-markdown', 'Generating Confluence-friendly Markdown (custom widdershins template)', outputDir, services);
  }

  async generate() {
    // Initialize services if not injected
    const services = this.getServices(import.meta.url, 'markdown');
    
    // Load OpenAPI spec
    const openApiSpec = this.loadOpenAPISpec();
    
    const markdownPath = path.join(this.outputDir, 'api-docs.md');
    const specPath = path.join(this.outputDir, 'api-spec.json');
    const templateDir = services.template.getWiddershinsPath();
    
    // Generate markdown using custom widdershins template
    console.log('📝 Generating Markdown with custom widdershins template...');
    
    // Find local widdershins binary
    let widdershinsPath;
    try {
      widdershinsPath = require.resolve('widdershins/widdershins.js');
    } catch (error) {
      throw new Error('widdershins dependency not found. Please install it: npm install widdershins');
    }
    
    // Prepare template data instead of environment variables
    const templateData = services.branding.getMarkdownTemplateData();
    
    // Process the main template to inject branding data
    await this.processWiddershinsTemplate(templateDir, templateData);
    
    // Use custom template for clean Confluence-friendly markdown  
    const widdershinsCommand = `node ${widdershinsPath} ${specPath} ${markdownPath} --user_templates ${templateDir} --language_tabs 'shell:cURL' --omitHeader true --summary --code true --httpsnippet false`;
    
    try {
      execSync(widdershinsCommand, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Failed to generate Markdown documentation: ${error.message}`);
    }
    
    // Write output file and calculate stats
    this.writeOutputFile(markdownPath, fs.readFileSync(markdownPath, 'utf8'), 'Confluence-ready Markdown documentation created');
    
    // Calculate stats
    this.calculateStats(openApiSpec, markdownPath);
    
    return {
      outputPath: markdownPath,
      size: fs.statSync(markdownPath).size
    };
  }

  /**
   * Process widdershins templates to inject branding data instead of using environment variables
   * For now, we'll use environment variables but in a cleaner way through the service layer
   * Future enhancement: Create template preprocessing system
   * @param {string} templateDir - Directory containing templates  
   * @param {Object} templateData - Data to inject into templates
   */
  async processWiddershinsTemplate(templateDir, templateData) {
    // For this implementation, we still use environment variables but managed by services
    // This is safer than regex replacement and maintains compatibility
    // Future: implement proper template preprocessing
    
    if (templateData.excludeBrand) {
      process.env.CONFYTOME_NO_BRAND = 'true';
    } else {
      delete process.env.CONFYTOME_NO_BRAND;
      process.env.CONFYTOME_VERSION = templateData.version || 'unknown';
    }
  }

  calculateStats(spec, markdownPath) {
    const specStats = fs.statSync(path.join(this.outputDir, 'api-spec.json'));
    const markdownStats = fs.statSync(markdownPath);
    
    this.addStat('OpenAPI spec', `${(specStats.size / 1024).toFixed(1)} KB`);
    this.addStat('Generated Markdown', `${(markdownStats.size / 1024).toFixed(1)} KB`);
    this.addStat('Generator', 'widdershins (custom template)');
  }

  getSuccessMessage() {
    return 'Confluence-ready Markdown documentation generation completed';
  }
}

// Legacy function for backwards compatibility
function main() {
  const generator = new MarkdownGenerator();
  return generator.run();
}

// Auto-run if this is the main module
BaseGenerator.runIfMain(MarkdownGenerator, import.meta.url);

// Export both class and legacy function
export { MarkdownGenerator, main };
export default main;
