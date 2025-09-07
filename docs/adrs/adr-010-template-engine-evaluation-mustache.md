# ADR-010: Template Engine Evaluation - Mustache for Markdown Generation

**Date**: January 2025  
**Status**: Accepted  
**Deciders**: Development Team  

## Context

The confytome project currently uses widdershins for markdown generation in the `@confytome/markdown` package. This decision needs reevaluation due to:

1. **Security Concerns**: widdershins has vulnerable transitive dependencies (moderate/critical vulnerabilities in ajv, form-data, jsonpointer, markdown-it, yargs-parser)
2. **Maintenance Burden**: Custom template management in `widdershins-templates/` directory
3. **Complexity**: Heavy dependency for what is essentially string templating
4. **Limited Control**: Difficulty customizing output beyond template modifications

### Current Widdershins Usage Analysis

**Location**: `packages/markdown/generate-markdown.js`  
**Purpose**: Convert OpenAPI 3.0.3 specs to Confluence-friendly markdown  
**Key Features Used**:
- Custom template directory support
- cURL code sample generation  
- Unicode support (Turkish characters)
- HTML-free output
- Options: `omitHeader: true, summary: true, code: true`

**Dependencies**: widdershins@4.0.1 with 20+ transitive dependencies

## Decision Drivers

1. **Cross-Language Support** - Future-proof for multi-language environments
2. **Simplicity × Well-Establishedness** - Primary scoring matrix
3. **Logic Separation** - Handle complex logic in JavaScript, keep templates simple
4. **Security** - Minimize vulnerable dependencies
5. **Maintainability** - Reduce external dependency complexity

## Options Considered

### 1. Mustache ⭐ (SELECTED)
**Simplicity: 9/10 | Well-Established: 10/10 | Score: 90**

**Pros**:
- **Cross-language compatibility** - Works across multiple programming languages
- Logic-less templates - Clear separation of concerns
- Minimal learning curve and stable API
- Wide ecosystem support and community
- Significantly fewer dependencies than widdershins
- Template portability between different environments

**Cons**:
- Requires custom OpenAPI parsing logic in JavaScript
- No built-in OpenAPI awareness

**Key Advantage**: The logic-less nature means all complex processing happens in JavaScript (where we have full control), while templates remain simple and portable.

### 2. Native Template Literals
**Simplicity: 10/10 | Well-Established: 10/10 | Score: 100**

**Rejected Reason**: While scoring highest, lacks cross-language compatibility which is valuable for future extensibility.

### 3. Handlebars  
**Simplicity: 7/10 | Well-Established: 10/10 | Score: 70**

**Rejected Reason**: More complex than needed, overkill for markdown generation.

### 4. EJS
**Simplicity: 8/10 | Well-Established: 9/10 | Score: 72**

**Rejected Reason**: Security concerns with embedded JavaScript, not cross-language.

### 5. Custom Template Functions
**Simplicity: 9/10 | Well-Established: 6/10 | Score: 54**

**Rejected Reason**: Lower well-establishedness, reinventing the wheel.

## Decision

**Selected: Mustache**

### Rationale

1. **Cross-Language Future**: Templates can be reused if confytome expands to other languages (Python, Go, etc.)
2. **Clear Architecture**: Logic in JavaScript, presentation in templates - clean separation
3. **Proven Stability**: Logic-less approach prevents template complexity creep
4. **Security Improvement**: Mustache has minimal dependencies compared to widdershins
5. **Community Support**: Well-established with broad ecosystem support
6. **Template Portability**: Templates can be shared across different implementations

### Architecture Pattern

```javascript
// All logic in JavaScript
class OpenApiProcessor {
  processSpec(spec) {
    return {
      title: spec.info.title,
      version: spec.info.version,
      endpoints: this.processEndpoints(spec.paths),
      schemas: this.processSchemas(spec.components?.schemas)
    };
  }

  processEndpoints(paths) {
    return Object.entries(paths).flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, operation]) => ({
        method: method.toUpperCase(),
        path: path,
        summary: operation.summary,
        curlExample: this.generateCurlExample(method, path),
        responses: this.processResponses(operation.responses)
      }))
    );
  }
}

// Simple, cross-language template
const template = `# {{title}}

**Version**: {{version}}

{{#endpoints}}
## {{method}} {{path}}

{{summary}}

\`\`\`bash
{{curlExample}}
\`\`\`

{{#responses}}
- **{{code}}**: {{description}}
{{/responses}}

{{/endpoints}}`;
```

### Implementation Strategy

#### Phase 1: Replace widdershins with Mustache
- Install `mustache` package (lightweight, ~50KB vs widdershins ~2MB+)
- Create `OpenApiProcessor` class for all logic
- Create Mustache templates for different output formats
- Maintain existing CLI interface
- Add comprehensive tests

#### Phase 2: Template Organization
- Store templates in `templates/` directory
- Support custom user templates
- Create template validation system
- Document template variables

#### Phase 3: Cross-Language Preparation
- Extract template schema documentation
- Create template test suite that can run in multiple languages
- Document the data structure contract between processor and templates

### Template Structure Example

**Main Template** (`templates/api-docs.mustache`):
```mustache
# {{info.title}}

{{info.description}}

**Version**: {{info.version}}
{{#servers}}
**Base URL**: {{url}}
{{/servers}}

## Endpoints

{{#endpoints}}
### {{method}} {{path}}

{{#summary}}{{summary}}{{/summary}}

{{#description}}
{{description}}
{{/description}}

**cURL Example:**
```bash
{{curlExample}}
```

{{#responses}}
#### Response {{code}}
{{description}}

{{#examples}}
```json
{{content}}
```
{{/examples}}

{{/responses}}

---

{{/endpoints}}

{{#schemas}}
## Data Models

{{#models}}
### {{name}}

{{#description}}{{description}}{{/description}}

{{#properties}}
- **{{name}}** ({{type}}): {{description}}
{{/properties}}

{{/models}}
{{/schemas}}
```

## Consequences

### Positive
- **Security**: Eliminates widdershins' vulnerable transitive dependencies
- **Cross-Language**: Templates work across multiple programming languages
- **Simplicity**: Logic-less templates are easy to understand and maintain
- **Performance**: Smaller dependency footprint, faster execution
- **Separation of Concerns**: Clear boundary between logic (JS) and presentation (templates)
- **Extensibility**: Easy to add new output formats with new templates

### Negative  
- **Development Effort**: Initial implementation work to replace widdershins
- **Custom Logic**: Need to implement OpenAPI processing logic ourselves
- **Learning**: Team needs to understand Mustache syntax (though minimal)

### Neutral
- **Feature Parity**: All current widdershins features can be replicated
- **Template Maintenance**: Similar template management, but simpler syntax

## Implementation Plan

### Step 1: Proof of Concept (1-2 days)
- Install mustache package
- Create basic OpenApiProcessor
- Create minimal template for one endpoint
- Verify output matches current format

### Step 2: Feature Completion (3-5 days)
- Implement all OpenAPI spec processing
- Create comprehensive templates
- Add cURL generation
- Ensure Unicode support

### Step 3: Integration & Testing (2-3 days)
- Replace widdershins in generate-markdown.js
- Update tests
- Verify CLI compatibility
- Performance benchmarks

### Step 4: Documentation (1 day)
- Update package README
- Document template customization
- Create migration guide

## Follow-up Actions

1. Install and evaluate mustache package
2. Create prototype implementation
3. Run security audit after widdershins removal
4. Performance benchmarks comparing approaches
5. Consider template standardization across other generators

## References

- [Mustache.js](https://github.com/janl/mustache.js/)
- [Mustache Manual](https://mustache.github.io/mustache.5.html)
- [Current widdershins usage](packages/markdown/generate-markdown.js:34)
- [widdershins security issues](docs/DEPENDENCY-STATUS.md#widdershins-medium-priority)
- [Cross-language Mustache implementations](https://mustache.github.io/)