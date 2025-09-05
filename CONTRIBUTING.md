# Contributing to Confytome

Thank you for your interest in contributing to Confytome! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/n-ae/confytome
cd confytome

# Install dependencies
npm install

# Verify setup
npm run test
npm run security:check
```

## 🏗️ Project Architecture

### Core Principles

1. **OpenAPI-First Architecture**: All generators consume OpenAPI specifications
2. **Parametric Design**: No hardcoded file references or paths
3. **Template-Based Output**: Customizable via templates
4. **Centralized Utilities**: Shared error handling, validation, and file operations
5. **CLI-Friendly**: Comprehensive validation and user guidance

### Directory Structure

```
confytome/
├── cli.js                    # CLI entry point
├── generate-*.js             # Individual format generators
├── utils/                    # Shared utilities
│   ├── base-generator.js     # Common generator patterns
│   ├── cli-validator.js      # Input validation
│   ├── error-handler.js      # Error handling
│   └── file-manager.js       # File operations
└── widdershins-templates/    # Markdown templates
```

## 📝 Coding Standards

### ES Modules

- Use ES6 import/export syntax
- Follow modern JavaScript practices
- Use async/await for asynchronous operations

### Error Handling

- Use the centralized `ErrorHandler` class
- Provide helpful error messages with suggestions
- Validate inputs early using `CliValidator`

### Code Style

```javascript
// Good: Use descriptive names
export class DocumentationGenerator extends BaseGenerator {
  constructor() {
    super('docs-generator', 'Generating documentation from OpenAPI spec');
  }

  async generate(args) {
    // Implementation
  }
}

// Good: Use centralized error handling
try {
  const result = await this.processFiles(files);
  return result;
} catch (error) {
  ErrorHandler.handleGeneratorError(error, this.name);
}
```

## 🔧 Adding New Features

### Adding a New Output Format

1. **Create the Generator**
   ```javascript
   // generate-{format}.js
   import { SpecConsumerGeneratorBase } from './utils/base-generator.js';
   
   class FormatGenerator extends SpecConsumerGeneratorBase {
     constructor() {
       super('generate-format', 'Generating {format} documentation');
     }
   
     async generate() {
       const spec = this.loadOpenAPISpec();
       // Generate format-specific output
       return result;
     }
   }
   ```

2. **Add CLI Command**
   ```javascript
   // packages/core/cli.js
   program
     .command('format')
     .description('Generate {format} documentation')
     .action(async () => {
       try {
         CliValidator.validateSpecConsumerArgs('generate-format');
         const { execSync } = await import('child_process');
         execSync('node generate-format.js', { stdio: 'inherit' });
       } catch (error) {
         console.error('❌ Format generation failed');
         process.exit(1);
       }
     });
   ```

3. **Update generate-all.js**
   ```javascript
   const generators = [
     // ... existing generators
     {
       name: 'Format Documentation',
       command: 'npm run docs:format',
       description: 'Generate {format} documentation',
       outputs: ['./docs/output.format']
     }
   ];
   ```

4. **Add npm script**
   ```json
   {
     "scripts": {
       "docs:format": "node generate-format.js"
     }
   }
   ```

### Adding New Validation

```javascript
// utils/cli-validator.js
static validateFormatSpecificArgs(args) {
  // Add validation logic
  if (!this.checkFormatRequirements()) {
    console.error('❌ Format-specific requirements not met');
    console.log('💡 Install required dependencies...');
    process.exit(1);
  }
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] All CLI commands work with help text
- [ ] Error handling provides helpful messages
- [ ] Generated output is valid and complete
- [ ] Turkish/Unicode characters are preserved
- [ ] Templates generate clean Confluence-friendly Markdown
- [ ] Multiple environments (dev/staging/prod) work correctly

### Testing Commands

```bash
# Test basic functionality
confytome init
confytome all -c serverConfig.json -f test-files/*.js

# Test error scenarios
confytome openapi -c nonexistent.json -f missing.js
confytome swagger # without OpenAPI spec
confytome all # without arguments

# Test individual formats
confytome openapi -c config.json -f routes/*.js
confytome swagger
confytome html
confytome markdown
confytome postman
```

### Test Coverage Areas

1. **CLI Validation**
   - Missing files and helpful error messages
   - Invalid JSON configuration
   - File permission issues

2. **Generation Quality**
   - OpenAPI 3.0.3 compliance
   - Markdown template rendering
   - HTML styling and responsiveness
   - Postman collection validity

3. **Multilingual Support**
   - Turkish characters in navigation anchors
   - Unicode preservation in all formats
   - Special character handling in templates

## 📋 Pull Request Process

### Before Submitting

1. **Test Your Changes**
   ```bash
   npm run test
   npm run security:check
   
   # Manual testing
   confytome all -c example-config.json -f example-routes/*.js
   ```

2. **Update Documentation**
   - Update README.md if adding features
   - Add JSDoc comments for new functions
   - Update configuration examples if needed

3. **Check Backwards Compatibility**
   - Existing CLI commands still work
   - Generated output formats remain compatible
   - Configuration file structure unchanged

### PR Guidelines

1. **Clear Description**
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?

2. **Small, Focused Changes**
   - One feature or fix per PR
   - Keep changes minimal and focused

3. **Commit Messages**
   ```
   feat: add PDF output format generator
   fix: resolve Turkish character encoding in Markdown
   docs: update installation instructions
   refactor: centralize file validation logic
   ```

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Bug Description**
Clear description of what went wrong

**Steps to Reproduce**
1. Run command: `confytome all -c config.json -f routes/*.js`
2. Check output in docs/
3. Notice issue with...

**Expected vs Actual**
- Expected: Clean Markdown output
- Actual: Broken formatting with HTML tags

**Environment**
- Node.js version: 
- npm version:
- OS: 
- confytome version:

**Configuration**
```json
// serverConfig.json content
```

**Generated Files**
- Attach or paste relevant generated output
```

### Common Issues

1. **Template Issues**
   - Check widdershins-templates/ files
   - Validate .dot template syntax
   - Test with minimal JSDoc input

2. **CLI Issues**
   - Verify file paths are correct
   - Check file permissions
   - Test with absolute paths

3. **Generation Issues**
   - Validate OpenAPI spec compliance
   - Check JSDoc comment syntax
   - Verify server configuration

## 🏆 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- GitHub contributors list
- Release notes for significant contributions

## 📞 Questions?

- 💬 **Discussions**: GitHub Discussions
- 🐛 **Issues**: GitHub Issues

---

**Thank you for contributing to Confytome!** Every contribution helps make API documentation better for developers worldwide.
