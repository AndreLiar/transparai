module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    'no-plusplus': 'off',
    'class-methods-use-this': 'off',
    'no-prototype-builtins': 'off',
    'consistent-return': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    radix: 'off',
    'max-len': 'off',
    'implicit-arrow-linebreak': 'off',
    'func-names': 'off',
    'global-require': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'prefer-destructuring': 'off',
    'no-case-declarations': 'off',
    'default-case': 'off',
  },
};
