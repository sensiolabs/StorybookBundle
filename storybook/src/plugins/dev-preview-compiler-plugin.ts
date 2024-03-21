import { createUnplugin } from 'unplugin';
import dedent from 'ts-dedent';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { runSymfonyCommand } from '../utils/symfony';
import { computeAdditionalWatchPaths } from '../utils/computeAdditionalWatchPaths';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from '@storybook/node-logger';
import { injectPreviewHtml } from '../utils/injectPreviewHtml';

const PLUGIN_NAME = 'dev-preview-plugin';

export type Options = {
    projectDir: string;
    additionalWatchPaths: string[];
};

/**
 * Compile preview HTML for dev with HMR .
 */
export const DevPreviewCompilerPlugin = createUnplugin<Options>((options) => {
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
            // Virtual plugin for preview module
            const v = new VirtualModulesPlugin();
            v.apply(compiler);

            let previewHtml = '';

            // Compile preview before each compilation in watch mode
            compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
                previewHtml = await runSymfonyCommand('storybook:generate-preview');

                // Write preview module
                v.writeModule(
                    './symfony-preview.js',
                    dedent`
                    export const symfonyPreview = {
                        html: \`${previewHtml}\`,
                    };`
                );
            });

            compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
                if ('HtmlWebpackCompiler' == compilation.name) {
                    // Register additional watch paths for HMR
                    const resolvedWatchPaths = computeAdditionalWatchPaths(additionalWatchPaths, projectDir);
                    compilation.contextDependencies.addAll(resolvedWatchPaths.dirs);
                    compilation.fileDependencies.addAll(resolvedWatchPaths.files);
                }
            });

            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
                // Inject previewHead and previewBody in the compiled iframe.html before it is output
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapPromise(
                    PLUGIN_NAME,
                    async (params) => {
                        try {
                            params.html = injectPreviewHtml(previewHtml, params.html);
                            return params;
                        } catch (err) {
                            logger.error(dedent`
                            Failed to inject Symfony preview template in main iframe.html.
                            ERR: ${err}
                            `);
                            return params;
                        }
                    }
                );
            });
        },
    };
});
