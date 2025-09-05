/**
 * Custom Widdershins Template Markdown Generator
 * 
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Uses custom widdershins template for Confluence-friendly output with code samples
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { SpecConsumerGeneratorBase, BaseGenerator } from '@confytome/core/utils/base-generator.js';
import { TemplateManager } from './utils/template-manager.js';

class MarkdownGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs') {
    super('generate-markdown', 'Generating Confluence-friendly Markdown (custom widdershins template)', outputDir);
  }

  async generate() {
    // Load OpenAPI spec
    const openApiSpec = this.loadOpenAPISpec();
    
    const markdownPath = path.join(this.outputDir, 'api-docs.md');
    const specPath = path.join(this.outputDir, 'api-spec.json');
    const templateDir = TemplateManager.getWiddershinsTemplatesPath();
    
    // Generate markdown using custom widdershins template
    console.log('📝 Generating Markdown with custom widdershins template...');
    
    // Use custom template for clean Confluence-friendly markdown
    const widdershinsCommand = `npx widdershins ${specPath} ${markdownPath} --user_templates ${templateDir} --language_tabs 'shell:cURL' --omitHeader true --summary --code true --httpsnippet false`;
    
    try {
      execSync(widdershinsCommand, { stdio: 'inherit' });
    } catch (error) {
      if (error.message.includes('widdershins')) {
        throw new Error('widdershins not available. Install globally: npm i -g widdershins');
      }
      throw error;
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
