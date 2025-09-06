/**
 * Simple Template Manager
 *
 * Centralized template management following KISS principles.
 * Eliminates hardcoded paths and provides validation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TemplateManager {
  /**
   * Get path to widdershins templates directory
   * @returns {string} Absolute path to widdershins templates
   */
  static getWiddershinsTemplatesPath() {
    const templatePath = path.resolve(__dirname, '..', 'widdershins-templates');
    this.validateTemplateDirectory(templatePath, 'widdershins');
    return templatePath;
  }

  /**
   * Get path to init templates directory
   * @returns {string} Absolute path to init templates
   */
  static getInitTemplatesPath() {
    const templatePath = path.resolve(__dirname, '..', 'templates');
    this.validateTemplateDirectory(templatePath, 'init');
    return templatePath;
  }

  /**
   * Get path to specific init template file
   * @param {string} templateName - Template filename (e.g., 'serverConfig.template.json')
   * @returns {string} Absolute path to template file
   */
  static getInitTemplate(templateName) {
    const templatePath = path.join(this.getInitTemplatesPath(), templateName);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Init template not found: ${templateName}`);
    }

    return templatePath;
  }

  /**
   * Validate that template directory exists and is readable
   * @param {string} templatePath - Path to validate
   * @param {string} templateType - Type for error messaging
   */
  static validateTemplateDirectory(templatePath, templateType) {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`${templateType} templates directory not found: ${templatePath}`);
    }

    try {
      fs.accessSync(templatePath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`${templateType} templates directory not readable: ${templatePath}`);
    }
  }
}

export default TemplateManager;
