import { WebRenderer, ArgsStoryFn, Args } from 'storybook/internal/types';

declare class TwigTemplate {
    private readonly source;
    constructor(source: string);
    getSource(): string;
    toString(): string;
}
declare function twig(source: TemplateStringsArray | string, ...values: any[]): TwigTemplate;

type StoryFnSymfonyReturnType = {
    /**
     * The Twig template to render.
     */
    template: TwigTemplate;
    /**
     * A function that returns args for the story.
     * May be used to pre-process args using loaders.
     */
    setup?: () => Args;
    /**
     * A list of components used in this story.
     * Providing components here enables HMR in dev.
     * TODO: implement HMR using this field
     */
    components?: TwigComponent[];
};
type TwigComponent = {
    hash: string;
    name: string;
};
interface SymfonyRenderer extends WebRenderer {
    component: TwigComponent | TwigTemplate | string | ArgsStoryFn<SymfonyRenderer> | undefined;
    storyResult: StoryFnSymfonyReturnType;
}

export { type SymfonyRenderer as S, twig as t };
