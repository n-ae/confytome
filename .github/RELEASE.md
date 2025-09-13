# Release Process

This document outlines the automated release process for Confytome packages.

## Overview

Confytome uses an automated release workflow that triggers on version changes in `package.json` files. The release process includes:

1. **Version Detection**: Automatically detects version changes in root or workspace packages
2. **Testing**: Runs full test suite including linting, unit tests, and package validation
3. **GitHub Release**: Creates tagged releases with automated changelog
4. **NPM Publishing**: Publishes all updated packages to NPM registry

## Automatic Releases

### Triggering a Release

Releases are automatically triggered when:
- Version changes are pushed to the `main` branch in `package.json` or `packages/*/package.json`
- Manual workflow dispatch with force release option

### Version Management

Use the provided scripts to manage versions across the workspace:

```bash
# Bump version across all packages
npm run version:bump

# Set specific version across all packages  
npm run version:set
```

### Release Workflow Steps

1. **Detect Changes**: Scans git history for version changes in package.json files
2. **Generate Release Notes**: Creates changelog from commits since last release
3. **Run Tests**: Executes full CI pipeline (lint, test, validate)
4. **Create GitHub Release**: Tags repository and creates release with notes
5. **Publish to NPM**: Publishes changed packages to NPM registry
6. **Notify Results**: Reports success/failure status

## Manual Release

To force a release without version changes:

1. Go to Actions tab in GitHub repository
2. Select "Release and Publish" workflow
3. Click "Run workflow"
4. Check "Force release even if version unchanged"
5. Click "Run workflow"

## Release Notes

Release notes are automatically generated and include:
- Version number and release title
- Recent commits since last release (up to 10)
- List of affected packages
- Package names with @confytome/ prefix

## Package Publishing

Each package is published independently with these checks:
- Verifies package isn't already published at current version
- Runs build and prepare scripts if present
- Publishes with public access to NPM
- Skips if version already exists

## Supported Packages

The following packages are included in automated releases:
- `@confytome/core` - Core plugin system and OpenAPI generator
- `@confytome/markdown` - Markdown documentation generator
- `@confytome/html` - HTML documentation generator
- `@confytome/swagger` - Swagger UI generator
- `@confytome/postman` - Postman collection generator
- `@confytome/generator` - Template and CLI generation utilities

## Prerequisites

### Required Secrets

The following GitHub secrets must be configured:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `NPM_TOKEN` - NPM authentication token with publish access

### NPM Token Setup

1. Log in to [npmjs.com](https://www.npmjs.com)
2. Go to Access Tokens in your account settings
3. Generate new token with "Automation" type
4. Add token to GitHub repository secrets as `NPM_TOKEN`

## Permissions

The release workflow requires these permissions:
- `contents: write` - Create releases and tags
- `packages: write` - Publish to GitHub packages (if enabled)
- `id-token: write` - OIDC token for secure publishing

## Troubleshooting

### Release Failed

If a release fails:
1. Check the Actions tab for detailed error logs
2. Common issues:
   - NPM_TOKEN expired or invalid
   - Test failures blocking release
   - Network issues during publishing
   - Package validation errors

### Package Not Published

If a specific package wasn't published:
1. Verify the package version was actually changed
2. Check if package already exists at that version on NPM
3. Review package.json for required fields (name, version, description)
4. Ensure package build/prepare scripts succeed

### Version Detection Issues

If version changes aren't detected:
1. Ensure changes are in `package.json` files (not just git tags)
2. Version changes must be in the `"version"` field specifically
3. Check that commits are pushed to the `main` branch

## Best Practices

1. **Test Before Release**: Always run `npm run validate` locally before pushing version changes
2. **Semantic Versioning**: Follow [semver](https://semver.org/) for version numbering
3. **Atomic Versions**: Keep all workspace packages at the same version for consistency
4. **Clear Commits**: Use conventional commit messages for better release notes
5. **Pre-release Testing**: Use pre-release versions (e.g., `1.0.0-beta.1`) for testing

## Monitoring Releases

- **GitHub Releases**: View all releases at `/releases`
- **NPM Registry**: Check package status at `https://www.npmjs.com/package/@confytome/[package-name]`
- **Actions History**: Monitor workflow runs in the Actions tab
- **Dependencies**: Dependabot automatically creates PRs for dependency updates