# Contributing to Confytome

Thank you for your interest in contributing to Confytome! This document provides guidelines for contributors working on both the core system and plugins.

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

# Install dependencies (uses npm workspaces)
npm install

# Verify setup
npm run test:core
npm run security:check
```

## 🏗️ Project Architecture

### Core Principles

1. **Plugin-First Architecture**: Extensible generator registry system
2. **OpenAPI-First Design**: All generators consume OpenAPI specifications
3. **Service Layer**: Centralized branding, versioning, and templates
4. **Dependency Injection**: Clean separation of concerns
5. **CLI-Friendly**: Comprehensive validation and user guidance

### Monorepo Structure

```
confytome/
├── packages/
│   ├── core/                    # Core OpenAPI generator and plugin system
│   │   ├── cli.js               # Main CLI with plugin commands
│   │   ├── generate-openapi.js  # OpenAPI spec generator
│   │   ├── services/            # Plugin registry and factories
│   │   │   ├── GeneratorRegistry.js
│   │   │   ├── GeneratorFactory.js
│   │   │   ├── PluginInterface.js
│   │   │   └── ServiceFactory.js
│   │   └── utils/               # Base classes and utilities
│   ├── html/                    # HTML documentation generator
│   ├── markdown/                # Markdown documentation generator
│   ├── swagger/                 # Swagger UI generator
│   └── postman/                 # Postman collection generator
├── PLUGIN-SYSTEM.md             # Comprehensive plugin development guide
└── docs/                        # Generated documentation
```

## 🔌 Plugin System

### Core Components

- **GeneratorRegistry**: Automatic discovery and registration
- **GeneratorFactory**: Clean generator instantiation
- **PluginInterface**: Tools for external plugin development
- **Service Layer**: Shared branding, versioning, and templates

### Plugin Commands

```bash
# List all available generators
confytome generators

# Show detailed generator information
confytome info generate-html

# Show compatible generators
confytome recommended

# Validate generator dependencies
confytome validate

# Execute specific generators
confytome run generate-html generate-markdown

# Execute all spec consumers
confytome run-all
```

## 📝 Contributing Types

### 1. Core System Contributions

#### Adding New Features

```javascript
// Example: Adding new CLI command
program
  .command('new-feature')
  .description('Description of new feature')
  .action(async (options) => {
    // Implementation using plugin system
    await registryOrchestrator.executeGenerator('feature-generator');
  });
```

#### Improving Base Classes

```javascript
// utils/base-generator.js
export class SpecConsumerGeneratorBase extends BaseGenerator {
  // Add new shared functionality
  async newSharedMethod() {
    // Implementation available to all generators
  }
}
```

### 2. Generator Plugin Contributions

#### Creating New Workspace Generators

1. **Create Package Directory**
   ```bash
   mkdir packages/my-generator
   cd packages/my-generator
   ```

2. **Setup Package**
   ```json
   // package.json
   {
     "name": "@confytome/my-generator",
     "version": "1.2.0",
     "type": "module",
     "peerDependencies": {
       "@confytome/core": "^1.2.0"
     }
   }
   ```

3. **Implement Generator**
   ```javascript
   // generate-my-format.js
   import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

   class MyFormatGenerator extends SpecConsumerGeneratorBase {
     constructor(outputDir = './docs', services = null) {
       super('generate-my-format', 'My custom format generator', outputDir, services);
     }

     async generate() {
       console.log('🎨 Generating my format documentation...');
       
       return this.generateDocument('my-format', 'api-docs.myformat', (openApiSpec, services) => {
         // Your generation logic here
         return this.generateCustomFormat(openApiSpec, services);
       });
     }

     generateCustomFormat(openApiSpec, services) {
       // Implementation
       return 'Generated content';
     }

     getSuccessMessage() {
       return 'My format documentation generation completed';
     }
   }

   // Auto-discovery support
   BaseGenerator.runIfMain(MyFormatGenerator, import.meta.url);
   
   export { MyFormatGenerator };
   export default MyFormatGenerator;
   ```

4. **Test Generator**
   ```bash
   # Test discovery
   confytome generators
   
   # Test execution
   confytome run generate-my-format
   ```

#### Creating External Plugins

See [PLUGIN-SYSTEM.md](./PLUGIN-SYSTEM.md) for comprehensive guide on external plugin development.

### 3. Documentation Contributions

#### Updating Generator Documentation

Each generator package should have:
- Clear README.md with installation and usage
- Examples of generated output
- Configuration options
- Troubleshooting guide

#### Core Documentation

- Update [README.md](./README.md) for new features
- Update [PLUGIN-SYSTEM.md](./PLUGIN-SYSTEM.md) for plugin changes
- Update [CHANGELOG.md](./CHANGELOG.md) for releases

## 🧪 Testing

### Core System Testing

```bash
# Run core tests
npm run test:core

# Test plugin discovery
confytome generators

# Test specific generator
confytome info generate-html
confytome validate generate-html
```

### Manual Testing Checklist

#### Plugin System
- [ ] Generator discovery works for workspace packages
- [ ] External plugin loading (if applicable)
- [ ] CLI commands provide helpful output
- [ ] Error handling shows clear messages
- [ ] Service injection works correctly

#### Generator Quality
- [ ] OpenAPI spec consumed correctly
- [ ] Output format is valid and complete
- [ ] Branding integration works
- [ ] File handling is robust
- [ ] Unicode/special characters preserved

### Integration Testing

```bash
# Test complete workflow
confytome init
confytome openapi -c serverConfig.json -f example-router.js
confytome run-all

# Test error scenarios
confytome run nonexistent-generator
confytome validate missing-deps-generator
```

## 🔍 Code Quality

### ES Modules Standards

```javascript
// Good: Use ES6 import/export
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

// Good: Use async/await
async generate() {
  const result = await this.generateDocument('html', 'api-docs.html', 
    (spec, services) => this.createHTML(spec, services)
  );
  return result;
}

// Good: Use service injection
async generate() {
  const services = this.getServices(import.meta.url, 'html');
  const branding = services.branding.generateForHtml();
}
```

### Error Handling

```javascript
// Good: Use base class error handling
try {
  const result = await this.processContent(content);
  return result;
} catch (error) {
  throw new Error(`Failed to process content: ${error.message}`);
}

// Good: Provide helpful CLI errors
if (!fs.existsSync(specPath)) {
  console.error('❌ OpenAPI spec not found');
  console.log('💡 Generate spec first: confytome openapi -c config.json -f routes.js');
  process.exit(1);
}
```

### Service Integration

```javascript
// Good: Use dependency injection
constructor(outputDir = './docs', services = null) {
  super('generate-format', 'Format generator', outputDir, services);
}

// Good: Use template methods
async generate() {
  return this.generateDocument('format', 'output.format', (spec, services) => {
    return this.customGenerationLogic(spec, services);
  });
}
```

## 📋 Pull Request Process

### Before Submitting

1. **Test Thoroughly**
   ```bash
   npm run test:core
   npm run security:check
   
   # Test plugin system
   confytome generators
   confytome validate
   
   # Test your specific changes
   confytome run your-generator
   ```

2. **Update Documentation**
   - Add/update JSDoc comments
   - Update relevant README.md files
   - Update CHANGELOG.md for significant changes
   - Add plugin documentation if creating generators

3. **Check Compatibility**
   - Existing CLI commands work
   - Plugin discovery still functions
   - Service injection works correctly
   - Generated output remains valid

### PR Guidelines

#### Title Format
```
feat: add PDF generator plugin
fix: resolve service injection issue in markdown generator
docs: update plugin development guide
refactor: consolidate generator validation logic
```

#### Description Template
```markdown
## What does this PR do?
Brief description of changes

## Why is this change needed?
Problem being solved or feature being added

## How was it tested?
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Plugin discovery works
- [ ] Generated output verified

## Breaking Changes
None / List any breaking changes

## Additional Notes
Any additional context or considerations
```

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Run: `confytome generators`
2. Execute: `confytome run generate-html`
3. Notice: Error in output

**Expected vs Actual**
- Expected: Clean HTML output
- Actual: Malformed HTML with missing elements

**Environment**
- Node.js version: 
- confytome version: (`confytome --version`)
- OS: 
- Package versions: (`npm list @confytome/*`)

**Plugin Information**
```bash
confytome info generate-html
confytome validate generate-html
```

**Generated Output**
Attach relevant files or error messages
```

## 🏆 Recognition

Contributors are recognized through:
- GitHub contributors graph
- README.md acknowledgments section
- CHANGELOG.md for significant contributions
- Plugin author credits in generated output (optional)

## 📚 Additional Resources

- [PLUGIN-SYSTEM.md](./PLUGIN-SYSTEM.md) - Comprehensive plugin development guide
- [Generator Base Classes](./packages/core/utils/base-generator.js) - Core generator patterns
- [Service Layer](./packages/core/services/) - Shared services documentation
- [CLI Commands](./packages/core/cli.js) - Available CLI commands

## 📞 Getting Help

- 💬 **GitHub Discussions**: General questions and ideas
- 🐛 **GitHub Issues**: Bug reports and feature requests
- 📖 **Documentation**: In-depth guides and examples

---

**Thank you for contributing to Confytome!** Your contributions help build a better, more extensible documentation ecosystem for developers worldwide.