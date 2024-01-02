import { readCsf, StaticStory } from '@storybook/csf-tools';
import { Indexer } from '@storybook/types';
import { TwigTemplate } from './utils';
import crypto from 'crypto';

type TwigTemplateSource = string;
type StoryId = StaticStory['id'];

export class TwigStoriesIndexer {
    private templates: Map<string, TwigTemplateSource> = new Map<string, TwigTemplateSource>
    private storyIndex: Map<StoryId, string> = new Map<StoryId, string>
    private files: Set<string> = new Set<string>();
    register(id: string, component: TwigTemplate, declaringFile: string) {
        const hash = crypto.createHash('sha1').update(component.getSource()).digest('hex');
        if (!this.templates.has(hash)) {
            this.templates.set(hash, component.getSource());
        }
        this.files.add(declaringFile);

        this.storyIndex.set(id, hash);
    }

    getMap() {
        return Object.fromEntries(this.storyIndex);
    }

    getTemplates() {
        return this.templates;
    }

    fileHasTemplates(fileName: string): boolean {
        return this.files.has(fileName);
    }
}

export const twigCsfIndexer: Indexer = {
    test: /(stories|story)\.(m?js|ts)x?$/,
    createIndex: async (fileName, options) => {
        const csf = (await readCsf(fileName, {...options})).parse();

        const twigIndexer = getTwigStoriesIndexer();
        const module = require(fileName);
        csf.indexInputs.forEach((story) => {
            const component = (module[story.exportName]?.component ?? module['default']?.component ?? undefined);
            if (undefined !== component) {
                twigIndexer.register(story.__id, component, fileName);
            }
        })

        return csf.indexInputs;
    },
}

let twigIndexer: TwigStoriesIndexer;
export function getTwigStoriesIndexer() {
    if (twigIndexer !== undefined) {
        return twigIndexer;
    }
    console.log('creating new indexer');
    return twigIndexer = new TwigStoriesIndexer();
}