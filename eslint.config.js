module.exports = [
    {
        ignores: ['node_modules/**'],
    },
    {
        files: ['server.js', 'src/**/*.js', 'tests/**/*.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                fetch: 'readonly',
                module: 'readonly',
                process: 'readonly',
                require: 'readonly',
            },
        },
        rules: {
            eqeqeq: ['error', 'always'],
            'no-undef': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    {
        files: ['public/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                document: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                globalThis: 'readonly',
                localStorage: 'readonly',
                module: 'readonly',
                require: 'readonly',
                window: 'readonly',
            },
        },
        rules: {
            eqeqeq: ['error', 'always'],
            'no-undef': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
];
