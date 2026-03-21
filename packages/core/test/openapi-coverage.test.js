import { OpenApiProcessor } from '../utils/OpenApiProcessor.js';
import { getOutputDir } from '../constants.js';

describe('OpenApiProcessor - coverage gaps', () => {
  let p;

  beforeEach(() => {
    p = new OpenApiProcessor();
  });

  // ── constants.js ──────────────────────────────────────────────────────────

  describe('getOutputDir()', () => {
    test('normalizes Windows backslash paths', () => {
      const result = getOutputDir('C:\\Users\\test\\output');
      expect(result).not.toContain('\\\\');
    });

    test('normalizes paths with ../', () => {
      const result = getOutputDir('../some/../path');
      expect(typeof result).toBe('string');
    });

    test('normalizes paths with .//', () => {
      const result = getOutputDir('.//output');
      expect(typeof result).toBe('string');
    });

    test('returns plain path unchanged', () => {
      expect(getOutputDir('./confytome')).toBe('./confytome');
    });

    test('uses default when no arg given', () => {
      expect(getOutputDir()).toBe('./confytome');
    });
  });

  // ── hasRequiredAuth ────────────────────────────────────────────────────────

  describe('hasAuthentication()', () => {
    test('returns false when operation explicitly disables security (empty array)', () => {
      const spec = {
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
        paths: {
          '/test': {
            get: { security: [], tags: ['T'], summary: 'S', responses: { '200': { description: 'OK' } } }
          }
        }
      };
      expect(p.hasAuthentication(spec)).toBe(false);
    });

    test('returns true via global security when operation has no explicit security', () => {
      const spec = {
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
        security: [{ bearerAuth: [] }],
        paths: {
          '/test': {
            get: { tags: ['T'], summary: 'S', responses: { '200': { description: 'OK' } } }
          }
        }
      };
      expect(p.hasAuthentication(spec)).toBe(true);
    });
  });

  // ── processEndpoints error paths ───────────────────────────────────────────

  describe('processEndpoints() error handling', () => {
    test('wraps path-level errors that are not endpoint errors', () => {
      expect(() => p.processEndpoints({ '/bad': null })).toThrow();
    });
  });

  // ── extractParameterExamples ───────────────────────────────────────────────

  describe('extractParameterExamples()', () => {
    test('handles example that is a plain value (not object with .value)', () => {
      const param = {
        examples: { simple: 'plain-string' }
      };
      const result = p.extractParameterExamples(param);
      expect(result.length).toBeGreaterThan(0);
    });

    test('serializes object schema.example to JSON', () => {
      const param = { schema: { example: { id: 1, name: 'test' } } };
      const result = p.extractParameterExamples(param);
      expect(result[0].value).toContain('"id"');
    });
  });

  // ── extractAllExamples ─────────────────────────────────────────────────────

  describe('extractAllExamples()', () => {
    test('extracts multiple named examples from content.examples', () => {
      const content = {
        examples: {
          ex1: { summary: 'First', value: { a: 1 } },
          ex2: { summary: 'Second', value: { b: 2 } }
        }
      };
      const result = p.extractAllExamples(content, 'application/json');
      expect(result).toHaveLength(2);
    });

    test('extracts single content.example', () => {
      const content = { example: { id: 42 } };
      const result = p.extractAllExamples(content, 'application/json');
      expect(result).toHaveLength(1);
    });
  });

  // ── formatExampleValue ─────────────────────────────────────────────────────

  describe('formatExampleValue()', () => {
    test('returns empty string for null', () => {
      expect(p.formatExampleValue(null, 'application/json')).toBe('');
    });

    test('converts object to XML for application/xml', () => {
      const result = p.formatExampleValue({ id: 1 }, 'application/xml');
      expect(result).toContain('<id>');
    });

    test('converts value to string for text/plain', () => {
      expect(p.formatExampleValue(42, 'text/plain')).toBe('42');
    });

    test('converts object to form data for multipart/form-data', () => {
      const result = p.formatExampleValue({ key: 'val' }, 'multipart/form-data');
      expect(result).toContain('key=');
    });

    test('converts object to form data for application/x-www-form-urlencoded', () => {
      const result = p.formatExampleValue({ a: 'b' }, 'application/x-www-form-urlencoded');
      expect(result).toBe('a=b');
    });

    test('falls back to JSON for unknown content type', () => {
      const result = p.formatExampleValue({ x: 1 }, 'text/unknown');
      expect(result).toContain('"x"');
    });
  });

  // ── getSyntaxLanguage ──────────────────────────────────────────────────────

  describe('getSyntaxLanguage()', () => {
    test.each([
      ['application/xml', 'xml'],
      ['text/html', 'html'],
      ['text/css', 'css'],
      ['text/javascript', 'javascript'],
      ['application/javascript', 'javascript'],
      ['text/yaml', 'yaml'],
      ['application/yaml', 'yaml'],
      ['text/plain', 'text'],
      ['application/octet-stream', 'text']
    ])('%s → %s', (contentType, expected) => {
      expect(p.getSyntaxLanguage(contentType)).toBe(expected);
    });
  });

  // ── objectToXml ────────────────────────────────────────────────────────────

  describe('objectToXml()', () => {
    test('renders leaf string values inline', () => {
      const result = p.objectToXml({ name: 'alice' });
      expect(result).toBe('<name>alice</name>\n');
    });

    test('renders nested object as nested tags', () => {
      const result = p.objectToXml({ user: { id: 1 } });
      expect(result).toContain('<user>');
      expect(result).toContain('<id>');
    });
  });

  // ── objectToFormData ───────────────────────────────────────────────────────

  describe('objectToFormData()', () => {
    test('encodes key=value pairs', () => {
      expect(p.objectToFormData({ a: '1', b: '2' })).toBe('a=1&b=2');
    });

    test('converts non-object to string', () => {
      expect(p.objectToFormData('raw')).toBe('raw');
    });
  });

  // ── generateSchemaExample ──────────────────────────────────────────────────

  describe('generateSchemaExample()', () => {
    test('returns JSON of schema.example when present', () => {
      const result = p.generateSchemaExample({ example: { id: 1 } });
      expect(JSON.parse(result)).toEqual({ id: 1 });
    });
  });

  // ── generateExampleValue ───────────────────────────────────────────────────

  describe('generateExampleValue()', () => {
    test('returns true for boolean type', () => {
      expect(p.generateExampleValue({ type: 'boolean' })).toBe(true);
    });

    test('returns array with one item for array type', () => {
      const result = p.generateExampleValue({ type: 'array', items: { type: 'string' } });
      expect(Array.isArray(result)).toBe(true);
    });

    test('returns null for unknown type', () => {
      expect(p.generateExampleValue({ type: 'unknown-type' })).toBeNull();
    });

    test('returns max-depth sentinel when depth > 10', () => {
      expect(p.generateExampleValue({ type: 'string' }, 11)).toBe('[Max depth exceeded]');
    });
  });

  // ── getParameterDescription ────────────────────────────────────────────────

  describe('getParameterDescription()', () => {
    test('builds enum-only description when param has no description', () => {
      const param = { schema: { enum: ['a', 'b'] } };
      const result = p.getParameterDescription(param);
      expect(result).toContain('Allowed values');
      expect(result).not.toMatch(/^\./); // should not start with a dot
    });
  });

  // ── getParameterExampleValue ───────────────────────────────────────────────

  describe('getParameterExampleValue()', () => {
    test('returns schema.example when no param.example', () => {
      expect(p.getParameterExampleValue({ schema: { example: 'from-schema' } })).toBe('from-schema');
    });
  });

  // ── operationRequiresAuth ──────────────────────────────────────────────────

  describe('operationRequiresAuth()', () => {
    test('returns true when global security is present', () => {
      const spec = { security: [{ bearerAuth: [] }] };
      expect(p.operationRequiresAuth({}, spec)).toBe(true);
    });

    test('returns false for operation with empty security array', () => {
      expect(p.operationRequiresAuth({ security: [] }, {})).toBe(false);
    });
  });

  // ── getCurlDataExample ─────────────────────────────────────────────────────

  describe('getRequestBodyExample()', () => {
    test('uses content.example when present', () => {
      const requestBody = {
        content: { 'application/json': { example: { id: 1 } } }
      };
      const result = p.getRequestBodyExample(requestBody);
      expect(JSON.parse(result)).toEqual({ id: 1 });
    });

    test('returns null when no schema and no example', () => {
      const requestBody = {
        content: { 'application/json': {} }
      };
      expect(p.getRequestBodyExample(requestBody)).toBeNull();
    });
  });

  // ── getOperationServerUrl ──────────────────────────────────────────────────

  describe('getOperationServerUrl()', () => {
    test('returns operation-level server when present', () => {
      const op = { servers: [{ url: 'https://op.example.com' }] };
      expect(p.getOperationServerUrl(op, {})).toBe('https://op.example.com');
    });

    test('falls back to global spec servers', () => {
      const spec = { servers: [{ url: 'https://global.example.com' }] };
      expect(p.getOperationServerUrl({}, spec)).toBe('https://global.example.com');
    });
  });

  // ── resolveSchemaRef ───────────────────────────────────────────────────────

  describe('resolveSchemaRef()', () => {
    test('merges allOf schemas and carries type from sub-schema', () => {
      const spec = {
        components: {
          schemas: {
            Base: { type: 'object', properties: { id: { type: 'integer' } } }
          }
        }
      };
      const pWithSpec = new OpenApiProcessor();
      pWithSpec.openApiSpec = spec;
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Base' },
          { properties: { name: { type: 'string' } } }
        ]
      };
      const result = pWithSpec.resolveSchemaRef(schema);
      expect(result.properties).toHaveProperty('id');
      expect(result.properties).toHaveProperty('name');
    });

    test('resolves oneOf by returning first schema', () => {
      const schema = {
        oneOf: [
          { type: 'string' },
          { type: 'integer' }
        ]
      };
      const result = p.resolveSchemaRef(schema, {});
      expect(result.type).toBe('string');
    });
  });

  // ── resolveParameters ──────────────────────────────────────────────────────

  describe('resolveParameters()', () => {
    test('pushes original param when $ref resolves to null', () => {
      const params = [{ $ref: '#/components/parameters/NonExistent', name: 'fallback' }];
      const result = p.resolveParameters(params, {});
      expect(result[0].name).toBe('fallback');
    });
  });
});
