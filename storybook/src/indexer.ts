import { readCsf, StaticStory } from '@storybook/csf-tools';
import { Indexer, IndexInput } from '@storybook/types';
import { TwigTemplate } from './utils/twig';
import crypto from 'crypto';
import { logger } from '@storybook/node-logger';
import dedent from 'ts-dedent';

type StoryId = StaticStory['id'];

type TwigStory = {
    id: StoryId;
    name: string;
    template: TwigTemplate;
    hash: string;
};

export class TwigStoryIndex {
    private storiesInFiles = new Map<string, Set<StoryId>>();

    private stories: TwigStory[] = [];

    register(story: IndexInput, component: TwigTemplate, declaringFile: string) {
        const hash = crypto.createHash('sha1').update(component.getSource()).digest('hex');

        const id = story.__id;
        if (id === undefined) {
            throw new Error(dedent`Missing story id.`);
        }

        this.stories.push({
            id,
            name: story.exportName,
            hash,
            template: component,
        });

        const storiesInFile = this.storiesInFiles.get(declaringFile) ?? new Set<StoryId>();
        storiesInFile.add(id);
        this.storiesInFiles.set(declaringFile, storiesInFile);
    }

    unregister(fileName: string) {
        const stories = this.storiesInFiles.get(fileName);

        if (!stories) return;

        this.stories = this.stories.filter((story) => !stories.has(story.id));
        this.storiesInFiles.delete(fileName);
    }

    getFiles() {
        return Array.from(this.storiesInFiles.keys());
    }

    getTemplates() {
        return new Map(this.stories.map((story) => [story.hash, story.template.getSource()]));
    }

    hasStories(fileName: string) {
        return this.storiesInFiles.has(fileName);
    }

    getStories(fileName: string) {
        const ids = this.storiesInFiles.get(fileName);
        return ids ? this.stories.filter((story) => ids.has(story.id)) : [];
    }
}

export const createTwigCsfIndexer = (twigStoryIndex: TwigStoryIndex, pattern: RegExp) => {
    return {
        test: pattern,
        createIndex: async (fileName, options) => {
            const csf = (await readCsf(fileName, { ...options })).parse();

            // Should delete cached module to update template contents if changed
            delete require.cache[fileName];
            /* eslint-disable @typescript-eslint/no-var-requires */
            const module = require(fileName);

            twigStoryIndex.unregister(fileName); // Clear existing stories

            const indexedStories: IndexInput[] = [];
            csf.indexInputs.forEach((story) => {
                try {
                    const template = module[story.exportName]?.template ?? module['default']?.template ?? undefined;

                    if (undefined !== template && story.__id !== undefined) {
                        twigStoryIndex.register(story, template, fileName);
                    }

                    indexedStories.push(story);
                } catch (err) {
                    logger.warn(dedent`
                    Unable to index story "${story.exportName}" in ${fileName}:
                    ${err}
                `);
                }
            });

            return indexedStories;
        },
    } as Indexer;
};
