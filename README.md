# 🔌 confytome

[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Code Style: ESM](https://img.shields.io/badge/code%20style-ESM-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

**Plugin-based API documentation generator with OpenAPI-first architecture. Generates multiple formats from JSDoc comments through an extensible generator registry system.**

> **2025 Update**: Significantly enhanced maintainability with simplified architecture, comprehensive testing, and complete architectural documentation. All 22 tests passing with improved code quality.

## 🔌 Plugin-First Architecture

🔌 confytome uses a **plugin-based approach** with automatic discovery and dependency injection:

### Core System
- **`@confytome/core`** - Plugin registry, service layer, and OpenAPI generator
{{CORE_FEATURES}}

### Available Plugins
{{PLUGIN_LIST}}

### External Plugin Support
- **Custom Plugins**: Follow `confytome-plugin-*` naming convention
- **Auto-Discovery**: Automatic loading and validation
- **Service Integration**: Access to core services through dependency injection

## ✨ Core Features

{{FEATURES_LIST}}

## 📦 Installation

### Global Installation (Recommended)

```bash
# Install globally for CLI access
npm install -g @confytome/core

# Verify installation
confytome --version
```

### NPX Usage (No Installation Required)

```bash
# Use without installing
npx @confytome/core --help
npx @confytome/core init
```

### Local Development

```bash
# Clone and install
git clone https://github.com/n-ae/confytome.git
cd confytome
npm install

# Use locally (workspace development)
node packages/core/cli.js --help
```

## 🎯 Try the Demo

{{DEMO_SECTION}}

## 🚀 Quick Start

{{QUICK_START_SECTION}}

## 📚 Command Reference

{{COMMAND_REFERENCE}}

## 📄 Configuration

{{CONFIGURATION_SECTION}}

## 💡 Examples

{{EXAMPLES_SECTION}}

## 📁 Generated Output

{{OUTPUT_SECTION}}

## 🛠️ Troubleshooting

{{TROUBLESHOOTING_SECTION}}

## 🏗️ Architecture

### Design Principles

{{DESIGN_PRINCIPLES}}

### Project Structure

{{PROJECT_STRUCTURE}}

## 🤝 Contributing

{{CONTRIBUTING_SECTION}}

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

{{ACKNOWLEDGMENTS}}

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/n-ae/confytome/issues)
- 📖 **Documentation**: This README and inline help (`confytome --help`)

---

**Made with ❤️ for developers who value great API documentation**

*Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.*
