import type { ArgsStoryFn, StoryContext as StoryContextBase, WebRenderer } from '@storybook/types';
import { TwigTemplate } from '../lib/twig';

export type { RenderContext } from '@storybook/types';

export type StoryFnSymfonyReturnType = {
    /**
     * The Twig template to render.
     */
    template: TwigTemplate;
    /**
     * A function that returns args for the story.
     * May be used to pre-process args using loaders.
     */
    setup?: () => any;
    /**
     * A list of components used in this story.
     * Providing components here enables HMR in dev.
     */
    components?: TwigComponent[];
};

export type TwigComponent = {
    hash: string;
    name: string;
};

export type StoryContext = StoryContextBase<SymfonyRenderer>;

export interface SymfonyRenderer extends WebRenderer {
    component: TwigComponent | TwigTemplate | string | ArgsStoryFn<SymfonyRenderer> | undefined;
    storyResult: StoryFnSymfonyReturnType;
}

export type FetchStoryHtmlType = (
    url: string,
    id: string,
    params: any,
    context: StoryContext,
    template: TwigTemplate
) => Promise<string | Node>;

export interface ShowErrorArgs {
    title: string;
    description: string;
}
