import { createUnplugin } from 'unplugin';
import { runSymfonyCommand } from './symfony';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from '@storybook/node-logger';
import dedent from 'ts-dedent';
import { injectPreviewHtml } from './injectPreviewHtml';

const PLUGIN_NAME = 'preview-plugin';

/**
 * Compile preview HTML.
 */
export const PreviewCompilerPlugin = createUnplugin(() => {
    return {
        name: PLUGIN_NAME,
        webpack(compiler) {
            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
                // Inject previewHead and previewBody in the compiled iframe.html before it is output
                HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapPromise(
                    PLUGIN_NAME,
                    async (params) => {
                        try {
                            const previewHtml = await runSymfonyCommand('storybook:generate-preview');
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
