import { createUnplugin } from 'unplugin';
import dedent from 'ts-dedent';
import { SymfonyOptions } from '../types';
import { getTwigStoriesIndexer} from '../indexer';

export const STORIES_REGEX = /\.stories\.[tj]s?$/;

export const unplugin = createUnplugin<SymfonyOptions>((options) => {
    // TODO get components Twig path from options

    const twigStoriesIndexer = getTwigStoriesIndexer();

    return {
        name: 'storybook-addon-symfony',
        enforce: "post",
        transformInclude: (id)=> {
            return STORIES_REGEX.test(id) && twigStoriesIndexer.fileHasTemplates(id);
        },
        transform: async (code, id) => {
            delete require.cache[id];
            const m = require(id);

            const imports: string[] = m['default']?.imports ?? [];

            return dedent`
            ${code}
            
            ; export const __twigTemplates = [
                ${imports.map(template => `import(
                    /* webpackInclude: /\\/templates\\/components\\/.*\\.html\\.twig$/ */
                    '${template}'
                )`)}
            ];
          `;
        }
    };
});

export const { esbuild } = unplugin;
export const { webpack } = unplugin;
export const { rollup } = unplugin;
export const { vite } = unplugin;
