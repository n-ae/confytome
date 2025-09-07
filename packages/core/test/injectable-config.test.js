/**
 * Injectable Configuration Tests
 *
 * Tests the injectable configuration system with single source of truth default
 */

import { getOutputDir } from '../constants.js';

describe('injectable configuration', () => {
  test('should return default when no output directory provided', () => {
    const result = getOutputDir();
    expect(result).toBe('./confytome');
  });

  test('should return default when null provided', () => {
    const result = getOutputDir(null);
    expect(result).toBe('./confytome');
  });

  test('should return default when undefined provided', () => {
    const result = getOutputDir(undefined);
    expect(result).toBe('./confytome');
  });

  test('should return default when empty string provided', () => {
    const result = getOutputDir('');
    expect(result).toBe('./confytome');
  });

  test('should return custom directory when provided', () => {
    const result = getOutputDir('./custom-output');
    expect(result).toBe('./custom-output');
  });

  test('should return absolute path when provided', () => {
    const result = getOutputDir('/absolute/path');
    expect(result).toBe('/absolute/path');
  });
});
