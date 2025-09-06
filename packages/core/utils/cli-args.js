/**
 * CLI Argument Parser Utility
 *
 * Centralizes common argument parsing patterns used across generators
 * to reduce code duplication and improve maintainability
 */

export class CliArgsParser {
  /**
   * Parse arguments for generators that require config and JSDoc files
   * @param {string} generatorName - Name of the generator for error messages
   * @returns {Object} Parsed arguments with config and files
   */
  static parseGeneratorArgs(generatorName) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.error(`❌ Usage: node ${generatorName}.js <serverConfig.json> <jsdoc-file1> [jsdoc-file2] ...`);
      console.error(`   Example: node ${generatorName}.js serverConfig.json ../src/router1.js ../src/router2.js`);
      process.exit(1);
    }

    const serverConfigPath = args[0];
    const jsdocFiles = args.slice(1);

    if (jsdocFiles.length === 0 && generatorName === 'generate-openapi') {
      console.error('❌ At least one JSDoc file must be specified for OpenAPI generation');
      process.exit(1);
    }

    return {
      serverConfigPath,
      jsdocFiles,
      allArgs: args
    };
  }

  /**
   * Parse arguments for generators that only work with existing OpenAPI spec
   * @param {string} _generatorName - Name of the generator for error messages
   * @returns {Object} Parsed arguments (minimal for spec-consuming generators)
   */
  static parseSpecConsumerArgs(_generatorName) {
    const args = process.argv.slice(2);

    // Spec consumers don't require arguments but can accept optional ones
    return {
      args,
      hasArgs: args.length > 0
    };
  }

  /**
   * Display usage information for a generator
   * @param {string} generatorName - Name of the generator
   * @param {string} description - Description of what the generator does
   * @param {boolean} requiresJSDoc - Whether the generator requires JSDoc files
   */
  static showUsage(generatorName, description, requiresJSDoc = false) {
    console.log(`📝 ${generatorName}`);
    console.log(`   ${description}`);

    if (requiresJSDoc) {
      console.log(`   Usage: node ${generatorName}.js <serverConfig.json> <jsdoc-file1> [jsdoc-file2] ...`);
      console.log(`   Example: node ${generatorName}.js serverConfig.json ../src/router1.js ../src/router2.js`);
    } else {
      console.log(`   Usage: node ${generatorName}.js`);
      console.log('   Note: Requires existing OpenAPI spec (run generate-openapi.js first)');
    }
  }
}

export default CliArgsParser;
