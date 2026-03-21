import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneMarkdownGenerator } from '../standalone-generator.js';

describe('StandaloneMarkdownGenerator', () => {
  let testDir;
  let generator;

  const minimalSpec = {
    openapi: '3.0.3',
    info: { title: 'Test API', version: '1.0.0' },
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

  const specWithTags = {
    ...minimalSpec,
    tags: [{ name: 'Users', description: 'User operations' }]
  };

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `md-gen-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    fs.mkdirSync(testDir, { recursive: true });
    generator = new StandaloneMarkdownGenerator(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getMetadata()', () => {
    test('returns expected metadata shape', () => {
      const meta = StandaloneMarkdownGenerator.getMetadata();
      expect(meta.name).toBe('markdown');
      expect(meta.packageName).toBe('@confytome/markdown');
    });
  });

  describe('validate()', () => {
    test('succeeds with no specPath set', async () => {
      const result = await generator.validate();
      expect(result.success).toBe(true);
    });

    test('succeeds with a valid specPath', async () => {
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify(minimalSpec));
      generator.options.specPath = specPath;
      const result = await generator.validate();
      expect(result.success).toBe(true);
    });

    test('reports error for an invalid specPath', async () => {
      generator.options.specPath = '/no/such/spec.json';
      const result = await generator.validate();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('initialize()', () => {
    test('initializes and returns valid result', async () => {
      const result = await generator.initialize();
      expect(result.valid).toBe(true);
    });
  });

  describe('generate()', () => {
    test('generates markdown from a valid spec', async () => {
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify(minimalSpec));
      generator.options.specPath = specPath;
      const result = await generator.generate();
      expect(result.success).toBe(true);
      expect(result.size).toBeGreaterThan(0);
    });

    test('uses tagOrder from spec.tags', async () => {
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify(specWithTags));
      generator.options.specPath = specPath;
      const result = await generator.generate();
      expect(result.success).toBe(true);
    });

    test('returns failure when specPath does not exist', async () => {
      generator.options.specPath = '/no/such/spec.json';
      const result = await generator.generate();
      expect(result.success).toBe(false);
    });

    test('returns failure when spec causes a processing error', async () => {
      const specPath = path.join(testDir, 'bad-spec.json');
      const badSpec = {
        openapi: '3.0.3',
        info: { title: 'Bad', version: '1.0.0' },
        paths: {
          '/test': {
            get: {
              summary: 'No tags',
              responses: { '200': { description: 'OK' } }
            }
          }
        }
      };
      fs.writeFileSync(specPath, JSON.stringify(badSpec));
      generator.options.specPath = specPath;
      const result = await generator.generate();
      expect(result.success).toBe(false);
    });
  });

  describe('_loadTemplate()', () => {
    test('returns same content on second call (cache hit)', async () => {
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify(minimalSpec));
      generator.options.specPath = specPath;
      await generator.generate();
      // Second generate call hits template cache
      const result = await generator.generate();
      expect(result.success).toBe(true);
    });
  });
});
