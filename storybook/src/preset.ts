import { FrameworkOptions, ResolvedSymfonyOptions, SymfonyOptions } from './types';
import { StorybookConfig } from '@storybook/preset-server-webpack';
import { Options, PresetProperty, Entry, Indexer } from '@storybook/types';
import { createTwigCsfIndexer, TwigStoryIndex } from './indexer';
import { getKernelProjectDir, getTwigComponentConfiguration, resolveTwigComponentFile } from './utils/symfony';
import * as path from 'path';
import dedent from 'ts-dedent';
import { PreviewCompilerPlugin } from './plugins/preview-compiler-plugin';
import { join } from 'path';
import { DevPreviewCompilerPlugin } from './plugins/dev-preview-compiler-plugin';
import { TwigStoriesDependenciesPlugin } from './plugins/twig-stories-dependencies-plugin';
import { TwigLoaderPlugin } from './plugins/twig-loader-plugin';
import { TwigStoriesGeneratorPlugin } from './plugins/twig-stories-generator-plugin';

const twigStoryIndex = new TwigStoryIndex();

export const core: PresetProperty<'core'> = async (config, options) => {
    const framework = await options.presets.apply('framework');

    return {
        ...config,
        builder: {
            name: require.resolve('./builders/webpack5'),
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

    const anonymousNamespace = path.join(projectDir, 'templates', twigComponentsConfig['anonymous_template_directory']);

    return {
        ...symfonyOptions,
        projectDir: projectDir,
        additionalWatchPaths: symfonyOptions.additionalWatchPaths ?? [],
        twigComponent: {
            anonymousTemplateDirectory: anonymousNamespace,
            namespaces: componentNamespaces,
        },
    } as ResolvedSymfonyOptions;
}

export const webpack: StorybookConfig['webpack'] = async (config, options) => {
    const frameworkOptions = await options.presets.apply<{ symfony: SymfonyOptions }>('frameworkOptions');

    // This options resolution should be done right before creating the build configuration (i.e. not in options presets).
    // TODO: Maybe find a better place for this?
    const symfonyOptions = await resolveFinalSymfonyOptions(frameworkOptions.symfony);

    const resolver = (name: string) => {
        return resolveTwigComponentFile(name, symfonyOptions.twigComponent);
    };

    const storiesPath = join(symfonyOptions.runtimePath, '/stories');

    return {
        ...config,
        plugins: [
            ...(config.plugins || []),
            ...[
                ...(options.configType === 'PRODUCTION'
                    ? [PreviewCompilerPlugin.webpack()]
                    : [
                          DevPreviewCompilerPlugin.webpack({
                              projectDir: symfonyOptions.projectDir,
                              additionalWatchPaths: symfonyOptions.additionalWatchPaths,
                          }),
                          TwigStoriesDependenciesPlugin.webpack({
                              twigStoryIndex,
                              resolver,
                          }),
                          TwigLoaderPlugin.webpack({ resolver }),
                      ]),
                TwigStoriesGeneratorPlugin.webpack({ twigStoryIndex, storiesPath }),
            ],
        ],
        module: {
            ...config.module,
            rules: [...(config.module?.rules || [])],
        },
    };
};

const STORIES_REGEX = /(stories|story)\.(m?js|ts)x?$/;

export const experimental_indexers: PresetProperty<'experimental_indexers'> = (existingIndexers?: Indexer[]) =>
    [createTwigCsfIndexer(twigStoryIndex, STORIES_REGEX)].concat(existingIndexers || []);

export const previewAnnotations = (entry: Entry[] = []) => {
    return [require.resolve('./preview'), ...entry];
};

export const previewHead = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_HEAD_PLACEHOLDER-->
    `;

export const previewBody = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_BODY_PLACEHOLDER-->
    `;
