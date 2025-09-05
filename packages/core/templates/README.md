# Confytome Project Templates

This directory contains template files used by the `confytome init` command to set up new projects with the plugin-based architecture.

## Template Files

- **serverConfig.template.json** - OpenAPI server configuration with API metadata and authentication settings
- **confytome.template.json** - Simplified project configuration with server override examples for plugin system
- **example-router.js** - Example JSDoc-documented API router demonstrating best practices  
- **example-auth-routes.js** - Example authentication routes showing server overrides
- **README.md** - This documentation file

## Plugin System Usage

### Recommended: Unified Configuration (Plugin System)
```bash
# Initialize project structure
confytome init

# Edit confytome.json with your route files and server overrides
# Generate all documentation using plugin registry
confytome generate
```

### Alternative: Advanced Configuration  
For more granular control over individual generators:
```bash
# Generate OpenAPI spec first
confytome openapi -c serverConfig.json -f your-router.js

# Run specific plugins
confytome run generate-html generate-markdown

# Or run all spec consumer plugins
confytome run-all
```

### Plugin Management Commands
```bash
# List available generators
confytome generators

# Get detailed plugin information
confytome info generate-html

# Validate plugin compatibility
confytome validate
```

## Server Override Examples

The `confytome.template.json` demonstrates server overrides - a powerful feature for handling different server patterns:

### Use Cases

1. **Auth vs API Routes**
   - Auth routes: `server + path` (e.g., `http://localhost:3000/auth/login`)
   - API routes: `server + base_path + path` (e.g., `http://localhost:3000/api/v1/users`)

2. **Microservices**
   - Different services on different ports/domains
   - Route specific traffic to appropriate servers

3. **Development vs Production**
   - Override production URLs with local development servers
   - Test specific routes against staging environments

### Configuration Example

```json
{
  "serverConfig": "serverConfig.json",
  "routeFiles": [
    "example-auth-routes.js",
    "example-router.js"
  ]
}
```

### JSDoc Server Override Examples

#### Standard Routes (Use Default Server)

Most routes don't need server overrides and will use the server from `serverConfig.json`:

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     # No servers field = uses default server from serverConfig.json
 */
```

#### Routes with Custom Server Override

Some routes (like auth) may need different servers using standard OpenAPI `servers:` field:

```javascript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     tags: [Authentication]
 *     summary: User login
 */
```

### Network File Support

Route files support:
- **Relative paths**: `routes/api.js`
- **Absolute paths**: `/full/path/to/routes.js`  
- **Network URLs**: `https://raw.githubusercontent.com/user/repo/main/routes.js`

## Plugin Development

These templates also serve as examples for plugin developers:

### Generator Plugin Structure
```javascript
// Example from template files
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

class CustomGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('generate-custom', 'Custom format generator', outputDir, services);
  }
  
  async generate() {
    return this.generateDocument('custom', 'output.custom', (spec, services) => {
      // Use spec and services to generate custom format
      return this.processOpenAPISpec(spec, services);
    });
  }
}

export default CustomGenerator;
```

### External Plugin Development
For creating external plugins as npm packages:
- Follow `confytome-plugin-*` naming convention
- Use `@confytome/core` as peer dependency
- Implement generator discovery pattern
- See [PLUGIN-SYSTEM.md](../../../PLUGIN-SYSTEM.md) for comprehensive guide

## Template Customization

Organizations can customize these templates:
- Fork the repository and modify templates
- Create custom `confytome init` workflows
- Develop organization-specific plugins
- Templates are used by init command for project scaffolding

## Integration with Plugin System

Templates work seamlessly with the plugin registry:
1. **Project Init**: `confytome init` creates template files
2. **Plugin Discovery**: Templates work with both workspace and external plugins  
3. **Service Integration**: Templates support dependency injection and service layer
4. **Validation**: Templates include plugin compatibility validation