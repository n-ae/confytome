# Architecture Documentation

This directory contains Architecture Decision Records (ADRs) and related architectural documentation for the confytome project.

## Architecture Decision Records (ADRs)

ADRs are lightweight documents that capture important architectural decisions along with their context and consequences.

### Current ADRs

1. [ADR-001: Monorepo Structure with Shared Core](./adr-001-monorepo-structure.md)
2. [ADR-002: Base Generator Pattern for Consistency](./adr-002-base-generator-pattern.md)
3. [ADR-003: Plugin Registry vs Static Imports](./adr-003-plugin-registry-approach.md) **(Under Review)**
4. [ADR-004: Service Factory Simplification](./adr-004-service-factory-simplification.md) **(Implemented)**
5. [ADR-005: Configuration Merging Strategy](./adr-005-configuration-merging.md) **(Implemented)**
6. [ADR-006: Integration Testing Strategy](./adr-006-integration-testing-strategy.md) **(Implemented)**
7. [ADR-007: Base Class Hierarchy Evaluation](./adr-007-base-class-hierarchy-evaluation.md) **(Evaluated - Kept Current Design)**
8. [ADR-008: External Dependency Monitoring](./adr-008-external-dependency-monitoring.md) **(Implemented)**

### Template

When creating new ADRs, use the following template:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the situation and problem that needs to be solved]

## Decision
[Describe the decision and rationale]

## Consequences
[Describe the positive and negative outcomes]

## Alternatives Considered
[List other options that were considered]
```

## Architectural Overview

confytome is a plugin-based API documentation generator built around OpenAPI 3.0.3 specifications. The architecture prioritizes:

- **Simplicity**: Clear, maintainable code over complex abstractions
- **Modularity**: Separate packages for different output formats
- **Extensibility**: Plugin system for custom generators
- **Consistency**: Shared base classes and utilities

## Key Architectural Decisions

### 2025 Maintainability Improvements

Based on maintainability assessment (score: 7.5/10), the following improvements were implemented:

1. **✅ Simplified ServiceFactory**: Removed complex caching system in favor of simple static methods (64% code reduction)
2. **✅ Comprehensive Integration Testing**: Added end-to-end tests for the complete generation pipeline (8 new tests)
3. **✅ Simplified ConfigMerger**: Replaced temporary file handling with in-memory object merging
4. **✅ Architectural Documentation**: Complete ADR system with 8 decision records
5. **✅ Base Class Hierarchy Review**: Evaluated and kept current design (provides significant value)
6. **✅ Plugin Registry Analysis**: Detailed evaluation with static registry proof-of-concept (85% complexity reduction possible)
7. **✅ External Dependency Monitoring**: Comprehensive monitoring system with automated checks

**Overall Impact**: Significantly improved maintainability while preserving functionality and performance. All tests pass (22/22), codebase complexity reduced, and long-term sustainability enhanced.

### Core Principles

- **OpenAPI-First**: All generators consume OpenAPI 3.0.3 specifications
- **No Side Effects**: Generators are pure functions that don't modify input
- **Fail-Fast**: Clear error messages and early validation
- **Convention over Configuration**: Sensible defaults with override capability