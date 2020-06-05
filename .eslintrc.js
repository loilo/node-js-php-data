module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: ['prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier']
}
