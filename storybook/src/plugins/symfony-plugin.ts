import { createUnplugin } from 'unplugin';
import { SymfonyOptions } from '../types';
import { getTwigStoriesIndexer, STORIES_REGEX } from '../indexer';
import { resolveTwigComponentFile, runSymfonyCommand, TwigComponentConfiguration } from '../utils/symfony';
import dedent from 'ts-dedent';
import { twig } from '../utils';
import { join } from 'path';
import fs from 'node:fs';
import * as fsPromise from 'fs/promises';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { JSDOM } from 'jsdom';
import isGlob from 'is-glob';
import { glob } from 'glob';
import { logger } from '@storybook/node-logger';

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
    const twigStoriesIndexer = getTwigStoriesIndexer();

    return {
        name: 'twig-stories-compiler',
        enforce: 'post',
        transformInclude: (id) => {
            return STORIES_REGEX.test(id) && twigStoriesIndexer.fileHasTemplates(id);
        },
        transform: async (code, id) => {
            const components = new Set<string>(twigStoriesIndexer.getComponentsInFile(id));

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
 *
 * TODO: This should be done elsewhere, currently it's run for each build target.
 */
const TwigStoriesTemplateGeneratorPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const outDir = join(options.runtimePath, '/stories');
    async function cleanRuntimeDir(dir: string) {
        try {
            await fsPromise.access(dir, fs.constants.F_OK);
            const files = await fsPromise.readdir(dir);
            await Promise.all(files.map((f) => fsPromise.unlink(join(dir, f))));
        } catch (err) {
            await fsPromise.mkdir(dir, { recursive: true });
        }
    }

    async function writeStories(dir: string) {
        const storyIndex = getTwigStoriesIndexer();
        const fileOperations = [];

        // Write story templates
        const storiesMap = storyIndex.getMap();
        for (const storyId in storiesMap) {
            const storyPath = join(dir, `${storyId}.html.twig`);
            fileOperations.push(
                fsPromise.writeFile(storyPath, `{{ include('@Stories/${storiesMap[storyId]}.html.twig') }}`)
            );
        }

        // Write actual story contents named by content hash
        const templates = storyIndex.getTemplates();
        templates.forEach((source, hash) => {
            fileOperations.push(fsPromise.writeFile(join(dir, `${hash}.html.twig`), dedent(source)));
        });

        return Promise.all(fileOperations);
    }

    return {
        name: 'twig-stories-template-generator',
        buildStart: async () => {
            await cleanRuntimeDir(outDir);
        },
        buildEnd: async () => {
            await writeStories(outDir);
        },
    };
});

/**
 * Allow to customize the preview iframe.
 */
const PreviewPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const PLUGIN_NAME = 'preview-plugin';
    const { projectDir, additionalWatchPaths } = options;
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
            // Virtual plugin
            const v = new VirtualModulesPlugin();
            v.apply(compiler);

            let previewHtml = '';

            // Populate virtual iframe module before compilation
            // TODO restrict this hook to the right compilation
            compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
                previewHtml = await runSymfonyCommand('storybook:generate-preview');

                v.writeModule(
                    './symfony-preview.js',
                    dedent`
                    export const symfonyPreview = {
                        html: \`${previewHtml}\`,
                    };
                `
                );
            });

            // TODO restrict this hook to the right compilation
            compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
                // Register additional watch paths for HMR
                additionalWatchPaths
                    .map((v) => join(projectDir, v))
                    .forEach((watchPath) => {
                        if (isGlob(watchPath)) {
                            glob.sync(watchPath, {
                                dot: true,
                                absolute: true,
                            }).forEach((watchPath) => {
                                compilation.fileDependencies.add(watchPath);
                            });
                        } else if (fs.existsSync(watchPath)) {
                            const stats = fs.lstatSync(watchPath);
                            if (stats.isDirectory()) {
                                compilation.contextDependencies.add(watchPath);
                            } else {
                                compilation.fileDependencies.add(watchPath);
                            }
                        } else {
                            logger.warn(dedent`
                        Ignoring additional watch path '${watchPath}': path doesn't exists.
                        `);
                        }
                    });

                // Inject previewHead and previewBody in the iframe
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(PLUGIN_NAME, (params) => {
                    const previewDom = new JSDOM(previewHtml);

                    const previewHead = previewDom.window.document.head;
                    const previewBody = previewDom.window.document.body;

                    params.html = params.html
                        .replace('<!--PREVIEW_HEAD_PLACEHOLDER-->', previewHead.innerHTML)
                        .replace('<!--PREVIEW_BODY_PLACEHOLDER-->', previewBody.innerHTML);
                    return params;
                });
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
    ].filter(Boolean);

    return {
        name: 'symfony-plugin',
        webpack(compiler) {
            // Compiler types don't match
            // @ts-ignore
            plugins.forEach((plugin) => plugin?.webpack(options).apply(compiler));
        },
    };
});
