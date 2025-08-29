/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { es2022: true, node: true, jest: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['unused-imports', 'import', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js'] } },
  },
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'import/order': ['warn', { 'newlines-between': 'always' }],
    'no-console': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
}
