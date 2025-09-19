# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in confytome, please email us directly at **security@confytome.dev** rather than opening a public issue.

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)

We aim to respond to security reports within 48 hours.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.7.x   | ✅ Active support  |
| 1.6.x   | ⚠️ Security fixes only |
| < 1.6   | ❌ No longer supported |

## Security Considerations

### File System Access
- Confytome reads OpenAPI specs and writes documentation files
- All output is written to user-specified directories only
- No modification of source files or system directories

### External Dependencies
- Minimal dependency footprint reduces attack surface
- Regular dependency auditing with `npm audit`
- Dependencies are pinned to specific versions

### Plugin Security
- Core generators are maintained by the confytome team
- External plugins (if any) should be reviewed before use
- Generators run with the same permissions as the calling user

## Best Practices

### For Users
- Keep confytome updated to the latest version
- Review generated output before publishing
- Use specific version ranges in production

### For Plugin Developers
- Follow the IGenerator interface contract
- Validate all input parameters
- Handle errors gracefully
- Document security considerations

## Security Updates

Security updates are distributed through:
- GitHub Security Advisories
- npm package updates
- Release notes in CHANGELOG.md

Subscribe to repository notifications to stay informed about security updates.