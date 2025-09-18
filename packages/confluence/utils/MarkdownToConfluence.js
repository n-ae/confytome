/**
 * Markdown to Confluence Wiki Markup Converter
 *
 * Converts Markdown content to Confluence-compatible wiki markup
 * for pasting directly into Confluence pages.
 */

export class MarkdownToConfluence {
  constructor(options = {}) {
    this.options = {
      preserveCodeBlocks: true,
      convertTables: true,
      handleAnchors: true,
      ...options
    };
  }

  /**
   * Convert markdown content to Confluence wiki markup
   * @param {string} markdown - Markdown content
   * @returns {string} Confluence wiki markup
   */
  convert(markdown) {
    let content = markdown;

    // Process in order of complexity to avoid conflicts
    content = this.convertCodeBlocks(content);
    content = this.convertHeaders(content);
    content = this.convertTables(content);
    content = this.convertLists(content);
    content = this.convertLinks(content);
    content = this.convertInlineCode(content);
    content = this.convertBold(content);
    content = this.convertItalic(content);
    content = this.convertHorizontalRules(content);
    content = this.cleanupContent(content);

    return content;
  }

  /**
   * Convert code blocks from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertCodeBlocks(content) {
    // Convert fenced code blocks (```language)
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'none';
      return `{code:${lang}}\n${code.trim()}\n{code}`;
    });

    // Convert indented code blocks (4 spaces)
    content = content.replace(/^( {4,}.*$)/gm, (match, code) => {
      return `{code}\n${code.replace(/^ {4}/gm, '')}\n{code}`;
    });

    return content;
  }

  /**
   * Convert headers from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertHeaders(content) {
    // Convert headers # to h1., ## to h2., etc.
    return content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      return `h${level}. ${title}`;
    });
  }

  /**
   * Convert tables from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertTables(content) {
    if (!this.options.convertTables) return content;

    // Simple markdown table conversion
    return content.replace(/(\|[^\n]+\|\n)+/g, (match) => {
      const lines = match.trim().split('\n');

      // Skip separator line (usually second line with |---|---|)
      const tableLines = lines.filter(line => !line.match(/^\|[\s\-\|:]+\|$/));

      let confluenceTable = '';
      tableLines.forEach((line, index) => {
        const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
        if (index === 0) {
          // Header row
          confluenceTable += '||' + cells.join('||') + '||\n';
        } else {
          // Data row
          confluenceTable += '|' + cells.join('|') + '|\n';
        }
      });

      return confluenceTable;
    });
  }

  /**
   * Convert lists from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertLists(content) {
    // Convert unordered lists (* or -)
    content = content.replace(/^[\*\-]\s+(.+)$/gm, '* $1');

    // Convert ordered lists (1. 2. etc.)
    content = content.replace(/^\d+\.\s+(.+)$/gm, '# $1');

    // Handle nested lists (simple approach)
    content = content.replace(/^(\s+)[\*\-]\s+(.+)$/gm, (match, indent, text) => {
      const level = Math.floor(indent.length / 2) + 1;
      return '*'.repeat(level) + ' ' + text;
    });

    content = content.replace(/^(\s+)\d+\.\s+(.+)$/gm, (match, indent, text) => {
      const level = Math.floor(indent.length / 2) + 1;
      return '#'.repeat(level) + ' ' + text;
    });

    return content;
  }

  /**
   * Convert links from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertLinks(content) {
    // Convert [text](url) to [text|url]
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');

    // Convert anchor links for internal navigation
    if (this.options.handleAnchors) {
      content = content.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '[$1|#$2]');
    }

    return content;
  }

  /**
   * Convert inline code from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertInlineCode(content) {
    // Convert `code` to {{code}}
    return content.replace(/`([^`]+)`/g, '{{$1}}');
  }

  /**
   * Convert bold text from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertBold(content) {
    // Convert **text** and __text__ to *text*
    return content.replace(/(\*\*|__)([^*_]+)\1/g, '*$2*');
  }

  /**
   * Convert italic text from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertItalic(content) {
    // Convert *text* and _text_ to _text_
    return content.replace(/(\*|_)([^*_]+)\1/g, '_$2_');
  }

  /**
   * Convert horizontal rules from markdown to Confluence
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  convertHorizontalRules(content) {
    // Convert --- or *** to ----
    return content.replace(/^(\*{3,}|\-{3,}|_{3,})$/gm, '----');
  }

  /**
   * Clean up content and handle edge cases
   * @param {string} content - Content to process
   * @returns {string} Processed content
   */
  cleanupContent(content) {
    // Remove extra blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Clean up any remaining markdown artifacts
    content = content.replace(/^\s*\[↑\]\(#[^)]*\)\s*$/gm, ''); // Remove "back to top" links

    // Clean up asterisks that weren't converted
    content = content.replace(/\*\[↑\]\([^)]*\)\*/gm, '');

    return content.trim();
  }

  /**
   * Convert a complete markdown document with metadata
   * @param {string} markdown - Complete markdown document
   * @param {Object} options - Conversion options
   * @returns {Object} Conversion result with metadata
   */
  convertDocument(markdown, options = {}) {
    const startTime = Date.now();

    // Extract title from first h1 if present
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'API Documentation';

    // Convert content
    const confluenceContent = this.convert(markdown);

    // Calculate statistics
    const stats = {
      originalLines: markdown.split('\n').length,
      convertedLines: confluenceContent.split('\n').length,
      originalSize: Buffer.byteLength(markdown, 'utf8'),
      convertedSize: Buffer.byteLength(confluenceContent, 'utf8'),
      processingTime: Date.now() - startTime
    };

    return {
      title,
      content: confluenceContent,
      stats,
      success: true
    };
  }
}