import { createUnplugin } from 'unplugin';
import { dedent } from 'ts-dedent';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { runSymfonyCommand } from './symfony';
import { computeAdditionalWatchPaths } from './computeAdditionalWatchPaths';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from 'storybook/internal/node-logger';
import { injectPreviewHtml } from './injectPreviewHtml';

const PLUGIN_NAME = 'dev-preview-plugin';

const escapeTemplateLiteral = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

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
            let registeredAdditionalWatchPaths = false;

            // Compile preview before each compilation in watch mode
            compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
                registeredAdditionalWatchPaths = false;
                previewHtml = await runSymfonyCommand('storybook:generate-preview');

                // Write preview module
                v.writeModule(
                    './symfony-preview.js',
                    dedent`
                    export const symfonyPreview = {
                        html: \`${escapeTemplateLiteral(previewHtml)}\`,
                    };`
                );
            });

            compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
                const webpackCompilation = compilation as any;

                // HtmlWebpackPlugin creates this child compilation for iframe.html. Registering
                // dependencies there makes Webpack's watch mode notice Symfony-side preview inputs.
                if ('HtmlWebpackCompiler' == webpackCompilation.name) {
                    const resolvedWatchPaths = computeAdditionalWatchPaths(additionalWatchPaths, projectDir);
                    webpackCompilation.contextDependencies.addAll(resolvedWatchPaths.dirs);
                    webpackCompilation.fileDependencies.addAll(resolvedWatchPaths.files);
                    registeredAdditionalWatchPaths = true;
                }
            });

            compiler.hooks.done.tap(PLUGIN_NAME, () => {
                if (additionalWatchPaths.length > 0 && !registeredAdditionalWatchPaths) {
                    logger.warn(dedent`
                    Additional watch paths were not registered because HtmlWebpackPlugin's child compilation was not found.
                    `);
                }
            });

            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
                const webpackCompilation = compilation as any;

                // Inject previewHead and previewBody in the compiled iframe.html before it is output
                HtmlWebpackPlugin.getHooks(webpackCompilation).afterTemplateExecution.tapPromise(
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
