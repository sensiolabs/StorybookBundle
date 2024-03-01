import { createUnplugin } from 'unplugin';
import { SymfonyOptions } from '../types';
import { getTwigStoriesIndex, STORIES_REGEX } from '../indexer';
import { resolveTwigComponentFile, runSymfonyCommand, TwigComponentConfiguration } from '../utils/symfony';
import dedent from 'ts-dedent';
import { twig } from '../utils';
import { join } from 'path';
import fs from 'node:fs';
import * as fsPromise from 'fs/promises';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { JSDOM } from 'jsdom';
import { logger } from '@storybook/node-logger';
import { computeAdditionalWatchPaths } from '../utils/computeAdditionalWatchPaths';

type InternalSymfonyOptions = {
    additionalWatchPaths: string[];
    projectDir: string;
    twigComponent: TwigComponentConfiguration;
};

export type FinalSymfonyOptions = Required<SymfonyOptions> & InternalSymfonyOptions;

/**
 * Post compiler to import component templates used in the stories file.
 *
 * This enables HMR for component templates.
 */
const TwigStoriesCompilerPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const PLUGIN_NAME = 'twig-stories-compiler';

    const twigStoryIndex = getTwigStoriesIndex();

    return {
        name: PLUGIN_NAME,
        enforce: 'post',
        transformInclude: (id) => {
            return STORIES_REGEX.test(id) && twigStoryIndex.hasStories(id);
        },
        transform: async (code, id) => {
            const components = twigStoryIndex.getStories(id).reduce((acc, twigStory) => {
                twigStory.template.getComponents().forEach((component) => acc.add(component));
                return acc;
            }, new Set<string>());

            const imports: string[] = [];

            components.forEach((v) => {
                imports.push(resolveTwigComponentFile(v, options.twigComponent));
            });

            return dedent`
            ${code}
            
            ; export const __twigTemplates = [
                ${imports.map((file) => `import('${file}')`)}
            ];
          `;
        },
    };
});

/**
 * Twig template source loader.
 *
 * Generates JS modules to export raw template source and imports required components.
 */
const TwigTemplateLoaderPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    return {
        name: 'twig-loader',
        enforce: 'pre',
        transformInclude: (id) => {
            return /\.html\.twig$/.test(id);
        },
        transform: async (code, id) => {
            const imports: string[] = [];

            try {
                const templateSource = twig`${code}`;
                const components = new Set<string>(templateSource.getComponents());

                components.forEach((v) => {
                    imports.push(resolveTwigComponentFile(v, options.twigComponent));
                });
            } catch (err) {
                logger.warn(dedent`
                Failed to parse template in '${id}': ${err}
                `);
            }

            return dedent`            
            ${imports.map((file) => `import '${file}';`).join('\n')}
            
            export default { 
                source: \`${code}\`,
            }; 
           `;
        },
    };
});

/**
 * Plugin that hooks on compilation events to clean and create templates used to render actual stories.
 */
const TwigStoriesTemplateGeneratorPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const PLUGIN_NAME = 'twig-stories-template-generator';

    const twigStoryIndex = getTwigStoriesIndex();
    const outDir = join(options.runtimePath, '/stories');

    return {
        name: PLUGIN_NAME,
        webpack(compiler) {
            const processedFiles = new Set<string>();

            compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
                // Each time a story module is resolved, track it, so we can dump templates after compilation
                factory.hooks.afterResolve.tap(PLUGIN_NAME, (resolveData) => {
                    const fileName = resolveData.createData.userRequest;
                    if (fileName && twigStoryIndex.hasStories(fileName)) {
                        processedFiles.add(fileName);
                    }
                });
            });

            compiler.hooks.afterCompile.tapPromise(PLUGIN_NAME, async (compilation) => {
                if (compilation.name === 'preview') {
                    // First clean out dir
                    try {
                        await fsPromise.access(outDir, fs.constants.F_OK);
                        const files = await fsPromise.readdir(outDir);
                        await Promise.all(files.map((f) => fsPromise.unlink(join(outDir, f))));
                    } catch (err) {
                        await fsPromise.mkdir(outDir, { recursive: true });
                    }

                    // Then remove non-processed files from the index
                    const filesToClean = twigStoryIndex.getFiles().filter((file) => !processedFiles.has(file));
                    filesToClean.forEach((file) => twigStoryIndex.unregister(file));

                    const fileOperations: Promise<void>[] = [];

                    // Write all stories templates
                    processedFiles.forEach((file) => {
                        const stories = twigStoryIndex.getStories(file);
                        fileOperations.push(
                            ...stories.map((story) =>
                                fsPromise.writeFile(
                                    join(outDir, `${story.id}.html.twig`),
                                    `{{ include('@Stories/${story.hash}.html.twig') }}`
                                )
                            )
                        );
                    });

                    // Write actual story contents named by content hash
                    twigStoryIndex.getTemplates().forEach((template, hash) => {
                        fileOperations.push(fsPromise.writeFile(join(outDir, `${hash}.html.twig`), dedent(template)));
                    });

                    await Promise.all(fileOperations);

                    // Clear process files so next compilation don't track removed files
                    processedFiles.clear();
                }
            });
        },
    };
});

/**
 * Allow to customize the preview iframe.
 */
const PreviewPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const PLUGIN_NAME = 'preview-plugin';
    const { projectDir, additionalWatchPaths, runtimePath } = options;
    return {
        name: PLUGIN_NAME,
        enforce: 'post',
        transformInclude(id) {
            return /storybook-config-entry\.js$/.test(id);
        },
        async transform(code) {
            return dedent`
            import { symfonyPreview } from './symfony-preview.js';

            ${code}

            window.__SYMFONY_PREVIEW__ = symfonyPreview;
            if (import.meta.webpackHot) {
                import.meta.webpackHot.accept('./symfony-preview.js', () => {
                    const iframe = window.top.document.getElementById('storybook-preview-iframe');
                    if (iframe) {
                        iframe.src = iframe.src;
                    }
                });
            }
            `;
        },
        webpack(compiler) {
            // Virtual plugin for preview module
            const v = new VirtualModulesPlugin();
            v.apply(compiler);

            const previewHtmlPath = `${runtimePath}/preview.html`;

            // Populate virtual preview module before compilation in watch mode
            compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
                const previewHtml = await runSymfonyCommand('storybook:generate-preview');
                let currentPreviewHtml = '';
                try {
                    currentPreviewHtml = await fsPromise.readFile(previewHtmlPath, { encoding: 'utf-8' });
                } catch (err) {
                    // Ignore errors
                }

                if (previewHtml != currentPreviewHtml) {
                    // Override current preview file if content changed
                    await fsPromise.writeFile(previewHtmlPath, previewHtml, { encoding: 'utf-8' });
                    currentPreviewHtml = previewHtml;
                }

                // Write preview module
                v.writeModule(
                    './symfony-preview.js',
                    dedent`
                    export const symfonyPreview = {
                        html: \`${currentPreviewHtml}\`,
                    };
                `
                );
            });

            compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
                if ('HtmlWebpackCompiler' == compilation.name) {
                    // Register custom dependencies for iframe.html compilation
                    compilation.fileDependencies.add(previewHtmlPath);

                    // Register additional watch paths for HMR
                    const resolvedWatchPaths = computeAdditionalWatchPaths(additionalWatchPaths, projectDir);
                    compilation.contextDependencies.addAll(resolvedWatchPaths.dirs);
                    compilation.fileDependencies.addAll(resolvedWatchPaths.files);
                }
            });

            compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
                if ('preview' == compilation.name) {
                    // Inject previewHead and previewBody in the compiled iframe.html before it is output
                    HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapPromise(
                        PLUGIN_NAME,
                        async (params) => {
                            const previewHtml = await fsPromise.readFile(previewHtmlPath, { encoding: 'utf-8' });

                            const previewDom = new JSDOM(previewHtml);

                            const previewHead = previewDom.window.document.head;
                            const previewBody = previewDom.window.document.body;

                            params.html = params.html
                                .replace('<!--PREVIEW_HEAD_PLACEHOLDER-->', previewHead.innerHTML)
                                .replace('<!--PREVIEW_BODY_PLACEHOLDER-->', previewBody.innerHTML);
                            return params;
                        }
                    );
                }
            });
        },
    };
});

/**
 * Main Symfony plugin.
 */
export const SymfonyPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const plugins = [
        PreviewPlugin,
        TwigStoriesTemplateGeneratorPlugin,
        TwigStoriesCompilerPlugin,
        TwigTemplateLoaderPlugin,
    ];

    return {
        name: 'symfony-plugin',
        webpack(compiler) {
            // Ensure runtime path exists
            fs.mkdirSync(options.runtimePath, { recursive: true });

            // Compiler types don't match
            // @ts-ignore
            plugins.forEach((plugin) => plugin.webpack(options).apply(compiler));
        },
    };
});
