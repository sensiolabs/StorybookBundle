import { createUnplugin } from 'unplugin';
import dedent from 'ts-dedent';
import { logger } from '@storybook/node-logger';
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

            try {
                const components = new Set<string>(extractComponentsFromTemplate(code));

                components.forEach((name) => {
                    imports.push(resolver.resolveFileFromName(name));
                });
            } catch (err) {
                logger.warn(dedent`
                Failed to parse template in '${id}': ${err}
                `);
            }

            const name = resolver.resolveNameFromFile(id);

            return dedent`
            ${imports.map((file) => `import '${file}';`).join('\n')}            
            export default { 
                name: \'${name}\',
                hash: \`${crypto.createHash('sha1').update(code).digest('hex')}\`,
            }; 
           `;
        },
    };
});
