import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack5";

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
            directory: '../template-stories/addons/links',
            titlePrefix: 'addons/links',
            files: '**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
        }, {
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
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@sensiolabs/storybook-symfony-webpack5",
        options: {
            // 👇 Here configure the framework
            symfony:
                process.env.NODE_ENV === 'development'
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

    webpackFinal: (config) => ({
        ...config,
        module: {
            ...config.module,
            rules: [
                // Ensure esbuild-loader applies to all files in ./template-stories
                {
                    test: [/\/template-stories\//],
                    exclude: [/\.mdx$/],
                    loader: require.resolve('esbuild-loader'),
                    options: {
                        loader: 'tsx',
                        target: 'es2015',
                    },
                },
                // Handle MDX files per the addon-docs presets (ish)
                {
                    test: /template-stories\/.*\.mdx$/,
                    exclude: /\.stories\.mdx$/,
                    use: [
                        {
                            loader: require.resolve('@storybook/addon-docs/mdx-loader'),
                        },
                    ],
                },
                // Ensure no other loaders from the framework apply
                ...config.module.rules.map(rule => ({
                    // @ts-ignore
                    ...(rule),
                    // @ts-ignore
                    exclude: [/\/template-stories\//].concat(rule.exclude || []),
                })),
            ],
        },
    }),
};

export default config;
