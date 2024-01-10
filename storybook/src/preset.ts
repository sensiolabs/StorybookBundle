import { FrameworkOptions, SymfonyOptions } from './types';
import { StorybookConfig } from '@storybook/preset-server-webpack';
import { Options, PresetProperty, Entry, Indexer } from '@storybook/types';
import { getTwigStoriesIndexer, createTwigCsfIndexer } from './indexer';
import { getKernelProjectDir, getTwigComponentConfiguration } from './utils/symfony';
import * as path from 'path';
import { SymfonyPlugin, FinalSymfonyOptions } from './plugins/symfony-plugin';

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
        ...(frameworkOptions.symfony || {}),
        runtimePath: path.join(configDir, frameworkOptions.symfony?.runtimePath ?? '../var/storybook'),
    };

    return {
        ...frameworkOptions,
        symfony: symfonyOptions,
    };
};

async function resolveFinalSymfonyOptions(symfonyOptions: SymfonyOptions) {
    const projectDir = await getKernelProjectDir();
    const twigComponentsConfig = await getTwigComponentConfiguration();

    const componentNamespaces: { [p: string]: string } = {};

    for (const { name_prefix: namePrefix, template_directory: templateDirectory } of Object.values(
        twigComponentsConfig.defaults
    )) {
        componentNamespaces[namePrefix] = path.join(projectDir, 'templates', templateDirectory);
    }

    return {
        ...symfonyOptions,
        projectDir: projectDir,
        twigComponent: {
            anonymousTemplateDirectory: path.join(
                projectDir,
                'templates',
                twigComponentsConfig['anonymous_template_directory']
            ),
            namespaces: componentNamespaces,
        },
    } as FinalSymfonyOptions;
}

export const webpack: StorybookConfig['webpack'] = async (config, options) => {
    const frameworkOptions = await options.presets.apply<{ symfony: SymfonyOptions }>('frameworkOptions');

    // This options resolution should be done right before creating the build configuration (i.e. not in options presets).
    // TODO: Maybe find a better place for this?
    const symfonyOptions = await resolveFinalSymfonyOptions(frameworkOptions.symfony);

    return {
        ...config,
        plugins: [...(config.plugins || []), SymfonyPlugin.webpack(symfonyOptions)],
        module: {
            ...config.module,
            rules: [...(config.module?.rules || [])],
        },
    };
};

export const experimental_indexers: PresetProperty<'experimental_indexers'> = (existingIndexers: Indexer[]) =>
    [createTwigCsfIndexer(getTwigStoriesIndexer())].concat(existingIndexers || []);

export const previewAnnotations = (entry: Entry[] = []) => {
    return [require.resolve('./preview'), ...entry];
};
