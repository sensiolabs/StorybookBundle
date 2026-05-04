import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

const config: StorybookConfig = {
    stories: [
        {
            directory: '../templates/components',
            titlePrefix: 'symfony',
            files: '**/*.@(mdx|stories.@(js|ts))',
        },
        {
            directory: '../template-stories/lib/preview-api',
            titlePrefix: 'lib/preview-api',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
        },
        {
            directory: '../template-stories/addons/actions',
            titlePrefix: 'addons/actions',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/backgrounds',
            titlePrefix: 'addons/backgrounds',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/controls',
            titlePrefix: 'addons/controls',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/docs',
            titlePrefix: 'addons/docs',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/toolbars',
            titlePrefix: 'addons/toolbars',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/viewport',
            titlePrefix: 'addons/viewport',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
            directory: '../template-stories/addons/interactions',
            titlePrefix: 'addons/interactions',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }
    ],
    addons: [
        "@storybook/addon-docs",
        "@storybook/addon-vitest",
    ],
    framework: {
        name: "@sensiolabs/storybook-symfony-vite",
        options: {
            symfony:
                process.env.NODE_ENV !== 'production'
                    ? {
                        server: 'http://localhost:8000',
                        proxyPaths: [
                            '/assets',
                            '/_components',
                        ],
                        additionalWatchPaths: [
                            'assets',
                        ]
                    }
                    : {}
        },
    },
    previewAnnotations: ['./templates/components/Storybook', './template-stories/lib/preview-api/preview.ts', './template-stories/addons/toolbars/preview.ts'],
};

export default config;
