export default [
  {
    // Global ignores come first
    ignores: [
      'node_modules/',
      'docs/',
      'coverage/',
      'dist/',
      'build/',
      '**/*.template.js',
      '*.min.js'
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        jest: 'readonly',
        test: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'no-console': ['warn'],
      'no-debugger': ['error'],
      'prefer-const': ['error'],
      'no-var': ['error'],
      'object-shorthand': ['error', 'always'],
      'prefer-template': ['error'],
      'template-curly-spacing': ['error', 'never'],
      'arrow-spacing': ['error'],
      'comma-dangle': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { 'max': 2 }],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': ['error'],
      'space-infix-ops': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never']
    }
  },
  {
    files: ['**/test/**/*.js', '**/*.test.js'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['**/cli.js', '**/bin/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];
