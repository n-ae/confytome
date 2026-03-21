import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneConfluenceGenerator } from '../standalone-generator.js';

describe('StandaloneConfluenceGenerator', () => {
  let testDir;
  let generator;

  const minimalSpec = {
    openapi: '3.0.3',
    info: { title: 'Test API', version: '1.0.0' },
    tags: [{ name: 'Users' }],
    paths: {
      '/users': {
        get: {
          summary: 'List users',
          tags: ['Users'],
          responses: { '200': { description: 'OK' } }
        }
      }
    }
  };

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `confluence-gen-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(testDir, { recursive: true });
    generator = new StandaloneConfluenceGenerator(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getMetadata()', () => {
    test('returns expected metadata', () => {
      const meta = StandaloneConfluenceGenerator.getMetadata();
      expect(meta.name).toBe('confluence');
      expect(typeof meta.description).toBe('string');
    });
  });

  describe('log()', () => {
    test('logs a message', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      generator.log('hello confluence');
      expect(spy).toHaveBeenCalledWith('hello confluence');
      spy.mockRestore();
    });
  });

  describe('generate()', () => {
    test('succeeds from specPath with copyToClipboard disabled', async () => {
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify(minimalSpec));
      generator.options.specPath = specPath;
      const result = await generator.generate({ copyToClipboard: false });
      expect(result.success).toBe(true);
      expect(result.clipboardSuccess).toBe(false);
    });

    test('succeeds from markdownPath with copyToClipboard disabled', async () => {
      const mdPath = path.join(testDir, 'api-docs.md');
      fs.writeFileSync(mdPath, '# Test Docs\n\nSome content.');
      generator.options.markdownPath = mdPath;
      const result = await generator.generate({ copyToClipboard: false });
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(mdPath);
    });

    test('returns failure when markdownPath file does not exist', async () => {
      generator.options.markdownPath = '/no/such/file.md';
      const result = await generator.generate({ copyToClipboard: false });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Markdown file not found');
    });

    test('returns failure when no input source is given', async () => {
      const result = await generator.generate({ copyToClipboard: false });
      expect(result.success).toBe(false);
      expect(result.error).toContain('No input source specified');
    });

    test('attempts clipboard copy by default', async () => {
      const mdPath = path.join(testDir, 'api-docs.md');
      fs.writeFileSync(mdPath, '# Docs');
      generator.options.markdownPath = mdPath;
      // clipboard may succeed or fail in the test environment — both are valid outcomes
      const result = await generator.generate();
      expect(result.success).toBe(true);
      expect(typeof result.clipboardSuccess).toBe('boolean');
    });

    test('returns failure when specPath causes markdown generation to fail', async () => {
      const specPath = path.join(testDir, 'bad.json');
      const badSpec = {
        openapi: '3.0.3',
        info: { title: 'Bad', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'No tags', responses: { '200': { description: 'OK' } } }
          }
        }
      };
      fs.writeFileSync(specPath, JSON.stringify(badSpec));
      generator.options.specPath = specPath;
      const result = await generator.generate({ copyToClipboard: false });
      expect(result.success).toBe(false);
    });
  });
});
