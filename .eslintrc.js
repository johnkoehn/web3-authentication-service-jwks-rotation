module.exports = {
    plugins: ['jest'],
    root: true,
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        'jest/globals': true
    },
    extends: 'airbnb-base',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        indent: [2, 4],
        'arrow-parens': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'max-len': ['error', { code: 250 }],
        'object-curly-newline': ['error', { consistent: true }],
        'operator-linebreak': ['error', 'after'],
        'no-console': 'off',
        'prefer-destructuring': 'off',
        'global-require': 0,
        'arrow-body-style': 0,
        radix: 0
    }
};
