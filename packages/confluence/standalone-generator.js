/**
 * Standalone Confluence Generator
 *
 * Cross-platform JavaScript equivalent of md2confluence.ps1
 * Generates clean Pandoc-style markdown and copies to clipboard for Confluence
 */

import fs from 'node:fs';
import { writeClipboard } from './utils/clipboard.js';

export class StandaloneConfluenceGenerator {
  constructor(outputDir = './confytome', options = {}) {
    this.outputDir = outputDir;
    this.options = {
      excludeBrand: false,
      ...options
    };
  }

  static getMetadata() {
    return {
      name: 'confluence',
      description: 'Pandoc-style Markdown generator for Confluence'
    };
  }


  /**
   * Simple logging method
   * @param {string} message - Log message
   */
  log(message) {
    console.log(message);
  }

  async generate(options = {}) {
    try {
      let markdownPath;

      // Generate markdown from OpenAPI spec if needed
      if (this.options.specPath) {
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
          fs.mkdirSync(this.outputDir, { recursive: true });
        }

        this.log('📝 Generating markdown from OpenAPI spec...');
        const { StandaloneMarkdownGenerator } = await import('@confytome/markdown');
        const markdownGenerator = new StandaloneMarkdownGenerator(this.outputDir, {
          specPath: this.options.specPath,
          excludeBrand: this.options.excludeBrand,
          urlEncodeAnchors: this.options.urlEncodeAnchors,
          tagOrder: this.options.tagOrder
        });

        const result = await markdownGenerator.generate();
        if (!result.success) {
          throw new Error(`Markdown generation failed: ${result.error}`);
        }
        markdownPath = result.outputPath;
        this.log(`✅ Markdown generated: ${markdownPath}`);
      } else if (this.options.markdownPath) {
        markdownPath = this.options.markdownPath;
      } else {
        throw new Error('No input source specified. Provide either specPath or markdownPath.');
      }

      // Read and copy markdown to clipboard
      this.log(`📋 Copying clean markdown to clipboard: ${markdownPath}`);
      if (!fs.existsSync(markdownPath)) {
        throw new Error(`Markdown file not found: ${markdownPath}`);
      }

      const markdownContent = fs.readFileSync(markdownPath, 'utf8');
      this.log(`📖 Read markdown file (${markdownContent.length} characters)`);

      // Copy to clipboard
      let clipboardSuccess = false;
      if (options.copyToClipboard !== false) {
        try {
          await writeClipboard(markdownContent);
          clipboardSuccess = true;
          this.log('📋 Clean markdown copied to clipboard (Pandoc-style)');
        } catch (error) {
          this.log(`⚠️ Failed to copy to clipboard: ${error.message}`);
        }
      }

      // Show simple usage instructions
      if (clipboardSuccess) {
        this.log('💡 Ready to paste into Confluence page editor');
      }

      return {
        success: true,
        outputPath: markdownPath,
        clipboardSuccess
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
