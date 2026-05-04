import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

const globals = {
    AbortSignal: 'readonly',
    console: 'readonly',
    document: 'readonly',
    Event: 'readonly',
    fetch: 'readonly',
    FormData: 'readonly',
    globalThis: 'readonly',
    HTMLElement: 'readonly',
    HTMLIFrameElement: 'readonly',
    location: 'readonly',
    module: 'readonly',
    Node: 'readonly',
    process: 'readonly',
    URL: 'readonly',
    window: 'readonly',
};

export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    js.configs.recommended,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals,
            parser: tsParser,
            parserOptions: {
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            quotes: [
                'error',
                'single',
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true,
                },
            ],
        },
    },
    {
        files: ['src/**/*.d.ts'],
        rules: {
            'no-var': 'off',
            'spaced-comment': 'off',
            'vars-on-top': 'off',
        },
    },
    prettier,
];
