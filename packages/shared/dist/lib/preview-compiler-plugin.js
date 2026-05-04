import { injectPreviewHtml } from '../chunk-TT62UGG3.js';
import { runSymfonyCommand } from '../chunk-6RI23XSL.js';
import { createUnplugin } from 'unplugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from 'storybook/internal/node-logger';
import { dedent } from 'ts-dedent';

var PLUGIN_NAME = "preview-plugin";
var PreviewCompilerPlugin = createUnplugin(() => {
  return {
    name: PLUGIN_NAME,
    webpack(compiler) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        const webpackCompilation = compilation;
        HtmlWebpackPlugin.getHooks(webpackCompilation).afterTemplateExecution.tapPromise(
          PLUGIN_NAME,
          async (params) => {
            try {
              const previewHtml = await runSymfonyCommand("storybook:generate-preview");
              params.html = injectPreviewHtml(previewHtml, params.html);
              return params;
            } catch (err) {
              logger.error(dedent`
                            Failed to inject Symfony preview template in main iframe.html.
                            ERR: ${err}
                            `);
              throw err;
            }
          }
        );
      });
    }
  };
});

export { PreviewCompilerPlugin };
