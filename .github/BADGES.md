# 📊 Badge Documentation

This document explains all the badges used across the confytome project and their purpose.

## 🏷️ Badge Types

### 🔧 Build & CI Status
```markdown
[![Build](https://github.com/n-ae/confytome/workflows/CI/badge.svg)](https://github.com/n-ae/confytome/actions)
```
- **Purpose**: Shows current build status of the main CI workflow
- **Color**: Green (passing) / Red (failing)
- **Links to**: GitHub Actions page for detailed build information

### 📊 Code Coverage
```markdown
[![Coverage](https://codecov.io/gh/n-ae/confytome/branch/main/graph/badge.svg)](https://codecov.io/gh/n-ae/confytome)
```
- **Purpose**: Displays test coverage percentage
- **Service**: Codecov integration
- **Links to**: Detailed coverage report on Codecov

### 🔒 Security Analysis
```markdown
[![Security](https://snyk.io/test/github/n-ae/confytome/badge.svg)](https://snyk.io/test/github/n-ae/confytome)
```
- **Purpose**: Shows security vulnerability scan results
- **Service**: Snyk security monitoring
- **Links to**: Detailed security report on Snyk

### 🐛 GitHub Issues
```markdown
[![GitHub issues](https://img.shields.io/github/issues/n-ae/confytome)](https://github.com/n-ae/confytome/issues)
```
- **Purpose**: Shows count of open issues and bugs
- **Source**: GitHub Issues API
- **Links to**: Repository issues page
- **Updates**: Real-time with issue creation/closure

### 📦 Dependencies Status
```markdown
[![Dependencies](https://img.shields.io/librariesio/github/n-ae/confytome)](https://libraries.io/github/n-ae/confytome)
```
- **Purpose**: Tracks dependency health and updates
- **Service**: Libraries.io dependency monitoring
- **Alternative**: `david-dm.org` (deprecated, replaced with Libraries.io)

### 🟢 Node.js Compatibility
```markdown
[![Node](https://img.shields.io/node/v/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)
```
- **Purpose**: Shows minimum Node.js version requirement
- **Source**: Extracted from package.json engines field
- **Links to**: NPM package page

### 📦 NPM Package Info
```markdown
[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)
```
- **Purpose**: Current published version on NPM
- **Service**: Badge Fury (more reliable than shields.io for NPM)
- **Links to**: NPM package page

### 📈 Download Statistics
```markdown
[![Downloads](https://img.shields.io/npm/dw/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)
```
- **Purpose**: Weekly download count from NPM
- **Frequency**: Updates daily
- **Links to**: NPM package page

### ⚖️ License Information
```markdown
[![License](https://img.shields.io/npm/l/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)
```
- **Purpose**: Shows project license (MIT)
- **Source**: Extracted from package.json
- **Links to**: NPM package page

## 🎯 Badge Placement Strategy

### Main Repository README
- **Full Badge Set**: All 9 badge types for comprehensive overview
- **Order**: Build → Coverage → Security → Issues → Dependencies → Node → Version → Downloads → License

### Package READMEs
- **Core Package**: Build, Coverage, Issues, Version, Downloads, Node, License (7 badges)
- **Other Packages**: Build, Version, Downloads, License (4 core badges)
- **Rationale**: Core package gets full treatment, others focused on essentials

## 🔄 Badge Maintenance

### Automatic Updates
- **Build**: Updates automatically with each CI run
- **Coverage**: Updates when coverage reports are uploaded
- **Downloads**: Updates daily from NPM statistics
- **Version**: Updates when packages are published

### Manual Updates Required
- **Security**: Snyk scans may need manual triggers
- **Dependencies**: Libraries.io checks may need configuration

### Service Dependencies
- **GitHub Actions**: CI workflow must be named "CI"
- **Codecov**: Requires `CODECOV_TOKEN` secret
- **NPM**: Packages must be published publicly
- **Snyk**: May require account linking for private repos

## 🛠️ Customization

### Repository-Specific Changes
Replace `n-ae/confytome` with your repository owner/name:
```markdown
https://github.com/YOUR_OWNER/YOUR_REPO/workflows/CI/badge.svg
```

### Package-Specific Changes
Replace `@confytome/PACKAGE` with your package name:
```markdown
https://img.shields.io/npm/v/@your-scope/package-name.svg
```

### Workflow Name Changes
If CI workflow is named differently, update badge URL:
```markdown
https://github.com/owner/repo/workflows/YOUR_WORKFLOW_NAME/badge.svg
```

## 🎨 Badge Styling

### Shields.io Parameters
Add styling parameters to customize appearance:
```markdown
![Badge](https://img.shields.io/badge/label-message-color?style=flat-square&logo=npm)
```

Common parameters:
- `?style=flat-square` - Flat square style
- `&logo=npm` - Add NPM logo
- `&color=blue` - Custom color
- `&labelColor=gray` - Custom label color

### Badge Fury Styling
Badge Fury badges use automatic styling but support:
- Color changes based on version type (stable/pre-release)
- Automatic logo inclusion

## 🔍 Troubleshooting

### Badge Not Updating
1. **Check service status**: Verify badge service is operational
2. **Clear cache**: Some badges cache for 5-15 minutes
3. **Verify configuration**: Ensure tokens and permissions are correct

### Wrong Information Displayed
1. **Package name**: Verify exact package name including scope
2. **Repository path**: Check owner/repo spelling
3. **Workflow name**: Ensure CI workflow name matches badge URL

### Badge Not Loading
1. **Service outage**: Check if badge service is down
2. **Rate limiting**: Some services have rate limits
3. **Access permissions**: Verify public visibility settings

---

**📝 Note**: This documentation should be updated when badge services change or new badges are added to the project.