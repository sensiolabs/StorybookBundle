import { webpack as TwigIndexerPlugin } from './plugins/twig-template-indexer';
import { webpack as TwigTemplateResolver } from './plugins/twig-component-resolver';
import { FrameworkOptions, SymfonyOptions } from './types';
import { StorybookConfig } from '@storybook/server-webpack5';
import { Options, PresetProperty, Entry, Indexer } from '@storybook/types';
import { join } from 'path';
import { access } from 'fs-extra';
import dedent from 'ts-dedent';
import { twigCsfIndexer } from './indexer';

export const core: PresetProperty<'core'> = async (config, options) => {
    const framework = await options.presets.apply('framework');

    return {
        ...config,
        builder: {
            name: require.resolve('./builders/webpack5-builder'),
            options: typeof framework === 'string' ? {} : framework.options.builder || {},
        },
        renderer: '@storybook/server',
    };
};

export const frameworkOptions = async (frameworkOptions: FrameworkOptions, options: Options) => {
    const { configDir } = options;

    const symfonyOptions: SymfonyOptions = {
        ...frameworkOptions.symfony,
        runtimePath: join(configDir, frameworkOptions.symfony.runtimePath ?? '../var/storybook'),
    };

    return {
        ...frameworkOptions,
        symfony: symfonyOptions,
    };
};

export const webpack: StorybookConfig['webpack'] = async (config, options) => {
    const frameworkOptions = await options.presets.apply<{ symfony: SymfonyOptions }>('frameworkOptions');
    return {
        ...config,
        plugins: [
            ...(config.plugins || []),
            TwigIndexerPlugin(frameworkOptions.symfony),
            TwigTemplateResolver(frameworkOptions.symfony),
        ],
        module: {
            ...config.module,
            rules: [
                {
                    test: /\.html\.twig$/,
                    loader: require.resolve('./loaders/twig-loader'),
                },
                ...(config.module.rules || []),
            ],
        },
    };
};

export const experimental_indexers: PresetProperty<'experimental_indexers'> = (existingIndexers: Indexer[]) =>
    [twigCsfIndexer].concat(existingIndexers || []);

export const previewMainTemplate = async (path: string, options: Options) => {
    const { symfony } = await options.presets.apply<{ symfony: SymfonyOptions }>('frameworkOptions');

    const previewPath = join(symfony.runtimePath, 'preview/preview.ejs');
    try {
        await access(previewPath);
        return require.resolve(previewPath);

    } catch (err) {
        throw new Error(dedent`
      Unable to find preview template "${previewPath}". Did you forget to run "bin/console storybook:init"?
    `);
    }
};

export const previewAnnotations = (entry: Entry[] = []) => {

    return [require.resolve('./preview'), ...entry];
};

