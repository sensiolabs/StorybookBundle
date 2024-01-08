import { readCsf, StaticStory } from '@storybook/csf-tools';
import { Indexer } from '@storybook/types';
import { TwigTemplate } from './utils';
import crypto from 'crypto';

type TwigTemplateSource = string;
type StoryId = StaticStory['id'];

class TwigStoriesIndexer {
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

export const twigCsfIndexer: Indexer = {
    test: /(stories|story)\.(m?js|ts)x?$/,
    createIndex: async (fileName, options) => {
        const csf = (await readCsf(fileName, { ...options })).parse();

        const twigIndexer = getTwigStoriesIndexer();

        // Should delete cached module to update template contents if changed
        delete require.cache[fileName];
        /* eslint-disable @typescript-eslint/no-var-requires */
        const module = require(fileName);

        csf.indexInputs.forEach((story) => {
            const template = module[story.exportName]?.template ?? module['default']?.template ?? undefined;
            if (undefined !== template) {
                twigIndexer.register(story.__id, template, fileName);
            }
        });

        return csf.indexInputs;
    },
};

let twigIndexer: TwigStoriesIndexer;
export function getTwigStoriesIndexer() {
    if (twigIndexer !== undefined) {
        return twigIndexer;
    }

    return twigIndexer = new TwigStoriesIndexer();
}
