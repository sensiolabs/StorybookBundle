import { StaticStory } from '@storybook/csf-tools';
import { IndexInput } from '@storybook/types';
import { TwigTemplate } from '../../lib/twig';
import crypto from 'crypto';
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
