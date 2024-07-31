import {
    getBundleConfig,
    getKernelProjectDir,
    getTwigComponentConfiguration,
    getTwigConfiguration,
    TwigComponentConfiguration,
    TwigConfiguration,
} from './lib/symfony';
import { StorybookConfig, SymfonyOptions } from '../types';
import { join } from 'path';
import { PreviewCompilerPlugin } from './lib/preview-compiler-plugin';
import { DevPreviewCompilerPlugin } from './lib/dev-preview-compiler-plugin';
import { TwigLoaderPlugin } from './lib/twig-loader-plugin';
import { PresetProperty } from '@storybook/types';
import dedent from 'ts-dedent';

type BuildOptions = {
    twigComponent: TwigComponentConfiguration;
    twig: TwigConfiguration;
    runtimeDir: string;
    projectDir: string;
    additionalWatchPaths: string[];
};

const getBuildOptions = async (symfonyOptions: SymfonyOptions) => {
    const projectDir = await getKernelProjectDir();
    const twigComponentsConfig = await getTwigComponentConfiguration();
    const twigConfig = await getTwigConfiguration();

    const componentNamespaces: { [p: string]: string[] } = {};

    const twigPaths: string[] = Object.keys(twigConfig.paths).map((key) => `${projectDir}/${key}/`);

    for (const { name_prefix: namePrefix, template_directory: templateDirectory } of Object.values(
        twigComponentsConfig.defaults
    )) {
        componentNamespaces[namePrefix] = twigPaths.map((twigPath) => join(twigPath, templateDirectory));
    }

    const anonymousNamespace: string[] = twigPaths.map((twigPath) =>
        join(twigPath, twigComponentsConfig['anonymous_template_directory'])
    );

    const runtimeDir = (await getBundleConfig()).runtime_dir;

    return {
        twigComponent: {
            anonymousTemplateDirectory: anonymousNamespace,
            namespaces: componentNamespaces,
        },
        twig: {
            paths: twigPaths,
        },
        runtimeDir,
        projectDir,
        additionalWatchPaths: symfonyOptions.additionalWatchPaths || [],
    } as BuildOptions;
};

export const webpack: StorybookConfig['webpack'] = async (config, options) => {
    const framework = await options.presets.apply('framework');

    const frameworkOptions = typeof framework === 'string' ? {} : framework.options;

    // This options resolution should be done right before creating the build configuration (i.e. not in options presets).
    const symfonyOptions = await getBuildOptions(frameworkOptions.symfony);

    return {
        ...config,
        plugins: [
            ...(config.plugins || []),
            ...[
                options.configType === 'PRODUCTION'
                    ? PreviewCompilerPlugin.webpack()
                    : DevPreviewCompilerPlugin.webpack({
                          projectDir: symfonyOptions.projectDir,
                          additionalWatchPaths: symfonyOptions.additionalWatchPaths,
                      }),
                TwigLoaderPlugin.webpack({
                    twigComponentConfiguration: symfonyOptions.twigComponent,
                    twigConfiguration: symfonyOptions.twig,
                }),
            ],
        ],
        module: {
            ...config.module,
            rules: [...(config.module?.rules || [])],
        },
    };
};

export const previewHead: PresetProperty<'previewHead'> = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_HEAD_PLACEHOLDER-->
    `;

export const previewBody: PresetProperty<'previewBody'> = async (base: any) => dedent`
    ${base}
    <!--PREVIEW_BODY_PLACEHOLDER-->
    `;
