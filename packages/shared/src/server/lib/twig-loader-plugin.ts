import { createUnplugin } from 'unplugin';
import { dedent } from 'ts-dedent';
import { logger } from 'storybook/internal/node-logger';
import { extractComponentsFromTemplate } from './extractComponentsFromTemplate';
import { TwigComponentConfiguration } from './symfony';
import { TwigComponentResolver } from './TwigComponentResolver';
import crypto from 'crypto';

const PLUGIN_NAME = 'twig-loader';

export type Options = {
    twigComponentConfiguration: TwigComponentConfiguration;
};

/**
 * Twig template source loader.
 *
 * Generates JS modules to export raw template source and imports required components.
 */
export const TwigLoaderPlugin = createUnplugin<Options>((options) => {
    const { twigComponentConfiguration } = options;
    const resolver = new TwigComponentResolver(twigComponentConfiguration);
    return {
        name: PLUGIN_NAME,
        enforce: 'pre',
        transformInclude: (id) => {
            return /\.html\.twig$/.test(id);
        },
        transform: async (code, id) => {
            const imports: string[] = [];

            let name = id;

            try {
                const components = new Set<string>(extractComponentsFromTemplate(code));

                components.forEach((name) => {
                    imports.push(resolver.resolveFileFromName(name));
                });

                name = resolver.resolveNameFromFile(id);
            } catch (err) {
                logger.warn(dedent`
                Failed to load Twig component metadata from '${id}': ${err}
                `);
            }

            return dedent`
            ${imports.map((file) => `import '${file}';`).join('\n')}
            export default {
                name: \'${name}\',
                hash: \`${crypto.createHash('sha256').update(code).digest('hex')}\`,
            };
           `;
        },
    };
});
