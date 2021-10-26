module.exports = {
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module',
  },
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'rules': {
    'no-undef': 2,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: false }],
    'no-console': [
      2
    ],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
  }
};
