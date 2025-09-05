# Security Policy

## Plugin System Security

### Core Security Principles

Confytome's plugin-first architecture implements several security layers:

1. **Generator Registry Validation**: All generators undergo validation during discovery
2. **Service Layer Isolation**: Dependency injection prevents direct system access
3. **File System Boundaries**: Generators operate within defined output directories
4. **Input Sanitization**: OpenAPI spec validation before processing

### Plugin Security Model

#### Workspace Generators (Internal)
- **Trusted Environment**: Located in `packages/` workspace
- **Peer Dependencies**: Validated against core version compatibility
- **Service Injection**: Controlled access to system services
- **Template Method Pattern**: Prevents arbitrary code execution

#### External Plugins (npm packages)
- **Discovery Pattern**: Must follow `confytome-plugin-*` naming convention
- **Dependency Validation**: Automatic compatibility checking
- **Isolation**: Run through GeneratorFactory with controlled context
- **Service Boundaries**: Limited access to core services

### Security Best Practices

#### For Plugin Developers

**Internal Workspace Generators:**
```javascript
// Good: Use service injection
constructor(outputDir = './docs', services = null) {
  super('generator-name', 'Description', outputDir, services);
}

// Good: Use template methods
async generate() {
  return this.generateDocument('format', 'output.ext', (spec, services) => {
    // Contained generation logic
    return this.processSpec(spec, services);
  });
}
```

**External Plugin Development:**
```javascript
// Good: Extend base classes
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

// Good: Validate inputs
async generate() {
  if (!this.validateInputs()) {
    throw new Error('Invalid inputs provided');
  }
  return super.generate();
}
```

#### For Plugin Users

1. **Verify Plugin Sources**: Only install plugins from trusted sources
2. **Review Plugin Code**: Examine plugin implementation before use
3. **Use Latest Versions**: Keep core and plugins updated
4. **Monitor Dependencies**: Regular `npm audit` checks

### Dependency Security

#### Current Security Status
- **Core Dependencies**: All maintained and up-to-date
- **Development Dependencies**: Some vulnerabilities in build-time tools
- **Risk Assessment**: Low impact (CLI tool, not web service)

#### Specific Considerations

**widdershins (markdown generator):**
- Version 4.0.1 required for Turkish Unicode support
- Contains transitive dependency vulnerabilities
- Risk mitigated: Build-time only, not runtime exposure

**Updated Dependencies:**
- `commander`: 12.0.0 → 14.0.0 (security patches included)
- `swagger-ui-dist`: Latest stable versions
- `swagger-jsdoc`: Maintained and current

### Runtime Security

#### File System Access
- **Controlled Writes**: Generators write only to specified output directories
- **Path Validation**: Input/output paths validated against directory traversal
- **Permission Checks**: File system permissions verified before operations

#### Input Validation
- **JSDoc Parsing**: Validated through swagger-jsdoc with error handling
- **OpenAPI Spec**: Schema validation before generator consumption
- **Configuration Files**: JSON validation with syntax checking

#### Output Security
- **Content Sanitization**: Generated content follows format specifications
- **Template Security**: Custom templates sandboxed within generator context
- **Unicode Safety**: Proper encoding handling for international content

### Plugin Distribution Security

#### Publishing Security
```bash
# Verify package integrity
npm pack --dry-run

# Check for sensitive files
npm publish --dry-run

# Validate peer dependencies
confytome validate generator-name
```

#### Installation Security
```bash
# Verify plugin before installation
npm info confytome-plugin-example

# Install with audit
npm install confytome-plugin-example && npm audit

# Validate after installation
confytome generators
confytome validate
```

### High-Security Environments

#### Additional Measures
1. **Container Isolation**: Run generators in Docker containers
2. **Network Restrictions**: Disable network access during generation
3. **File System Monitoring**: Monitor file system changes during execution
4. **Input Scanning**: Scan JSDoc files for malicious content

#### Alternative Approaches
- **Air-Gapped Environments**: Use workspace generators only
- **Source Code Review**: Manual review of all generator code
- **Custom Base Classes**: Implement additional security layers

### Security Monitoring

#### Regular Checks
```bash
# Check for vulnerabilities
npm audit

# Validate all generators
confytome validate

# Check generator information
confytome generators
confytome info generator-name
```

#### Update Procedures
1. **Core Updates**: Monitor @confytome/core releases
2. **Plugin Updates**: Check plugin compatibility after core updates
3. **Dependency Updates**: Regular dependency maintenance
4. **Security Patches**: Priority updates for security fixes

### Incident Response

#### Vulnerability Discovery
1. **Assessment**: Evaluate impact on generation process
2. **Isolation**: Disable affected generators if necessary
3. **Communication**: Update users through GitHub security advisories
4. **Remediation**: Apply fixes and update documentation

#### Reporting Security Issues

**Contact Methods:**
- GitHub Security Advisories (preferred)
- GitHub Issues (for non-sensitive issues)
- Email: Security concerns in plugin ecosystem

**Information to Include:**
- Plugin name and version
- Steps to reproduce
- Impact assessment
- Suggested remediation

### Security Audit Trail

#### Generator Execution
- **Service Injection**: All generator instantiations logged
- **File Operations**: Output file creation tracked
- **Error Handling**: Security-relevant errors captured

#### Plugin Management
- **Discovery**: Generator registration events
- **Validation**: Plugin compatibility checks
- **Updates**: Version changes and compatibility updates

---

**Security is a shared responsibility between the core system, plugin developers, and users. Follow these guidelines to maintain a secure documentation generation environment.**