/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-airbnb-with-typescript',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    '/*.d.ts',
    '/opencc',
  ],
  rules: {
    curly: ['error', 'all'],
    'padded-blocks': ['error', 'never'],
    'vue/multi-word-component-names': 'off',
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always',
    }],
    'vuejs-accessibility/click-events-have-key-events': 'off',
    '@typescript-eslint/space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'always',
      asyncArrow: 'always',
    }],
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['multiline-block-like', 'return', 'class'],
      },
      {
        blankLine: 'always',
        prev: ['multiline-block-like', 'class'],
        next: '*',
      },
    ],
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'semi', // 'none' or 'semi' or 'comma'
        requireLast: true,
      },
      singleline: {
        delimiter: 'semi', // 'semi' or 'comma'
        requireLast: true,
      },
    }],
    'import/no-extraneous-dependencies': 'off',
  },
};
