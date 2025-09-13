/**
 * UTF Character Preservation Test for Anchor Generation
 *
 * This test ensures that the createAnchor method preserves UTF characters
 * in both default and --no-url-encode modes. This is a critical test that
 * has prevented multiple regressions.
 *
 * See: .github/ANCHOR_HANDLING_FIX.md for background
 */

import { OpenApiProcessor } from '../../markdown/utils/OpenApiProcessor.js';

describe('UTF Character Preservation in Anchors', () => {
  const testCases = [
    {
      name: 'Turkish',
      text: 'Kullanıcı Girişi ve Token Alımı',
      expected: {
        default: 'Kullanıcı-Girişi-ve-Token-Alımı',
        noEncode: 'kullanıcı-girişi-ve-token-alımı'
      }
    },
    {
      name: 'Spanish',
      text: 'José María Configuración',
      expected: {
        default: 'José-María-Configuración',
        noEncode: 'josé-maría-configuración'
      }
    },
    {
      name: 'Chinese',
      text: '用户登录和令牌获取',
      expected: {
        default: '用户登录和令牌获取',
        noEncode: '用户登录和令牌获取'
      }
    },
    {
      name: 'Russian',
      text: 'Здравствуй мир',
      expected: {
        default: 'Здравствуй-мир',
        noEncode: 'здравствуй-мир'
      }
    },
    {
      name: 'Arabic',
      text: 'مرحبا بالعالم',
      expected: {
        default: 'مرحبا-بالعالم',
        noEncode: 'مرحبا-بالعالم'
      }
    },
    {
      name: 'English (baseline)',
      text: 'User Login and Token',
      expected: {
        default: 'User-Login-and-Token',
        noEncode: 'user-login-and-token'
      }
    }
  ];

  testCases.forEach(({ name, text, expected }) => {
    describe(`${name} characters`, () => {
      test('should preserve UTF in default mode', () => {
        const processor = new OpenApiProcessor({ urlEncodeAnchors: true });
        const result = processor.createAnchor('', '', text);

        expect(result).toBe(expected.default);

        // Verify no characters were lost
        const originalChars = text.replace(/\s+/g, '-');
        const resultChars = result.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        expect(resultChars).toBe(originalChars);
      });

      test('should preserve UTF in --no-url-encode mode', () => {
        const processor = new OpenApiProcessor({ urlEncodeAnchors: false });
        const result = processor.createAnchor('', '', text);

        expect(result).toBe(expected.noEncode);

        // Verify no characters were lost (except case changes)
        const originalChars = text.toLowerCase().replace(/\s+/g, '-');
        const resultChars = result.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        expect(resultChars).toBe(originalChars);
      });

      test('should only differ by case between modes', () => {
        const defaultProcessor = new OpenApiProcessor({ urlEncodeAnchors: true });
        const noEncodeProcessor = new OpenApiProcessor({ urlEncodeAnchors: false });

        const defaultResult = defaultProcessor.createAnchor('', '', text);
        const noEncodeResult = noEncodeProcessor.createAnchor('', '', text);

        // For languages with case, results should be related by case conversion
        expect(defaultResult.toLowerCase()).toBe(noEncodeResult.toLowerCase());
      });
    });
  });

  test('should never remove characters with problematic regex', () => {
    // This is the broken regex that was causing issues
    const BROKEN_REGEX = /[^\w\s-]/g;

    const turkishText = 'Kullanıcı Girişi';
    const brokenResult = turkishText.toLowerCase().replace(BROKEN_REGEX, '');

    // Verify the broken regex removes characters (this demonstrates the problem)
    expect(brokenResult).toBe('kullanc girii'); // Characters missing!
    expect(brokenResult).not.toBe('kullanıcı girişi'); // Should be this

    // Verify our implementation doesn't have this problem
    const processor = new OpenApiProcessor({ urlEncodeAnchors: false });
    const correctResult = processor.createAnchor('', '', turkishText);
    expect(correctResult).toBe('kullanıcı-girişi'); // Characters preserved!
  });

  test('should handle edge cases', () => {
    const processor = new OpenApiProcessor({ urlEncodeAnchors: true });

    // Empty string
    expect(processor.createAnchor('', '', '')).toBe('');

    // Only spaces
    expect(processor.createAnchor('', '', '   ')).toBe('');

    // Multiple spaces
    expect(processor.createAnchor('', '', 'Test    Multiple   Spaces')).toBe('Test-Multiple-Spaces');

    // Leading/trailing hyphens
    expect(processor.createAnchor('', '', '---Test---')).toBe('Test');
  });
});
