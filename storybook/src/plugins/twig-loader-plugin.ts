import { createUnplugin } from 'unplugin';
import { twig } from '../utils/twig';
import dedent from 'ts-dedent';
import { logger } from '@storybook/node-logger';

const PLUGIN_NAME = 'twig-loader';

export type Options = {
    resolver: (name: string) => string;
};

/**
 * Twig template source loader.
 *
 * Generates JS modules to export raw template source and imports required components.
 */
export const TwigLoaderPlugin = createUnplugin<Options>((options) => {
    const { resolver } = options;
    return {
        name: PLUGIN_NAME,
        enforce: 'pre',
        transformInclude: (id) => {
            return /\.html\.twig$/.test(id);
        },
        transform: async (code, id) => {
            const imports: string[] = [];

            try {
                const templateSource = twig(code);
                const components = new Set<string>(templateSource.getComponents());

                components.forEach((name) => {
                    imports.push(resolver(name));
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
