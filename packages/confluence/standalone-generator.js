/**
 * Standalone Confluence Generator
 *
 * Cross-platform JavaScript equivalent of md2confluence.ps1
 * Converts Markdown files to Confluence-compatible HTML and copies to clipboard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import clipboardy from 'clipboardy';
import { StandaloneBase } from './utils/StandaloneBase.js';
import { MarkdownToConfluenceHTML } from './utils/MarkdownToConfluenceHTML.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StandaloneConfluenceGenerator extends StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    super(outputDir, options);
    this.converter = new MarkdownToConfluenceHTML(options);
  }

  /**
   * Get generator metadata (self-contained)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    return {
      name: 'confluence',
      description: 'Cross-platform Markdown to Confluence HTML converter with clipboard integration',
      version: '1.7.6',
      packageName: '@confytome/confluence',
      cliCommand: 'confytome-confluence',
      inputs: ['.md files'],
      outputs: ['Confluence HTML', 'clipboard'],
      features: ['markdown-to-html', 'confluence-formatting', 'clipboard-integration', 'cross-platform']
    };
  }

  /**
   * Validate generator prerequisites (extends base validation)
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(options = {}) {
    const baseValidation = await super.validate(options);

    // Check clipboard functionality
    try {
      const _testContent = await clipboardy.read();
      this.log('✅ Clipboard functionality available');
    } catch {
      baseValidation.warnings.push('Clipboard functionality may not work in this environment');
    }

    // Validate input file if specified
    if (this.options.markdownPath) {
      const normalizedPath = path.normalize(this.options.markdownPath);
      if (!fs.existsSync(normalizedPath)) {
        baseValidation.errors.push(`Markdown file not found: ${this.options.markdownPath}`);
      } else {
        try {
          const stats = fs.statSync(normalizedPath);
          if (!stats.isFile()) {
            baseValidation.errors.push(`Path is not a file: ${this.options.markdownPath}`);
          }
        } catch (error) {
          baseValidation.errors.push(`Cannot access file: ${error.message}`);
        }
      }
    }

    return {
      success: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }

  /**
   * Initialize the generator (extends base initialization)
   * @param {Object} options - Initialization options
   * @returns {Promise<ValidationResult>} Initialization result
   */
  async initialize(options = {}) {
    const baseInit = await super.initialize(options);
    this.log('✅ Confluence generator initialized');
    return baseInit;
  }

  /**
   * Convert markdown file to Confluence format and copy to clipboard
   * @param {string} markdownPath - Path to markdown file
   * @param {Object} options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async convertMarkdownFile(markdownPath, options = {}) {
    this.log(`🔄 Converting markdown to Confluence format: ${markdownPath}`);

    try {
      // Normalize and validate path
      const normalizedPath = path.normalize(markdownPath);
      this.validateFileExists(normalizedPath, 'Markdown file');

      // Read markdown content with UTF-8 encoding
      const markdownContent = fs.readFileSync(normalizedPath, 'utf8');
      this.log(`📖 Read markdown file: ${normalizedPath} (${markdownContent.length} characters)`);

      // Validate markdown content
      const validation = this.converter.validateMarkdown(markdownContent);
      if (!validation.valid) {
        throw new Error(`Invalid markdown: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => this.log(`⚠️ ${warning}`));
      }

      // Convert to Confluence format
      const conversionResult = this.converter.convertForClipboard(markdownContent);

      if (!conversionResult.success) {
        throw new Error(`Conversion failed: ${conversionResult.error}`);
      }

      // Extract title for output file naming
      const title = this.converter.extractTitle(markdownContent);
      const outputFileName = `${this.sanitizeFileName(title)}.html`;
      const outputPath = path.join(this.outputDir, outputFileName);

      // Write HTML file
      this.writeFile(outputPath, conversionResult.html, 'Confluence HTML');

      // Copy to clipboard with proper formatting
      let clipboardSuccess = false;
      if (options.copyToClipboard !== false) {
        try {
          // On Windows, we need to set both HTML format and plain text
          if (process.platform === 'win32') {
            // For Windows, try to use native clipboard if available
            try {
              await this.setWindowsClipboard(conversionResult.clipboardHTML, markdownContent);
              clipboardSuccess = true;
              this.log('📋 Content copied to clipboard (Windows HTML format)');
            } catch {
              // Fallback to simple text clipboard
              await clipboardy.write(conversionResult.html);
              clipboardSuccess = true;
              this.log('📋 Content copied to clipboard (HTML text fallback)');
            }
          } else {
            // For other platforms, copy HTML as text
            await clipboardy.write(conversionResult.html);
            clipboardSuccess = true;
            this.log('📋 Content copied to clipboard (HTML text)');
          }
        } catch (error) {
          this.log(`⚠️ Failed to copy to clipboard: ${error.message}`);
        }
      }

      // Generate usage instructions
      this.showUsageInstructions();

      // Generate summary
      const { stats } = conversionResult;
      this.log('\n📊 Conversion Summary:');
      this.log(`   Original: ${stats.originalSize} bytes`);
      this.log(`   HTML: ${stats.htmlSize} bytes`);
      this.log(`   Clipboard: ${stats.clipboardSize} bytes`);
      this.log(`   Processing time: ${stats.processingTime}ms`);

      return {
        success: true,
        outputPath,
        clipboardSuccess,
        title,
        stats: {
          ...stats,
          clipboardCopied: clipboardSuccess
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: { error: error.message }
      };
    }
  }

  /**
   * Set Windows clipboard with proper HTML format (if possible)
   * @param {string} htmlContent - HTML content with clipboard headers
   * @param {string} plainText - Plain text fallback
   */
  async setWindowsClipboard(htmlContent, _plainText) {
    // This is a placeholder for Windows-specific clipboard functionality
    // In a real implementation, you might use a native module like 'node-clipboard'
    // or shell commands specific to Windows

    // For now, fallback to standard clipboard
    await clipboardy.write(htmlContent);
  }

  /**
   * Show usage instructions for Confluence
   */
  showUsageInstructions() {
    this.log('');
    this.log('📋 Successfully converted and copied to clipboard!');
    this.log('💡 Usage Instructions:');
    this.log('   1. Open Confluence page editor');
    this.log('   2. Paste content (Ctrl+V / Cmd+V)');
    this.log('   3. For code blocks: Select pasted code > Insert > Code Block');
    this.log('   4. For headers: Select text > Apply header style from toolbar');
    this.log('   5. For tables: Content should paste with formatting intact');
  }

  /**
   * Sanitize filename for cross-platform compatibility
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  sanitizeFileName(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase()
      .substring(0, 100); // Limit length
  }

  /**
   * Generate Confluence documentation from OpenAPI (via markdown)
   * @param {Object} options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(options = {}) {
    // If markdown path is provided, convert directly
    if (this.options.markdownPath) {
      return this.convertMarkdownFile(this.options.markdownPath, options);
    }

    // If OpenAPI spec is provided, generate markdown first then convert
    if (this.options.specPath) {
      try {
        // Try to use markdown generator if available
        const { StandaloneMarkdownGenerator } = await import('@confytome/markdown');

        const markdownGenerator = new StandaloneMarkdownGenerator(this.outputDir, {
          specPath: this.options.specPath,
          excludeBrand: this.options.excludeBrand
        });

        this.log('📝 Generating markdown first...');
        const markdownResult = await markdownGenerator.generate();

        if (!markdownResult.success) {
          throw new Error(`Markdown generation failed: ${markdownResult.error}`);
        }

        this.log(`✅ Markdown generated: ${markdownResult.outputPath}`);

        // Convert the generated markdown
        return this.convertMarkdownFile(markdownResult.outputPath, options);
      } catch (error) {
        throw new Error(`Failed to generate from OpenAPI spec: ${error.message}`);
      }
    }

    throw new Error('No input source specified. Provide either markdownPath or specPath.');
  }
}
