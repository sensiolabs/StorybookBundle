import { readCsf, StaticStory } from '@storybook/csf-tools';
import { Indexer, IndexInput } from '@storybook/types';
import { TwigTemplate } from './utils';
import crypto from 'crypto';
import dedent from 'ts-dedent';
import { logger } from '@storybook/node-logger';

type TwigTemplateSource = string;
type StoryId = StaticStory['id'];

class TwigStoryIndex {
    private templates: Map<string, TwigTemplateSource> = new Map<string, TwigTemplateSource>();
    private storyIndex: Map<StoryId, string> = new Map<StoryId, string>();
    private componentsInFiles = new Map<string, string[]>();

    register(id: StoryId, component: TwigTemplate, declaringFile: string) {
        const hash = crypto.createHash('sha1').update(component.getSource()).digest('hex');
        if (!this.templates.has(hash)) {
            this.templates.set(hash, component.getSource());
        }

        if (!this.componentsInFiles.has(declaringFile)) {
            this.componentsInFiles.set(declaringFile, []);
        }

        // @ts-ignore
        this.componentsInFiles.get(declaringFile).push(...component.getComponents());

        this.storyIndex.set(id, hash);
    }

    getMap() {
        return Object.fromEntries(this.storyIndex);
    }

    getTemplates() {
        return this.templates;
    }

    fileHasTemplates(fileName: string): boolean {
        return this.componentsInFiles.has(fileName);
    }

    getComponentsInFile(fileName: string) {
        return this.componentsInFiles.get(fileName);
    }
}

let twigIndexer: TwigStoryIndex;
export function getTwigStoriesIndexer() {
    if (twigIndexer !== undefined) {
        return twigIndexer;
    }

    return (twigIndexer = new TwigStoryIndex());
}

export const STORIES_REGEX = /(stories|story)\.(m?js|ts)x?$/;

export const createTwigCsfIndexer = (twigStoryIndex: TwigStoryIndex) => {
    return {
        test: STORIES_REGEX,
        createIndex: async (fileName, options) => {
            const csf = (await readCsf(fileName, { ...options })).parse();

            // Should delete cached module to update template contents if changed
            delete require.cache[fileName];
            /* eslint-disable @typescript-eslint/no-var-requires */
            const module = require(fileName);

            const indexedStories: IndexInput[] = [];

            csf.indexInputs.forEach((story) => {
                try {
                    const template = module[story.exportName]?.template ?? module['default']?.template ?? undefined;

                    if (undefined !== template && story.__id !== undefined) {
                        twigStoryIndex.register(story.__id, template, fileName);
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
