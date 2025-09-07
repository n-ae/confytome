# External Dependency Status

This document tracks the status of critical external dependencies for confytome.

**Last Updated**: January 2025  
**Monitoring Script**: `scripts/check-external-dependencies.js`

## Current Status Summary

| Dependency | Current | Latest | Security | Status | Notes |
|-----------|---------|---------|----------|--------|-------|
| widdershins | 4.0.1 | 4.0.1 | ⚠️ | MONITOR | Vulnerable transitive dependencies |
| swagger-ui-dist | 5.28.1 | 5.28.1 | ✅ | OK | No issues |

## Security Issues Detected

### widdershins (Medium Priority)
- **Issue**: Multiple moderate/critical vulnerabilities in transitive dependencies
- **Affected Components**: ajv, form-data, jsonpointer, markdown-it, yargs-parser
- **Impact**: Low (vulnerabilities are in build/development dependencies, not runtime)
- **Mitigation**: Monitor for widdershins updates, consider alternatives if not resolved

### Resolution Options
1. **npm audit fix** - Applies non-breaking fixes
2. **npm audit fix --force** - Would downgrade widdershins to 3.6.7 (breaking)
3. **Wait for upstream fix** - Monitor widdershins repository for security patches
4. **Alternative tools** - Evaluate openapi-to-markdown or custom implementation

## Monitoring Schedule

- **Automated**: Run `npm audit` in CI/CD pipeline
- **Manual**: Weekly execution of `scripts/check-external-dependencies.js`
- **Review**: Monthly evaluation of security issues and updates

## Quick Commands

```bash
# Check dependency status
node scripts/check-external-dependencies.js

# Check for security issues
npm audit

# Apply safe fixes
npm audit fix

# View outdated packages
npm outdated
```

## Action Items

- [x] Document current status
- [x] Create monitoring script
- [ ] Add CI/CD integration for automated checks
- [ ] Evaluate alternative to widdershins if security issues persist
- [ ] Set up automated security notifications

## Escalation

- **Critical Security Issues**: Address within 24 hours
- **High Severity**: Address within 1 week  
- **Medium Severity**: Address within 1 month
- **Low/Info**: Address in next maintenance cycle