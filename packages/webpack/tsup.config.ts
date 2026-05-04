import { defineConfig, type Options } from 'tsup';

const NODE_TARGET = 'node20.19';

type BundlerConfig = {
    bundler?: {
        nodeEntries?: string[];
        managerEntries?: string[];
        previewEntries?: string[];
    };
};

export default defineConfig(async (options) => {
    const packageJson = (await import('./package.json', { with: { type: 'json' } })).default as BundlerConfig;
    const { bundler: { nodeEntries = [], managerEntries = [], previewEntries = [] } = {} } = packageJson;

    const commonConfig: Options = {
        splitting: true,
        format: ['esm'],
        treeshake: true,
        clean: false,
        external: [/^storybook(\/.*)?$/, /^@storybook\/.*/],
        noExternal: ['@sensiolabs/storybook-symfony-shared'],
    };

    const configs: Options[] = [];

    if (nodeEntries.length) {
        configs.push({
            ...commonConfig,
            entry: nodeEntries,
            dts: true,
            target: NODE_TARGET,
            platform: 'node',
            external: [/^[^./]/],
        });
    }

    // manager entries are entries meant to be loaded into the manager UI
    // they'll have manager-specific packages externalized and they won't be usable in node
    // they won't have types generated for them as they're usually loaded automatically by Storybook
    if (managerEntries.length) {
        configs.push({
            ...commonConfig,
            entry: managerEntries,
            target: 'esnext',
            platform: 'browser',
        });
    }

    // preview entries are entries meant to be loaded into the preview iframe
    // they'll have preview-specific packages externalized and they won't be usable in node
    // they won't have types generated for them as they're usually loaded automatically by Storybook
    if (previewEntries.length) {
        configs.push({
            ...commonConfig,
            entry: previewEntries,
            dts: {
                resolve: ['@sensiolabs/storybook-symfony-shared'],
            },
            target: 'esnext',
            platform: 'browser',
        });
    }

    return configs;
});
