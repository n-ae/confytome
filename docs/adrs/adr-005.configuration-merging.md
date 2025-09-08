# ADR-005: Configuration Merging Strategy

## Status
Accepted (Implemented January 2025)

## Context
The original ConfigMerger implemented complex temporary file creation, override detection, and file system operations for merging CLI options with configuration files. Analysis revealed:

- **Over-complexity**: Temporary file creation for simple object merging
- **File System Overhead**: Unnecessary disk I/O for in-memory operations
- **Complex Logic**: Override detection and comparison logic
- **Cleanup Burden**: Temporary file cleanup and error handling
- **Race Conditions**: Potential issues with concurrent temporary files

This was identified as a medium-risk architectural issue during maintainability assessment.

## Decision
Simplify configuration merging by:

1. **Eliminate Temporary Files**: Merge configurations in memory only
2. **Remove Override Detection**: Unnecessary complexity for simple merging
3. **Simplify API**: Return config objects directly instead of file metadata
4. **Backward Compatibility**: Maintain existing API surface for gradual migration

## Consequences

### Positive
- **Simplicity**: Clear in-memory object merging logic
- **Performance**: No file system I/O overhead
- **Reliability**: No temporary file cleanup or race conditions
- **Maintainability**: Much easier to understand and modify
- **Testing**: Simpler test scenarios without file system mocking

### Negative
- **Memory Usage**: Configuration objects kept in memory (negligible impact)
- **No File Persistence**: Configuration merges not saved to disk (not needed)

## Before/After Comparison

### Before (Complex)
```javascript
static async mergeWithConfig(configPath, cliOptions, tempDir) {
  // Complex override detection
  const hasOverrides = this.hasOverrides(baseConfig, cliOptions);
  
  if (hasOverrides) {
    // Create temporary file with unique name
    const randomId = randomBytes(8).toString('hex');
    const tempConfigPath = path.join(tempDir, `.confytome-temp-${randomId}.json`);
    fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
    
    return { configPath: tempConfigPath, isTemporary: true };
  }
  
  return { configPath, isTemporary: false };
}

static cleanup(configPath, isTemporary) {
  // Complex cleanup logic
}
```

### After (Simple)
```javascript
static mergeWithConfig(configPath, cliOptions) {
  let baseConfig = {};
  if (fs.existsSync(configPath)) {
    baseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  return this.mergeConfigurations(baseConfig, cliOptions);
}

static cleanup() {
  // No-op - no temporary files to clean up
}
```

## Implementation Strategy

### Phase 1: Simplify Core Logic (Completed)
- Remove temporary file creation
- Simplify merging logic to essential mappings only
- Return config objects directly

### Phase 2: Update Consumers (Completed)
- Update CLI commands to handle config objects
- Update helper functions for backward compatibility
- Maintain API surface for gradual migration

### Phase 3: Remove Legacy Methods (Future)
- Remove backward compatibility shims when all consumers updated
- Clean up unused temporary file methods

## Migration Impact

- **Existing Tests**: All tests pass with simplified implementation
- **CLI Commands**: Updated to use config objects directly
- **Breaking Changes**: None - maintained backward compatibility
- **File System**: Reduced temporary file creation and cleanup