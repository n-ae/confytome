# Contributing to Confytome

Thank you for your interest in contributing to Confytome!

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Git

### Setup
```bash
git clone https://github.com/n-ae/confytome
cd confytome
npm install
npm test
```

## Development Workflow

1. **Fork** the repository
2. **Create a branch** for your changes
3. **Make your changes** with tests
4. **Run tests** and ensure they pass
5. **Submit a pull request**

### Commands
```bash
npm test              # Run all tests
npm run lint          # Check code style
npm run validate      # Full validation
npm run test:core     # Core tests only
```

## Project Structure

- `packages/core/` - OpenAPI generator and CLI
- `packages/*/` - Format-specific generators (html, markdown, etc.)
- `scripts/` - Build and maintenance scripts
- `docs/adrs/` - Architecture Decision Records

## Making Changes

### Code Style
- Follow existing patterns and conventions
- Add JSDoc comments for public methods
- Ensure ESLint passes (`npm run lint`)

### Testing
- Add tests for new functionality
- Ensure all tests pass
- Maintain test coverage

### Commits
- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

## Pull Request Guidelines

### Before Submitting
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated for significant changes

### PR Description
- Clear description of changes
- Link to related issues
- List any breaking changes
- Include testing instructions

## Adding New Generators

To add a new output format:

1. Create `packages/new-format/` directory
2. Implement the IGenerator interface
3. Add CLI wrapper
4. Include comprehensive tests
5. Update documentation

See existing generators for examples.

## Release Process

Releases are automated via GitHub Actions when version numbers are updated in package.json files.

## Getting Help

- Check existing issues on GitHub
- Review ADRs in `docs/adrs/` for architectural context
- Ask questions in discussions or issues

## Code of Conduct

Be respectful and constructive in all interactions. We're building tools to help developers be more productive.

Thank you for contributing to Confytome! 🚀