# @confytome/postman

Postman collection generator for Confytome - generates Postman collections and environment variables from OpenAPI specifications for API testing.

## Installation

```bash
npm install -g @confytome/postman
```

## Usage

```bash
# Generate Postman collection from confytome.json config
npx @confytome/postman --config confytome.json

# Specify custom output directory
npx @confytome/postman --config confytome.json --output ./api-docs

# Use existing OpenAPI spec
npx @confytome/postman --spec ./docs/api-spec.json --output ./docs
```

## Options

- `--config, -c <path>` - Path to confytome.json config file (default: ./confytome.json)
- `--output, -o <path>` - Output directory for generated files (default: ./docs)
- `--spec <path>` - Path to existing OpenAPI spec file

## Features

- 📥 **Complete Postman Collections** - Ready-to-import collection with all API endpoints
- 🌍 **Environment Variables** - Pre-configured environment with base URLs and auth tokens
- 🧪 **Built-in Tests** - Automatic status code and response time validation
- 📋 **Request Examples** - Sample request bodies and query parameters
- 🔐 **Authentication Support** - Bearer token authentication setup
- 🎯 **Path Parameters** - Automatic conversion from OpenAPI to Postman format

## Dependencies

- **@confytome/core**: This package requires the main `@confytome/core` package to generate OpenAPI specs first

## Generated Files

Creates two files for import into Postman:

### 1. `api-postman.json` - Collection File
- Complete API request collection
- Organized by endpoints with proper naming
- Request bodies with example data
- Query parameters with sample values
- Built-in test scripts for validation

### 2. `api-postman-env.json` - Environment File
- `BASE_URL` - API base URL from OpenAPI spec
- `API_VERSION` - API version number
- `AUTH_TOKEN` - Placeholder for authentication token

## How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection

## Collection Features

- **Automatic Headers**: Content-Type and Authorization headers included
- **Parameter Mapping**: OpenAPI parameters converted to Postman format
- **Response Validation**: Built-in tests for status codes and response times
- **Variable Usage**: Uses environment variables for flexible configuration
- **Example Data**: Realistic example values for all request fields

## Environment Variables

The generated environment includes:

```json
{
  "BASE_URL": "https://api.example.com/v1",
  "API_VERSION": "1.0.0", 
  "AUTH_TOKEN": "your_auth_token_here"
}
```

Update `AUTH_TOKEN` with your actual authentication token before testing.

## Part of Confytome Ecosystem

Part of the [Confytome](https://github.com/n-ae/confytome) documentation ecosystem.

- **@confytome/core** - OpenAPI spec generator
- **@confytome/markdown** - Confluence-friendly Markdown docs
- **@confytome/swagger** - Interactive Swagger UI
- **@confytome/html** - Professional HTML docs
- **@confytome/postman** - Postman collections (this package)