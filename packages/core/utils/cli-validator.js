/**
 * Comprehensive CLI Validation Utility
 *
 * Provides centralized validation for all CLI commands with consistent
 * error messages, file checking, and helpful user guidance
 */

import fs from 'node:fs';
import path from 'node:path';
import { getOutputDir, OUTPUT_FILES, DEFAULT_OUTPUT_DIR } from '../constants.js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CliValidator {
  /**
   * Validate and parse arguments for OpenAPI generation
   * @param {string[]} args - Command line arguments
   * @param {string} generatorName - Name of the calling generator
   * @returns {Object} Validated arguments
   */
  static validateOpenAPIArgs(args, generatorName) {
    if (args.length === 0) {
      this.showOpenAPIUsage(generatorName);
      process.exit(1);
    }

    if (args.length < 2) {
      console.error('❌ Both config file and JSDoc files are required');
      console.error('');
      this.showOpenAPIUsage(generatorName);
      process.exit(1);
    }

    const serverConfigPath = args[0];
    const jsdocFiles = args.slice(1);

    // Validate config file exists
    this.validateConfigFile(serverConfigPath);

    // Validate JSDoc files exist
    this.validateJSDocFiles(jsdocFiles);

    // Validate templates directory for markdown generation
    if (generatorName === 'generate-all') {
      this.validateTemplatesDirectory();
    }

    return {
      serverConfigPath,
      jsdocFiles,
      allArgs: args
    };
  }

  /**
   * Validate arguments for spec-consuming generators
   * @param {string} _generatorName - Name of the calling generator
   * @returns {Object} Validation result
   */
  static validateSpecConsumerArgs(_generatorName) {
    // Check if OpenAPI spec exists
    const specPath = `${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`;

    if (!fs.existsSync(specPath)) {
      console.error(`❌ OpenAPI specification not found: ${specPath}`);
      console.error('');
      console.log('💡 Generate OpenAPI spec first:');
      console.log('   confytome openapi -c config.json -f router1.js router2.js');
      console.log('   OR');
      console.log('   node generate-openapi.js config.json router1.js router2.js');
      console.error('');
      process.exit(1);
    }

    // Ensure docs directory exists
    const docsDir = DEFAULT_OUTPUT_DIR;
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      console.log('📁 Created docs directory');
    }

    return {
      specPath,
      docsDir
    };
  }

  /**
   * Validate config file exists and is readable
   * @param {string} configPath - Path to config file
   */
  static validateConfigFile(configPath) {
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      console.error('');
      console.log('💡 Create a server configuration file:');

      // Check for template file
      const templatePaths = [
        './templates/serverConfig.template.json',
        path.join(process.cwd(), 'templates/serverConfig.template.json')
      ];

      const templateExists = templatePaths.find(tp => fs.existsSync(tp));

      if (templateExists) {
        console.log(`   cp ${templateExists} ${configPath}`);
        console.log(`   # Then edit ${configPath} with your API details`);
      } else {
        console.log(`   # Create ${configPath} with the following structure:`);
        console.log('   {');
        console.log('     "openapi": "3.0.0",');
        console.log('     "info": {');
        console.log('       "title": "Your API Title",');
        console.log('       "version": "1.0.0",');
        console.log('       "description": "Your API description"');
        console.log('     },');
        console.log('     "servers": [');
        console.log('       {');
        console.log('         "url": "https://api.example.com/v1",');
        console.log('         "description": "Production server"');
        console.log('       }');
        console.log('     ]');
        console.log('   }');
      }

      console.log('');
      console.log('📝 Alternative: Run "confytome init" to set up project structure');
      console.error('');
      process.exit(1);
    }

    // Validate file is readable
    try {
      fs.accessSync(configPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`❌ Cannot read config file: ${configPath}`);
      console.error(`   ${error.message}`);
      console.log(`💡 Check file permissions: chmod 644 ${configPath}`);
      console.error('');
      process.exit(1);
    }

    // Validate JSON syntax (basic check)
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      JSON.parse(content);
    } catch (error) {
      console.error(`❌ Invalid JSON in config file: ${configPath}`);
      console.error(`   ${error.message}`);
      console.log('💡 Validate JSON syntax:');
      console.log(`   jsonlint ${configPath}`);
      console.log('   # OR use online JSON validator');
      console.error('');
      process.exit(1);
    }
  }

  /**
   * Validate JSDoc files exist and are readable
   * @param {string[]} jsdocFiles - Array of JSDoc file paths
   */
  static validateJSDocFiles(jsdocFiles) {
    if (jsdocFiles.length === 0) {
      console.error('❌ At least one JSDoc file must be specified');
      console.error('');
      this.showJSDocHelp();
      process.exit(1);
    }

    const missingFiles = [];
    const unreadableFiles = [];

    jsdocFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      } else {
        try {
          fs.accessSync(file, fs.constants.R_OK);
        } catch {
          unreadableFiles.push(file);
        }
      }
    });

    if (missingFiles.length > 0) {
      console.error('❌ JSDoc files not found:');
      missingFiles.forEach(file => {
        console.error(`   ${file}`);
      });
      console.error('');
      this.showJSDocHelp();
      process.exit(1);
    }

    if (unreadableFiles.length > 0) {
      console.error('❌ Cannot read JSDoc files:');
      unreadableFiles.forEach(file => {
        console.error(`   ${file}`);
      });
      console.log('💡 Check file permissions:');
      unreadableFiles.forEach(file => {
        console.log(`   chmod 644 ${file}`);
      });
      console.error('');
      process.exit(1);
    }

    console.log(`📄 Validated ${jsdocFiles.length} JSDoc files`);
  }

  /**
   * Validate templates directory for markdown generation
   */
  static validateTemplatesDirectory() {
    const templatesDir = './templates';

    if (!fs.existsSync(templatesDir)) {
      console.error(`⚠️  Mustache templates not found: ${templatesDir}`);
      console.log('💡 Markdown generation may use default templates');
      console.log('   To use custom templates:');
      console.log('   1. Create templates/ directory');
      console.log('   2. Add custom .mustache template files');
      console.log('');
    } else {
      console.log('📂 Templates directory found');
    }
  }

  /**
   * Show usage information for OpenAPI generators
   * @param {string} generatorName - Name of the generator
   */
  static showOpenAPIUsage(generatorName) {
    const command = generatorName.replace('generate-', '');

    console.log(`📝 ${generatorName} - Generate OpenAPI specification from JSDoc`);
    console.log('');
    console.log('Usage:');
    console.log(`   confytome ${command} -c <config> -f <files...>`);
    console.log(`   node ${generatorName}.js <config> <files...>`);
    console.log('');
    console.log('Examples:');
    console.log('   confytome openapi -c config.json -f router.js controller.js');
    console.log('   node generate-openapi.js serverConfig.json src/routes/*.js');
    console.log('   confytome all -c config.json -f router1.js router2.js');
    console.log('');
    console.log('Arguments:');
    console.log('   <config>     Server configuration JSON file');
    console.log('   <files...>   One or more JavaScript files with JSDoc comments');
    console.log('');
  }

  /**
   * Show usage information for spec-consuming generators
   * @param {string} generatorName - Name of the generator
   */
  static showSpecConsumerUsage(generatorName) {
    const command = generatorName.replace('generate-', '');

    console.log(`📝 ${generatorName} - Generate documentation from OpenAPI spec`);
    console.log('');
    console.log('Usage:');
    console.log(`   confytome ${command}`);
    console.log(`   node ${generatorName}.js`);
    console.log('');
    console.log('Prerequisites:');
    console.log(`   - OpenAPI spec must exist: ${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    console.log('   - Generate it first with: confytome openapi -c config.json -f files...');
    console.log('');
  }

  /**
   * Show help for JSDoc files
   */
  static showJSDocHelp() {
    console.log('💡 JSDoc files should contain:');
    console.log('   - JavaScript/Node.js files (.js)');
    console.log('   - Express route files with @swagger comments');
    console.log('   - API controller files with OpenAPI documentation');
    console.log('');
    console.log('Example JSDoc comment:');
    console.log('   /**');
    console.log('    * @swagger');
    console.log('    * /api/users:');
    console.log('    *   get:');
    console.log('    *     summary: Get users');
    console.log('    *     responses:');
    console.log('    *       200:');
    console.log('    *         description: Success');
    console.log('    */');
    console.log('');
  }

  /**
   * Check if all required tools are available
   */
  static validateEnvironment() {
    // Environment validation for dependencies
    // Note: Mustache templating is built-in, no external validation needed
    console.log('✅ Environment validated - using built-in Mustache templating');

    return true;
  }

  /**
   * Validate initialization requirements
   * @returns {Object} Initialization status
   */
  static validateInitRequirements() {
    const docsDir = DEFAULT_OUTPUT_DIR;
    const configFile = './serverConfig.json';
    const templateFile = './templates/serverConfig.template.json';
    const templatesDir = './templates';
    const packagedTemplateDir = './templates';

    return {
      docsExists: fs.existsSync(docsDir),
      configExists: fs.existsSync(configFile),
      templateExists: fs.existsSync(templateFile),
      templatesExist: fs.existsSync(templatesDir),
      packagedTemplatesExist: fs.existsSync(packagedTemplateDir),
      canCreateDocs: this.canWrite('.'),
      canCreateConfig: !fs.existsSync(configFile) && this.canWrite('.'),
      canCreateTemplates: !fs.existsSync(templatesDir) && this.canWrite('.')
    };
  }

  /**
   * Create directory structure for confytome project
   * @param {string} outputDir - Base output directory (default: DEFAULT_OUTPUT_DIR)
   */
  static createProjectStructure(outputDir) {
    outputDir = getOutputDir(outputDir);
    const dirs = [
      outputDir,
      path.join(outputDir, 'assets')  // For static swagger UI assets
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });

    return dirs;
  }

  /**
   * Copy template files to project
   * @param {Object} options - Copy options
   */
  static copyTemplateFiles(options = {}) {
    const {
      outputDir = '.',
      sourceTemplateDir = path.join(path.dirname(__dirname), 'templates'),
      configFileName = 'serverConfig.json',
      forceOverwrite = false
    } = options;

    const results = {
      configCreated: false,
      templatesCreated: false,
      confytomeCreated: false,
      exampleCreated: false
    };

    // 1. Copy server config template
    const configTemplatePath = path.join(sourceTemplateDir, 'serverConfig.template.json');
    const configPath = path.join(outputDir, configFileName);

    if (fs.existsSync(configTemplatePath)) {
      if (!fs.existsSync(configPath) || forceOverwrite) {
        fs.copyFileSync(configTemplatePath, configPath);
        console.log(`✅ Created ${configFileName} from template`);
        console.log(`   📝 Edit ${configFileName} with your API details`);
        results.configCreated = true;
      } else {
        console.log(`✅ ${configFileName} already exists`);
      }
    }

    // 2. Copy Mustache templates if they don't exist
    const templatesDir = path.join(outputDir, 'templates');
    if (!fs.existsSync(templatesDir)) {
      // Create basic Mustache template structure
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log('✅ Created templates directory');
      console.log('   💡 Add custom .mustache template files for Markdown customization');
      results.templatesCreated = true;
    }

    // 3. Copy confytome config template if it doesn't exist
    const confytomeConfigPath = path.join(outputDir, 'confytome.json');
    const confytomeTemplatePath = path.join(sourceTemplateDir, 'confytome.template.json');

    if (fs.existsSync(confytomeTemplatePath) && !fs.existsSync(confytomeConfigPath)) {
      fs.copyFileSync(confytomeTemplatePath, confytomeConfigPath);
      console.log('✅ Created confytome.json configuration');
      console.log('   💡 Use this for simplified project configuration');
      results.confytomeCreated = true;
    }

    // 4. Copy example files if they don't exist
    const exampleFiles = [
      {
        template: 'example-router.js',
        target: path.join(outputDir, 'example-router.js'),
        description: 'Created example-router.js with API endpoint examples'
      },
      {
        template: 'example-auth-routes.js',
        target: path.join(outputDir, 'example-auth-routes.js'),
        description: 'Created example-auth-routes.js with server override examples'
      }
    ];

    exampleFiles.forEach(({ template, target, description }) => {
      const templatePath = path.join(sourceTemplateDir, template);

      if (fs.existsSync(templatePath) && !fs.existsSync(target)) {
        fs.copyFileSync(templatePath, target);
        console.log(`✅ ${description}`);
        results.exampleCreated = true;
      }
    });

    if (results.exampleCreated) {
      console.log('   💡 Use these files as references for documenting your API endpoints');
      console.log('   💡 example-auth-routes.js demonstrates server overrides in confytome.json');
    }

    return results;
  }

  /**
   * Check if directory is writable
   * @param {string} dirPath - Directory to check
   * @returns {boolean} Whether directory is writable
   */
  static canWrite(dirPath) {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}

