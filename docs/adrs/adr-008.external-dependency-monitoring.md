# ADR-008: External Tool Dependency Monitoring

## Status
Accepted (Implemented January 2025)

## Context
confytome relies on two critical external tools that directly impact functionality:

1. **widdershins** (v4.0.1) - Used by `@confytome/markdown` for Markdown generation
2. **swagger-ui-dist** (v5.28.1) - Used by `@confytome/swagger` for interactive UI

These dependencies require monitoring because:
- They are actively maintained third-party tools
- Breaking changes could affect confytome functionality
- Security vulnerabilities need prompt updates
- New features may benefit confytome users

## Decision
Implement a comprehensive external dependency monitoring strategy including:

1. **Version Tracking**: Document current versions and compatibility
2. **Update Monitoring**: Regular checks for new releases
3. **Security Monitoring**: Track security advisories
4. **Compatibility Testing**: Test major updates before adoption
5. **Fallback Strategies**: Document alternatives if tools become unavailable

## Current Dependency Status (January 2025)

### widdershins
- **Current Version**: 4.0.1
- **Used By**: @confytome/markdown
- **Purpose**: OpenAPI to Markdown conversion with custom templates
- **Integration**: Dynamic import with custom template processing
- **Compatibility**: Stable, well-maintained
- **Repository**: https://github.com/Mermade/widdershins
- **Alternatives**: openapi-to-markdown, redoc-cli

### swagger-ui-dist
- **Current Version**: 5.28.1 (latest available: checking regularly)
- **Used By**: @confytome/swagger
- **Purpose**: Static assets for Swagger UI interface
- **Integration**: File system copying from node_modules
- **Compatibility**: Stable, actively maintained by Swagger team
- **Repository**: https://github.com/swagger-api/swagger-ui
- **Alternatives**: redoc, openapi-ui

## Monitoring Implementation

### 1. Version Compatibility Matrix

| Tool | Current | Tested Versions | Known Issues | Next Target |
|------|---------|----------------|--------------|-------------|
| widdershins | 4.0.1 | 4.0.0, 4.0.1 | None known | 4.1.x when available |
| swagger-ui-dist | 5.28.1 | 5.0.0+ | None known | Latest stable |

### 2. Update Strategy

#### Minor Updates (Automatic)
- Patch versions (x.x.X) - Applied automatically via dependabot
- Security patches - High priority, test and deploy quickly

#### Major Updates (Manual Review)
- Minor versions (x.X.x) - Review changelog, test thoroughly
- Major versions (X.x.x) - Full compatibility review required

#### Testing Protocol for Updates
1. Update dependency in isolated branch
2. Run full test suite (`npm test`)
3. Manual testing of affected generators
4. Visual verification of output quality
5. Performance regression testing

### 3. Security Monitoring
- **GitHub Security Advisories**: Enabled for all repositories
- **npm audit**: Regular execution in CI/CD
- **Dependabot**: Configured for security updates
- **Manual Review**: Monthly check of tool security status

### 4. Alternative Tool Evaluation

#### For widdershins Replacement
```javascript
// Current usage
const widdershins = await import('widdershins');
const markdown = await widdershins.convert(spec, options);

// Potential alternatives
const openApiToMarkdown = require('openapi-to-markdown');
const redocCli = require('redoc-cli');
```

#### For swagger-ui-dist Replacement
```javascript
// Current usage
const swaggerUiPath = require.resolve('swagger-ui-dist/package.json');
const assetsPath = path.dirname(swaggerUiPath);

// Potential alternatives
const redocAssets = require.resolve('redoc/bundles');
const openApiUi = require('openapi-ui-dist');
```

## Risk Assessment

### Low Risk Dependencies
- **swagger-ui-dist**: Stable, backed by SmartBear, widely used
- **Mitigation**: Multiple alternatives available

### Medium Risk Dependencies
- **widdershins**: Smaller maintenance team, specific use case
- **Mitigation**: Template system abstraction allows swapping

### Contingency Plans

#### widdershins Unavailable
1. **Short-term**: Use our custom template system with alternative converter
2. **Medium-term**: Implement native OpenAPI to Markdown conversion
3. **Long-term**: Consider building confytome-native markdown generator

#### swagger-ui-dist Unavailable
1. **Short-term**: Switch to Redoc distribution
2. **Medium-term**: Bundle Swagger UI assets directly
3. **Long-term**: Implement custom OpenAPI documentation interface

## Implementation Tasks

### Immediate (High Priority)
- [x] Document current versions and compatibility
- [x] Establish monitoring procedures
- [x] Create ADR for dependency strategy

### Short Term (Medium Priority)  
- [ ] Implement automated dependency checking in CI
- [ ] Create update testing checklist
- [ ] Document fallback procedures

### Long Term (Low Priority)
- [ ] Evaluate alternatives quarterly
- [ ] Consider bundling critical assets
- [ ] Plan for major version migrations

## Success Metrics

- **Zero breaking changes** from dependency updates
- **< 30 days** from security advisory to patched release
- **< 7 days** for critical security updates
- **100% test coverage** for dependency integration points

## Maintenance Schedule

- **Weekly**: Automated security monitoring
- **Monthly**: Version update checks
- **Quarterly**: Alternative tool evaluation
- **Annually**: Full dependency strategy review