import { computeAdditionalWatchPaths } from '../chunk-4BRBWQN5.js';
import { injectPreviewHtml } from '../chunk-TT62UGG3.js';
import { runSymfonyCommand } from '../chunk-6RI23XSL.js';
import { createUnplugin } from 'unplugin';
import { dedent } from 'ts-dedent';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { logger } from 'storybook/internal/node-logger';

var PLUGIN_NAME = "dev-preview-plugin";
var escapeTemplateLiteral = (value) => value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
var DevPreviewCompilerPlugin = createUnplugin((options) => {
  const { projectDir, additionalWatchPaths } = options;
  return {
    name: PLUGIN_NAME,
    enforce: "post",
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
      const v = new VirtualModulesPlugin();
      v.apply(compiler);
      let previewHtml = "";
      let registeredAdditionalWatchPaths = false;
      compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
        registeredAdditionalWatchPaths = false;
        previewHtml = await runSymfonyCommand("storybook:generate-preview");
        v.writeModule(
          "./symfony-preview.js",
          dedent`
                    export const symfonyPreview = {
                        html: \`${escapeTemplateLiteral(previewHtml)}\`,
                    };`
        );
      });
      compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
        const webpackCompilation = compilation;
        if ("HtmlWebpackCompiler" == webpackCompilation.name) {
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
        const webpackCompilation = compilation;
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
    }
  };
});

export { DevPreviewCompilerPlugin };
