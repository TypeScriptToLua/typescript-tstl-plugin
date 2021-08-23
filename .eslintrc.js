/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'plugin:@typescript-eslint/base',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: 'tsconfig.json',
  },
  rules: {
    // Covered by TypeScript
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    // Extension Rules
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'error',
    'no-loop-func': 'off',
    '@typescript-eslint/no-loop-func': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    quotes: 'off',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],

    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
          '{}': false,
          Function: null,
          CallableFunction: { fixWith: '(...args: any[]) => any' },
          NewableFunction: { fixWith: 'new (...args: any[]) => any' },
        },
      },
    ],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
    ],
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { overrides: { constructors: 'no-public' } },
    ],
    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: ['camelCase'] },

      // TODO: Allow PascalCase for constructable types
      // TODO: Allow any name for destructured values
      { selector: 'variableLike', format: null },
      // { selector: 'variableLike', format: ['camelCase'] },
      // { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
      // { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },

      // TODO: https://github.com/typescript-eslint/typescript-eslint/issues/1712
      // TODO: https://github.com/typescript-eslint/typescript-eslint/issues/2244
      { selector: 'memberLike', format: null },
      // TODO: Keep only one format
      { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
      // TODO: Require `private _property`?
      // { selector: 'memberLike', modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'require' },

      { selector: 'typeLike', format: ['PascalCase'] },
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        custom: { regex: '^(T(\\d+|[A-Z][A-Za-z0-9]*)?|U|P|K|V)$', match: true },
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: { regex: '^I[A-Z]', match: false },
      },
    ],
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-extra-non-null-assertion': 'error',
    '@typescript-eslint/no-extraneous-class': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    'no-async-promise-executor': 'off',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-namespace': 'error',
    'global-require': 'off',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'error',
    'no-constant-condition': 'off',
    '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-arguments': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    // TODO: Enable instead of unicorn/no-for-loop after https://github.com/typescript-eslint/typescript-eslint/issues/702
    // '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    // TODO: https://github.com/typescript-eslint/typescript-eslint/issues/1265
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/promise-function-async': ['error', { checkArrowFunctions: false }],
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/restrict-plus-operands': ['error', { checkCompoundAssignments: true }],
    // TODO: Allow any
    // '@typescript-eslint/restrict-template-expressions': 'error',
    'no-return-await': 'off',
    // TODO: Always?
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',
    '@typescript-eslint/unified-signatures': 'error',
  },
  overrides: [
    {
      files: '**/*.d.ts',
      rules: {
        // This plugin doesn't handle `declare class A { constructor() }`
        'prefer-class-properties/prefer-class-properties': 'off',
      },
    },
  ],
};
