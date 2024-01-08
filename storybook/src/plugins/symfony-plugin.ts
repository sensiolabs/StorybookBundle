import { createUnplugin } from 'unplugin';
import { SymfonyOptions } from '../types';
import { getTwigStoriesIndexer } from '../indexer';
import { resolveTwigComponentFile, runSymfonyCommand, TwigComponentConfiguration } from '../utils/symfony';
import dedent from 'ts-dedent';
import { twig } from '../utils';
import { join } from 'path';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import VirtualModulesPlugin from 'webpack-virtual-modules';

type InternalSymfonyOptions = {
    projectDir: string,
    twigComponent: TwigComponentConfiguration
}

export type FinalSymfonyOptions = SymfonyOptions & InternalSymfonyOptions;

/**
 * Post compiler to import component templates used in the stories file.
 *
 * This enables HMR for component templates.
 */
const TwigStoriesCompilerPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const twigStoriesIndexer = getTwigStoriesIndexer();

    return {
        name: 'twig-stories-compiler',
        enforce: "post",
        transformInclude: (id)=> {
            return /\.stories\.[tj]s?$/.test(id) && twigStoriesIndexer.fileHasTemplates(id);
        },
        transform: async (code, id) => {
            const components = new Set<string>(twigStoriesIndexer.getComponentsInFile(id));

            let imports: string[] = [];
            components.forEach((v) => {
                imports.push(resolveTwigComponentFile(v, options.twigComponent));
            });

            return dedent`
            ${code}
            
            ; export const __twigTemplates = [
                ${imports.map(template => `import(
                    '${template}'
                )`)}
            ];
          `;
        }
    };
});

/**
 * Twig template source loader.
 *
 * Generates JS modules to export raw template source and imports required components.
 */
const TwigTemplateSourceLoader = createUnplugin<FinalSymfonyOptions>((options) => {
    return {
        name: 'twig-loader',
        enforce: "pre",
        transformInclude: (id)=> {
            return /\.html\.twig$/.test(id);
        },
        transform: async (code, _) => {
            const templateSource = twig`${code}`;
            const components = new Set<string>(templateSource.getComponents());

            let imports: string[] = [];

            components.forEach((v) => {
                imports.push(resolveTwigComponentFile(v, options.twigComponent));
            });

            return dedent`            
            ${imports.map(templateFile => `import '${templateFile}';`).join('\n')}
            
            const source = \`${code}\`;
            
            export default { source }; 
          `;
        }
    };
});

/**
 * Plugin that hooks on compilation events to clean and create templates used to render actual stories.
 *
 * TODO: This should be done elsewhere, currently it's ran for each build target.
 */
const TwigStoriesTemplateGeneratorPlugin = createUnplugin<SymfonyOptions>((options) => {
    const outDir = join(options.runtimePath, '/stories');
    async function cleanRuntimeDir(dir: string)
    {
        try {
            await fs.access(dir, fs.constants.F_OK);
            const files = await fs.readdir(dir);
            await Promise.all(files.map(f => fs.unlink(join(dir, f))));
        } catch(err) {
            await fs.mkdir(dir, {recursive: true});
        }
    }

    async function writeStories(dir: string) {
        const storyIndex = getTwigStoriesIndexer();
        const fileOperations = [];

        // Write story templates
        const storiesMap = storyIndex.getMap();
        for (let storyId in storiesMap) {
            const storyPath = join(dir, `${storyId}.html.twig`);
            fileOperations.push(fs.writeFile(storyPath, dedent`
                {{ include('@Stories/${storiesMap[storyId]}.html.twig') }}
            `));
        }

        // Write actual story contents named by content hash
        const templates = storyIndex.getTemplates();
        templates.forEach((source, hash) => {
            fileOperations.push(fs.writeFile(join(dir, `${hash}.html.twig`), dedent(templates.get(hash))));
        })

        return Promise.all(fileOperations);
    }

    return {
        name: 'twig-stories-template-generator',
        buildStart: async () => {
            await cleanRuntimeDir(outDir);
        },
        buildEnd: async () => {
            await writeStories(outDir);
        },
    };
});

const AssetMapperPlugin = createUnplugin((options) => {
    const PLUGIN_NAME = 'asset-mapper';
    return {
        name: PLUGIN_NAME,
        webpack(compiler) {
            const importMapFilename = 'importmap.js';
            const importMapPath = path.resolve(path.join(process.cwd(), importMapFilename));

            // Register virtual module plugin
            const virtualModules = new VirtualModulesPlugin();
            virtualModules.apply(compiler);

            // Write importmap module after compilation
            compiler.hooks.beforeCompile.tapAsync(PLUGIN_NAME, async (params, cb) => {
                try {
                    const content = await runSymfonyCommand('storybook:dump-importmap');
                    virtualModules.writeModule(importMapPath, content);
                    cb();
                } catch (err) {
                    cb(err);
                }
            });
        }
    }
});


/**
 * Main Symfony plugin.
 */
export const SymfonyPlugin = createUnplugin<FinalSymfonyOptions>((options) => {
    const plugins = [
        TwigStoriesTemplateGeneratorPlugin,
        TwigStoriesCompilerPlugin,
        TwigTemplateSourceLoader,
        options.useAssetMapper ? AssetMapperPlugin : null
    ].filter(Boolean)

    return {
       name: 'symfony-plugin',
       webpack(compiler) {
           plugins.forEach(plugin => plugin.webpack(options).apply(compiler));
       }
   };
});
