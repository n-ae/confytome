# One-Time Setup: JSDoc Comments to Markdown Documentation

This guide walks you through setting up Confytome to generate beautiful markdown documentation from your JSDoc comments in just a few steps.

## Prerequisites

- Node.js 18 or higher
- Your project with JSDoc-annotated route files

## Step 1: Install Confytome Core

```bash
# Install the core system globally
npm install -g @confytome/core

# Note: Markdown generator will be used with npx (no global install needed)
```

## Step 2: Initialize Your Documentation Project

```bash
# Navigate to your project directory
cd your-project

# Initialize confytome structure
confytome init

# This creates:
# ├── confytome/              # Documentation output directory
# ├── confytome.json          # Project configuration
# ├── serverConfig.json       # API server configuration
# └── example-router.js       # JSDoc example file
```

## Step 3: Configure Your Routes

Edit `confytome.json` to point to your actual route files:

```json
{
  "serverConfig": "serverConfig.json",
  "routeFiles": [
    "routes/users.js",
    "routes/auth.js",
    "routes/products.js"
  ]
}
```

## Step 4: Update Server Configuration

Edit `serverConfig.json` with your API details:

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Your API Name",
    "version": "1.0.0",
    "description": "Your API description",
    "contact": {
      "name": "Your Team",
      "email": "api-support@yourcompany.com"
    }
  },
  "servers": [
    {
      "url": "https://api.yourcompany.com/v1",
      "description": "Production Server"
    },
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Development Server"
    }
  ]
}
```

## Step 5: Add JSDoc Comments to Your Routes

Make sure your route files have proper JSDoc comments:

```javascript
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieves a specific user by their unique identifier
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique user identifier
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john@example.com"
 *       404:
 *         description: User not found
 */
router.get('/users/:userId', (req, res) => {
  // Your route implementation
});
```

## Step 6: Generate Documentation

Run the complete documentation generation pipeline:

```bash
# Generate OpenAPI specification from JSDoc comments
confytome generate

# Generate markdown documentation from the spec using npx
npx @confytome/markdown generate --spec confytome/api-spec.json --output confytome
```

Or use the shorthand for both steps:

```bash
# Generate spec and markdown in one command
confytome generate && npx @confytome/markdown generate --spec confytome/api-spec.json --output confytome
```

## Step 7: View Your Documentation

Your markdown documentation will be created at:

```
confytome/
├── api-spec.json        # OpenAPI 3.0.3 specification
└── api-docs.md         # Beautiful markdown documentation
```

The generated `api-docs.md` includes:

- **Table of Contents** - Quick navigation to all endpoints
- **Base URLs** - All your configured server environments  
- **Authentication** - JWT bearer token setup if configured
- **Endpoint Documentation** - For each API endpoint:
  - HTTP method and path
  - Description and summary
  - Parameters table
  - Request body schema (for POST/PUT)
  - Response codes and schemas
  - Code samples with cURL examples
- **Confluence-Ready** - Optimized for Confluence and other markdown viewers

## Automation (Optional)

### NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "docs:generate": "confytome generate && npx @confytome/markdown generate --spec confytome/api-spec.json --output confytome",
    "docs:serve": "echo 'Documentation available at: confytome/api-docs.md'"
  }
}
```

Then run:

```bash
npm run docs:generate
npm run docs:serve
```

### CI/CD Integration

Add to your CI pipeline (GitHub Actions example):

```yaml
- name: Generate API Documentation
  run: |
    npm install -g @confytome/core
    confytome generate
    npx @confytome/markdown generate --spec confytome/api-spec.json --output confytome

- name: Upload Documentation
  uses: actions/upload-artifact@v3
  with:
    name: api-documentation
    path: confytome/
```

## Troubleshooting

### Common Issues

**"No JSDoc comments found"**
- Ensure your route files use `@swagger` comments
- Check that `routeFiles` paths in `confytome.json` are correct

**"Template errors in markdown"**  
- Verify your OpenAPI spec is valid: `npx @confytome/markdown validate --spec confytome/api-spec.json`

**"Unicode characters not displaying"**
- Confytome fully supports Unicode - ensure your editor/viewer supports UTF-8

### Getting Help

- Check generated `confytome/api-spec.json` to debug JSDoc parsing issues
- Use `confytome validate` to check plugin compatibility
- Visit [GitHub Issues](https://github.com/n-ae/confytome/issues) for support

---

🎉 **You're done!** Your JSDoc comments will now automatically generate beautiful, professional markdown documentation. Run the generation command whenever you update your API routes.