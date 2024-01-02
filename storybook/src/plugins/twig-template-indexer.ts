import { createUnplugin } from 'unplugin';
import { SymfonyOptions } from "../types";
import * as fs from "fs/promises";
import { join } from 'path';
import { getTwigStoriesIndexer } from '../indexer';

async function cleanStories(dir: string)
{
    try {
        await fs.access(dir, fs.constants.F_OK);
        const files = await fs.readdir(dir);
        await Promise.all(files.map(f => fs.unlink(join(dir, f))));
    } catch(err) {
        await fs.mkdir(dir, {recursive: true});
    }
}

async function writeStoriesMap(dir: string) {
    const storyIndex = getTwigStoriesIndexer();

    const storiesMap = storyIndex.getMap();

    await fs.writeFile(join(dir, 'storiesMap.json'), JSON.stringify(storiesMap), {encoding: 'utf-8'});

    return Array.from(storyIndex.getTemplates(), ([hash, source]) => fs.writeFile(join(dir, `${hash}.html.twig`), source));
}


export const unplugin = createUnplugin<SymfonyOptions>((options) => {
    const outDir = join(options.runtimePath, '/stories');

    return {
        name: 'twig-template-indexer',
        buildStart: async () => {
            await cleanStories(outDir);
        },
        buildEnd: async () => {
            await writeStoriesMap(outDir);
        },
    };
});

export const { esbuild } = unplugin;
export const { webpack } = unplugin;
export const { rollup } = unplugin;
export const { vite } = unplugin;
