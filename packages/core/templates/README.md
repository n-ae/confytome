# Confytome Templates

This directory contains template files used by the `confytome init` command to set up new projects.

## Files

- **serverConfig.template.json** - Template for server configuration with API info and authentication settings
- **confytome.template.json** - Simplified project configuration with server override examples
- **example-router.js** - Example JSDoc-documented API router showing best practices  
- **example-auth-routes.js** - Example auth routes demonstrating server overrides
- **README.md** - This file

## Usage

### Option 1: Simple Configuration (Recommended)
Run `confytome init` and use the confytome.json approach:
1. Edit `confytome.json` with your route files and server overrides
2. Run `confytome generate --config confytome.json` to generate all documentation

### Option 2: Advanced Configuration  
Use individual files for more control:
1. Edit `serverConfig.json` with your API details
2. Run `confytome all --config serverConfig.json --files your-router.js` to generate documentation

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

## Customization

You can customize these templates for your organization's needs. The templates are used by the init command to create starting files for new projects.