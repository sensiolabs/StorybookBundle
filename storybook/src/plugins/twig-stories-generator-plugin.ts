import { createUnplugin } from 'unplugin';
import { TwigStoryIndex } from '../indexer';
import { join } from 'path';
import * as fs from 'fs/promises';
import dedent from 'ts-dedent';

const PLUGIN_NAME = 'twig-stories-template-generator';

export type Options = {
    storiesPath: string;
    twigStoryIndex: TwigStoryIndex;
};

/**
 * Plugin that hooks on compilation events to clean and create templates used to render actual stories.
 */
export const TwigStoriesGeneratorPlugin = createUnplugin<Options>((options) => {
    const { storiesPath, twigStoryIndex } = options;

    const processedFiles = new Set<string>();

    return {
        name: PLUGIN_NAME,
        async buildStart() {
            try {
                const files = await fs.readdir(storiesPath);
                await Promise.all(files.map((f) => fs.unlink(join(storiesPath, f))));
            } catch (err) {
                await fs.mkdir(storiesPath, { recursive: true });
            }
        },
        async buildEnd() {
            const filesToClean = twigStoryIndex.getFiles().filter((file) => !processedFiles.has(file));

            filesToClean.forEach((file) => twigStoryIndex.unregister(file));

            const fileOperations: Promise<void>[] = [];

            // Write all stories templates
            processedFiles.forEach((file) => {
                const stories = twigStoryIndex.getStories(file);
                fileOperations.push(
                    ...stories.map((story) =>
                        fs.writeFile(
                            join(storiesPath, `${story.id}.html.twig`),
                            `{{ include('@Stories/${story.hash}.html.twig') }}`
                        )
                    )
                );
            });

            // Write actual story contents named by content hash
            twigStoryIndex.getTemplates().forEach((template, hash) => {
                fileOperations.push(fs.writeFile(join(storiesPath, `${hash}.html.twig`), dedent(template)));
            });

            await Promise.all(fileOperations);

            // Clear process files so next compilation don't track removed files
            processedFiles.clear();
        },
        webpack(compiler) {
            // Each time a story module is resolved, track it, so we can dump templates after compilation
            compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
                factory.hooks.afterResolve.tap(PLUGIN_NAME, (resolveData) => {
                    const fileName = resolveData.createData?.userRequest;
                    if (fileName && twigStoryIndex.hasStories(fileName)) {
                        processedFiles.add(fileName);
                    }
                });
            });
        },
    };
});
