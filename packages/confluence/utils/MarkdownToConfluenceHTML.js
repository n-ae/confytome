/**
 * Markdown to Confluence HTML Converter
 *
 * Cross-platform JavaScript equivalent of md2confluence.ps1
 * Converts Markdown to Confluence-compatible HTML with proper clipboard formatting
 */

import { marked } from 'marked';

export class MarkdownToConfluenceHTML {
  constructor(options = {}) {
    this.options = {
      preserveCodeBlocks: true,
      unicodeSupport: true,
      ...options
    };

    // Configure marked for Confluence compatibility
    this.configureMarked();
  }

  /**
   * Configure marked renderer for Confluence compatibility
   */
  configureMarked() {
    const renderer = new marked.Renderer();

    // Customize code block rendering for Confluence
    renderer.code = function(code, language) {
      // Confluence prefers <pre> with class for syntax highlighting
      const lang = language || '';
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="language-${lang}"><code>${escapedCode}</code></pre>`;
    };

    // Customize inline code rendering
    renderer.codespan = function(code) {
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<code>${escapedCode}</code>`;
    };

    // Customize table rendering for better Confluence compatibility
    renderer.table = function(header, body) {
      return `<table class="confluenceTable">
<thead>${header}</thead>
<tbody>${body}</tbody>
</table>`;
    };

    // Set marked options
    marked.setOptions({
      renderer: renderer,
      gfm: true, // GitHub Flavored Markdown
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }

  /**
   * Convert Markdown to Confluence-compatible HTML
   * @param {string} markdown - Markdown content
   * @returns {string} HTML content
   */
  convertToHTML(markdown) {
    try {
      // Parse markdown to HTML
      let html = marked.parse(markdown);

      // Post-process for Confluence compatibility
      html = this.postProcessHTML(html);

      return html;
    } catch (error) {
      throw new Error(`Markdown conversion failed: ${error.message}`);
    }
  }

  /**
   * Post-process HTML for better Confluence compatibility
   * @param {string} html - HTML content
   * @returns {string} Processed HTML
   */
  postProcessHTML(html) {
    // Add Confluence-friendly classes and attributes
    html = html.replace(/<table>/g, '<table class="confluenceTable">');
    html = html.replace(/<th>/g, '<th class="confluenceTh">');
    html = html.replace(/<td>/g, '<td class="confluenceTd">');

    // Ensure proper encoding for special characters
    html = html.replace(/'/g, '&#39;');
    html = html.replace(/"/g, '&quot;');

    // Clean up extra whitespace
    html = html.replace(/\n\s*\n/g, '\n');
    html = html.trim();

    return html;
  }

  /**
   * Create Confluence clipboard format with proper headers
   * @param {string} htmlContent - HTML content to format
   * @returns {string} Clipboard-formatted HTML
   */
  createClipboardHTML(htmlContent) {
    // Create the full HTML structure for clipboard
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
<!--StartFragment-->
${htmlContent}
<!--EndFragment-->
</body>
</html>`;

    // Calculate byte offsets for clipboard header
    const encoding = 'utf8';
    const headerTemplate = `Version:1.0
StartHTML:0000000000
EndHTML:0000000000
StartFragment:0000000000
EndFragment:0000000000
`;

    // Calculate actual byte positions
    const headerBytes = Buffer.from(headerTemplate, encoding).length;
    const fullHtmlBytes = Buffer.from(fullHtml, encoding);

    const startHtml = headerBytes;
    const endHtml = startHtml + fullHtmlBytes.length;

    // Find fragment boundaries
    const fragmentStart = fullHtml.indexOf('<!--StartFragment-->') + '<!--StartFragment-->'.length;
    const fragmentEnd = fullHtml.indexOf('<!--EndFragment-->');

    const startFragment = startHtml + Buffer.from(fullHtml.substring(0, fragmentStart), encoding).length;
    const endFragment = startHtml + Buffer.from(fullHtml.substring(0, fragmentEnd), encoding).length;

    // Build final header with correct offsets
    const header = `Version:1.0\r\n` +
                  `StartHTML:${startHtml.toString().padStart(10, '0')}\r\n` +
                  `EndHTML:${endHtml.toString().padStart(10, '0')}\r\n` +
                  `StartFragment:${startFragment.toString().padStart(10, '0')}\r\n` +
                  `EndFragment:${endFragment.toString().padStart(10, '0')}\r\n`;

    // Combine header and HTML
    return header + fullHtml;
  }

  /**
   * Convert markdown file to Confluence clipboard format
   * @param {string} markdown - Markdown content
   * @returns {Object} Conversion result
   */
  convertForClipboard(markdown) {
    try {
      const startTime = Date.now();

      // Convert to HTML
      const html = this.convertToHTML(markdown);

      // Create clipboard-formatted content
      const clipboardHTML = this.createClipboardHTML(html);

      // Calculate statistics
      const stats = {
        originalSize: Buffer.byteLength(markdown, 'utf8'),
        htmlSize: Buffer.byteLength(html, 'utf8'),
        clipboardSize: Buffer.byteLength(clipboardHTML, 'utf8'),
        processingTime: Date.now() - startTime
      };

      return {
        success: true,
        html: html,
        clipboardHTML: clipboardHTML,
        plainText: markdown, // Fallback plain text
        stats: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract title from markdown content
   * @param {string} markdown - Markdown content
   * @returns {string} Extracted title or default
   */
  extractTitle(markdown) {
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Confluence Documentation';
  }

  /**
   * Validate markdown content
   * @param {string} markdown - Markdown content to validate
   * @returns {Object} Validation result
   */
  validateMarkdown(markdown) {
    const errors = [];
    const warnings = [];

    if (!markdown || markdown.trim().length === 0) {
      errors.push('Markdown content is empty');
    }

    if (markdown.length > 1000000) { // 1MB limit
      warnings.push('Large markdown file may cause performance issues');
    }

    // Check for potential encoding issues
    if (/[\uFFFD]/.test(markdown)) {
      warnings.push('Potential encoding issues detected');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }
}