import type { ArgsStoryFn, StoryContext as StoryContextBase, WebRenderer } from '@storybook/types';
import { TwigTemplate } from '../lib/twig';

export type { RenderContext } from '@storybook/types';

export type StoryFnSymfonyReturnType = {
    template: TwigTemplate;
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
