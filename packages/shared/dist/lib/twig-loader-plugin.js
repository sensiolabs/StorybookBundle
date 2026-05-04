import { TwigComponentResolver } from '../chunk-6633BDDN.js';
import { extractComponentsFromTemplate } from '../chunk-3MBSNNL4.js';
import { createUnplugin } from 'unplugin';
import { dedent } from 'ts-dedent';
import { logger } from 'storybook/internal/node-logger';
import crypto from 'crypto';

var PLUGIN_NAME = "twig-loader";
var TwigLoaderPlugin = createUnplugin((options) => {
  const { twigComponentConfiguration } = options;
  const resolver = new TwigComponentResolver(twigComponentConfiguration);
  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    transformInclude: (id) => {
      return /\.html\.twig$/.test(id);
    },
    transform: async (code, id) => {
      const imports = [];
      let name = id;
      try {
        const components = new Set(extractComponentsFromTemplate(code));
        components.forEach((name2) => {
          imports.push(resolver.resolveFileFromName(name2));
        });
        name = resolver.resolveNameFromFile(id);
      } catch (err) {
        logger.warn(dedent`
                Failed to load Twig component metadata from '${id}': ${err}
                `);
      }
      return dedent`
            ${imports.map((file) => `import '${file}';`).join("\n")}
            export default {
                name: \'${name}\',
                hash: \`${crypto.createHash("sha256").update(code).digest("hex")}\`,
            };
           `;
    }
  };
});

export { TwigLoaderPlugin };
