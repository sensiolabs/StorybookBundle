import type { StoryContext as StoryContextBase, WebRenderer } from '@storybook/types';
import { TwigTemplate } from '../lib/twig';

export type { RenderContext } from '@storybook/types';

export type StoryFnSymfonyReturnType = {
    template: TwigTemplate;
};

export type TwigComponent = {
    source: string;
};

export type StoryContext = StoryContextBase<SymfonyRenderer>;

export interface SymfonyRenderer extends WebRenderer {
    component: TwigComponent | undefined;
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
