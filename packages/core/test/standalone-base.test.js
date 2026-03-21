import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneBase } from '../utils/StandaloneBase.js';

class ConcreteGenerator extends StandaloneBase {
  static getMetadata() {
    return { name: 'test', packageName: '@test/generator', version: '1.0.0' };
  }
  async generate() {
    return { success: true };
  }
}

describe('StandaloneBase', () => {
  let testDir;
  let generator;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `standalone-base-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    generator = new ConcreteGenerator(testDir);
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testDir)) {
        fs.chmodSync(testDir, 0o755);
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch { /* ignore cleanup errors */ }
  });

  describe('getMetadata()', () => {
    test('throws when called on base class directly', () => {
      expect(() => StandaloneBase.getMetadata()).toThrow('getMetadata() must be implemented by subclass');
    });

    test('returns metadata from subclass', () => {
      expect(ConcreteGenerator.getMetadata().name).toBe('test');
    });
  });

  describe('generate()', () => {
    test('throws when called on base class directly', async () => {
      const base = new StandaloneBase();
      await expect(base.generate()).rejects.toThrow('generate() must be implemented by subclass');
    });
  });

  describe('validate()', () => {
    test('succeeds when output dir does not yet exist', async () => {
      const result = await generator.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('succeeds when output dir already exists', async () => {
      fs.mkdirSync(testDir, { recursive: true });
      const result = await generator.validate();
      expect(result.valid).toBe(true);
    });

    test('returns error when output dir is not writable', async () => {
      if (process.platform === 'win32') return;
      fs.mkdirSync(testDir, { recursive: true });
      fs.chmodSync(testDir, 0o555);
      const result = await generator.validate();
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Cannot write to output directory');
    });
  });

  describe('initialize()', () => {
    test('creates output dir when it does not exist', async () => {
      expect(fs.existsSync(testDir)).toBe(false);
      await generator.initialize();
      expect(fs.existsSync(testDir)).toBe(true);
    });

    test('merges options', async () => {
      await generator.initialize({ excludeBrand: true });
      expect(generator.options.excludeBrand).toBe(true);
    });
  });

  describe('loadOpenAPISpec()', () => {
    test('loads from explicit path', () => {
      fs.mkdirSync(testDir, { recursive: true });
      const specPath = path.join(testDir, 'spec.json');
      fs.writeFileSync(specPath, JSON.stringify({ openapi: '3.0.3', paths: {} }));
      expect(generator.loadOpenAPISpec(specPath).openapi).toBe('3.0.3');
    });

    test('loads from default path when no path given', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'api-spec.json'), JSON.stringify({ openapi: '3.1.0' }));
      expect(generator.loadOpenAPISpec().openapi).toBe('3.1.0');
    });

    test('throws for missing file', () => {
      expect(() => generator.loadOpenAPISpec('/no/such/file.json')).toThrow('OpenAPI specification not found');
    });

    test('throws for invalid JSON', () => {
      fs.mkdirSync(testDir, { recursive: true });
      const specPath = path.join(testDir, 'bad.json');
      fs.writeFileSync(specPath, 'not-json');
      expect(() => generator.loadOpenAPISpec(specPath)).toThrow('Failed to parse OpenAPI specification');
    });
  });

  describe('writeOutputFile()', () => {
    test('writes file and returns success result', () => {
      fs.mkdirSync(testDir, { recursive: true });
      const result = generator.writeOutputFile('out.txt', 'hello');
      expect(result.success).toBe(true);
      expect(result.size).toBeGreaterThan(0);
    });

    test('creates nested subdirectories automatically', () => {
      fs.mkdirSync(testDir, { recursive: true });
      const nested = path.join(testDir, 'a', 'b', 'c.txt');
      const result = generator.writeOutputFile(nested, 'content');
      expect(result.success).toBe(true);
      expect(fs.existsSync(nested)).toBe(true);
    });

    test('returns failure result on write error', () => {
      const result = generator.writeOutputFile('/root/no-permission/file.txt', 'content');
      expect(result.success).toBe(false);
      expect(result.size).toBe(0);
    });
  });

  describe('getBaseUrl()', () => {
    test('returns empty string for null servers', () => {
      expect(generator.getBaseUrl(null)).toBe('');
    });

    test('returns empty string for empty servers array', () => {
      expect(generator.getBaseUrl([])).toBe('');
    });

    test('returns the last server url', () => {
      const servers = [{ url: 'https://first.example.com' }, { url: 'https://last.example.com' }];
      expect(generator.getBaseUrl(servers)).toBe('https://last.example.com');
    });
  });

  describe('generateBranding()', () => {
    test('returns html timestamp-only when excludeBrand is true', () => {
      generator.options.excludeBrand = true;
      expect(generator.generateBranding('html')).toMatch(/<p><em>Generated .+ UTC<\/em><\/p>/);
    });

    test('returns markdown timestamp-only when excludeBrand is true', () => {
      generator.options.excludeBrand = true;
      expect(generator.generateBranding('markdown')).toMatch(/\*Generated .+ UTC\*/);
    });

    test('returns html branding with package name', () => {
      const result = generator.generateBranding('html');
      expect(result).toContain('@test/generator');
      expect(result).toContain('<p>');
    });

    test('returns markdown branding with package name', () => {
      const result = generator.generateBranding('markdown');
      expect(result).toContain('@test/generator');
    });

    test('returns plain text for unknown format', () => {
      const result = generator.generateBranding('plain');
      expect(result).toContain('@test/generator');
      expect(result).not.toContain('<p>');
    });
  });

  describe('log()', () => {
    test('logs info messages', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      generator.log('hello');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello'));
      spy.mockRestore();
    });

    test('logs warn messages', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      generator.log('caution', 'warn');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('caution'));
      spy.mockRestore();
    });

    test('logs error messages', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      generator.log('oops', 'error');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('oops'));
      spy.mockRestore();
    });

    test('logs with no prefix for unknown level', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      generator.log('msg', 'unknown');
      expect(spy).toHaveBeenCalledWith('msg');
      spy.mockRestore();
    });
  });

  describe('validateFileExists()', () => {
    test('throws when file does not exist', () => {
      expect(() => generator.validateFileExists('/no/such/file.txt', 'spec')).toThrow('spec not found');
    });

    test('returns true for a readable file', () => {
      fs.mkdirSync(testDir, { recursive: true });
      const filePath = path.join(testDir, 'readable.txt');
      fs.writeFileSync(filePath, 'content');
      expect(generator.validateFileExists(filePath, 'file')).toBe(true);
    });

    test('throws for unreadable file', () => {
      if (process.platform === 'win32') return;
      fs.mkdirSync(testDir, { recursive: true });
      const filePath = path.join(testDir, 'unreadable.txt');
      fs.writeFileSync(filePath, 'content');
      fs.chmodSync(filePath, 0o000);
      expect(() => generator.validateFileExists(filePath, 'locked file')).toThrow('Cannot read locked file');
    });
  });

  describe('getInfo()', () => {
    test('returns metadata from subclass', () => {
      expect(generator.getInfo().name).toBe('test');
    });
  });

  describe('cleanup()', () => {
    test('resolves without error', async () => {
      await expect(generator.cleanup()).resolves.toBeUndefined();
    });
  });
});
