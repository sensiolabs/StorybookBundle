import { createUnplugin } from 'unplugin';
import { TwigStoryIndex } from '../indexer';
import dedent from 'ts-dedent';
import { logger } from '@storybook/node-logger';

const PLUGIN_NAME = 'twig-stories-compiler';

export type Options = {
    twigStoryIndex: TwigStoryIndex;
    resolver: (name: string) => string;
};

/**
 * Post compiler to import component templates used in the stories file.
 *
 * This enables HMR for component templates.
 */
export const TwigStoriesDependenciesPlugin = createUnplugin<Options>((options) => {
    const { twigStoryIndex, resolver } = options;

    return {
        name: PLUGIN_NAME,
        enforce: 'post',
        transformInclude: (id) => {
            return twigStoryIndex.hasStories(id);
        },
        transform: async (code, id) => {
            // Get all components used in this story
            const components = twigStoryIndex.getStories(id).reduce((acc, twigStory) => {
                twigStory.template.getComponents().forEach((component) => acc.add(component));
                return acc;
            }, new Set<string>());

            const imports: string[] = [];

            components.forEach((name) => {
                try {
                    imports.push(resolver(name));
                } catch (err) {
                    logger.warn(dedent`
                    Failed to resolve Twig component: ${name}:
                    ${err}
                    `)
                }
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
