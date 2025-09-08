/**
 * Template Service
 *
 * Centralized service for managing template operations across all generators.
 * Provides consistent template path resolution and management.
 */

import fs from 'node:fs';
import path from 'node:path';

export class TemplateService {
  static #templateCache = new Map();

  /**
   * Get the path to Mustache templates for markdown generation
   * @param {string} packagePath - Path to the package (typically import.meta.url)
   * @returns {string} Path to Mustache templates directory
   */
  static getMustacheTemplatesPath(packagePath = null) {
    // If no package path provided, assume markdown package
    if (!packagePath) {
      // Default to markdown package templates
      return path.resolve(process.cwd(), 'packages/markdown/templates');
    }

    // Handle import.meta.url format
    let basePath;
    if (packagePath.startsWith('file://')) {
      basePath = path.dirname(new URL(packagePath).pathname);
    } else {
      basePath = packagePath;
    }

    // Look for templates directory
    const templatesPath = path.join(basePath, 'templates');

    if (fs.existsSync(templatesPath)) {
      return templatesPath;
    }

    // Fallback to markdown package templates
    const fallbackPath = path.resolve(process.cwd(), 'packages/markdown/templates');
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }

    throw new Error('Mustache templates directory not found');
  }


  /**
   * Read a template file with caching
   * @param {string} templatePath - Full path to template file
   * @param {string} encoding - File encoding (default: 'utf8')
   * @returns {string} Template content
   */
  static readTemplate(templatePath, encoding = 'utf8') {
    // Check cache first
    const cacheKey = `${templatePath}:${encoding}`;
    if (this.#templateCache.has(cacheKey)) {
      return this.#templateCache.get(cacheKey);
    }

    try {
      const content = fs.readFileSync(templatePath, encoding);

      // Cache the content
      this.#templateCache.set(cacheKey, content);

      return content;
    } catch (error) {
      throw new Error(`Failed to read template file ${templatePath}: ${error.message}`);
    }
  }

  /**
   * Write a template file
   * @param {string} templatePath - Full path to template file
   * @param {string} content - Template content
   * @param {string} encoding - File encoding (default: 'utf8')
   */
  static writeTemplate(templatePath, content, encoding = 'utf8') {
    try {
      // Ensure directory exists
      const dir = path.dirname(templatePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(templatePath, content, encoding);

      // Update cache
      const cacheKey = `${templatePath}:${encoding}`;
      this.#templateCache.set(cacheKey, content);
    } catch (error) {
      throw new Error(`Failed to write template file ${templatePath}: ${error.message}`);
    }
  }

  /**
   * Check if a template file exists
   * @param {string} templatePath - Full path to template file
   * @returns {boolean} True if template exists
   */
  static templateExists(templatePath) {
    return fs.existsSync(templatePath);
  }

  /**
   * Get all template files in a directory
   * @param {string} templateDir - Template directory path
   * @param {string} extension - File extension to filter by (e.g., '.dot', '.mustache')
   * @returns {Array<string>} Array of template file paths
   */
  static getTemplateFiles(templateDir, extension = null) {
    try {
      const files = fs.readdirSync(templateDir);

      return files
        .filter(file => {
          if (extension && !file.endsWith(extension)) {
            return false;
          }

          const filePath = path.join(templateDir, file);
          return fs.statSync(filePath).isFile();
        })
        .map(file => path.join(templateDir, file))
        .sort();
    } catch (error) {
      throw new Error(`Failed to read template directory ${templateDir}: ${error.message}`);
    }
  }

  /**
   * Process a template with simple variable substitution
   * @param {string} template - Template content
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed template
   */
  static processTemplate(template, variables = {}) {
    let processed = template;

    // Simple variable substitution using {{variable}} syntax
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  /**
   * Create a backup of a template file
   * @param {string} templatePath - Path to template file
   * @param {string} backupSuffix - Backup file suffix (default: '.bak')
   * @returns {string} Backup file path
   */
  static backupTemplate(templatePath, backupSuffix = '.bak') {
    const backupPath = templatePath + backupSuffix;

    try {
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, backupPath);
        return backupPath;
      } else {
        throw new Error('Template file does not exist');
      }
    } catch (error) {
      throw new Error(`Failed to create backup of ${templatePath}: ${error.message}`);
    }
  }

  /**
   * Validate template syntax (basic check for unclosed variables)
   * @param {string} template - Template content
   * @returns {Array<string>} Array of validation errors (empty if valid)
   */
  static validateTemplate(template) {
    const errors = [];

    // Check for unclosed variable references
    const openBraces = (template.match(/{{\s*/g) || []).length;
    const closeBraces = (template.match(/\s*}}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    // Check for potential syntax issues
    const unclosedVariables = template.match(/{{\s*\w+\s*(?!}})/g);
    if (unclosedVariables && unclosedVariables.length > 0) {
      errors.push(`Potentially unclosed variables: ${unclosedVariables.join(', ')}`);
    }

    return errors;
  }

  /**
   * Clear the template cache
   */
  static clearCache() {
    this.#templateCache.clear();
  }

  /**
   * Get cache statistics (for debugging)
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.#templateCache.size,
      entries: Array.from(this.#templateCache.keys()).map(key => ({
        key: key.replace(process.cwd(), '.'),
        size: this.#templateCache.get(key).length
      }))
    };
  }

  /**
   * Initialize template directories if they don't exist
   * @param {Array<string>} templateDirs - Array of template directories to ensure exist
   */
  static initializeTemplateDirectories(templateDirs) {
    for (const dir of templateDirs) {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created template directory: ${dir}`);
        } catch (error) {
          console.warn(`Warning: Could not create template directory ${dir}: ${error.message}`);
        }
      }
    }
  }
}

export default TemplateService;
