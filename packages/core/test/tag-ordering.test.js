/**
 * Tag Ordering Tests
 *
 * Verifies that:
 * 1. Tags can be ordered via OpenAPI spec tags array
 * 2. Tags can be ordered via config tagOrder option
 * 3. Config tagOrder overrides spec tags order
 * 4. Tags not in tagOrder are sorted alphabetically after ordered tags
 * 5. Auth special case has been removed
 */

import { OpenApiProcessor } from '../utils/OpenApiProcessor.js';

describe('Tag Ordering', () => {
  let processor;

  test('should order resources by OpenAPI spec tags array', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      tags: [
        { name: 'Users', description: 'User management' },
        { name: 'Posts', description: 'Post operations' },
        { name: 'Comments', description: 'Comment operations' }
      ],
      paths: {
        '/comments': {
          get: {
            tags: ['Comments'],
            summary: 'Get comments',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/posts': {
          get: {
            tags: ['Posts'],
            summary: 'Get posts',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: spec.tags.map(tag => tag.name)
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Users');
    expect(data.resources[1].name).toBe('Posts');
    expect(data.resources[2].name).toBe('Comments');
  });

  test('should order resources by config tagOrder option', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/analytics': {
          get: {
            tags: ['Analytics'],
            summary: 'Get analytics',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/settings': {
          get: {
            tags: ['Settings'],
            summary: 'Get settings',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/dashboard': {
          get: {
            tags: ['Dashboard'],
            summary: 'Get dashboard',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: ['Dashboard', 'Settings', 'Analytics']
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Dashboard');
    expect(data.resources[1].name).toBe('Settings');
    expect(data.resources[2].name).toBe('Analytics');
  });

  test('should place unordered tags alphabetically after ordered tags', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/auth': {
          get: {
            tags: ['Auth'],
            summary: 'Authenticate',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/posts': {
          get: {
            tags: ['Posts'],
            summary: 'Get posts',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/comments': {
          get: {
            tags: ['Comments'],
            summary: 'Get comments',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: ['Users', 'Posts']
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(4);
    expect(data.resources[0].name).toBe('Users');
    expect(data.resources[1].name).toBe('Posts');
    expect(data.resources[2].name).toBe('Auth');
    expect(data.resources[3].name).toBe('Comments');
  });

  test('should not give special priority to auth tags', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/authentication': {
          get: {
            tags: ['Authentication'],
            summary: 'Authenticate',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/authorization': {
          get: {
            tags: ['Authorization'],
            summary: 'Authorize',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({});

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Authentication');
    expect(data.resources[1].name).toBe('Authorization');
    expect(data.resources[2].name).toBe('Users');
  });

  test('should handle case-insensitive tag matching', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/posts': {
          get: {
            tags: ['Posts'],
            summary: 'Get posts',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: ['users', 'posts']
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(2);
    expect(data.resources[0].name).toBe('Users');
    expect(data.resources[1].name).toBe('Posts');
  });

  test('should handle empty tagOrder with alphabetical fallback', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/zebras': {
          get: {
            tags: ['Zebras'],
            summary: 'Get zebras',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/apples': {
          get: {
            tags: ['Apples'],
            summary: 'Get apples',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/monkeys': {
          get: {
            tags: ['Monkeys'],
            summary: 'Get monkeys',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: []
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Apples');
    expect(data.resources[1].name).toBe('Monkeys');
    expect(data.resources[2].name).toBe('Zebras');
  });

  test('should handle partial tagOrder specification', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/dashboard': {
          get: {
            tags: ['Dashboard'],
            summary: 'Get dashboard',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/analytics': {
          get: {
            tags: ['Analytics'],
            summary: 'Get analytics',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/reports': {
          get: {
            tags: ['Reports'],
            summary: 'Get reports',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: ['Dashboard', 'Users']
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(4);
    expect(data.resources[0].name).toBe('Dashboard');
    expect(data.resources[1].name).toBe('Users');
    expect(data.resources[2].name).toBe('Analytics');
    expect(data.resources[3].name).toBe('Reports');
  });

  test('should use tag order from OpenAPI spec tags array (JSDoc/serverConfig pattern)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      tags: [
        { name: 'Authentication', description: 'Auth operations' },
        { name: 'Users', description: 'User operations' },
        { name: 'Admin', description: 'Admin operations' }
      ],
      paths: {
        '/admin': {
          get: {
            tags: ['Admin'],
            summary: 'Admin dashboard',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: { '200': { description: 'Success' } }
          }
        },
        '/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'Login',
            responses: { '200': { description: 'Success' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: spec.tags.map(tag => tag.name)
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Authentication');
    expect(data.resources[1].name).toBe('Users');
    expect(data.resources[2].name).toBe('Admin');
  });

  test('should handle Turkish characters in tag ordering', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/kullanıcılar': {
          get: {
            tags: ['Kullanıcılar'],
            summary: 'Kullanıcıları getir',
            responses: { '200': { description: 'Başarılı' } }
          }
        },
        '/şirketler': {
          get: {
            tags: ['Şirketler'],
            summary: 'Şirketleri getir',
            responses: { '200': { description: 'Başarılı' } }
          }
        },
        '/ürünler': {
          get: {
            tags: ['Ürünler'],
            summary: 'Ürünleri getir',
            responses: { '200': { description: 'Başarılı' } }
          }
        }
      }
    };

    processor = new OpenApiProcessor({
      tagOrder: ['Ürünler', 'Şirketler', 'Kullanıcılar']
    });

    const data = processor.process(spec);

    expect(data.resources).toHaveLength(3);
    expect(data.resources[0].name).toBe('Ürünler');
    expect(data.resources[1].name).toBe('Şirketler');
    expect(data.resources[2].name).toBe('Kullanıcılar');
  });
});
