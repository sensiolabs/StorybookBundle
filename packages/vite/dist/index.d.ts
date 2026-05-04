import { WebRenderer, ArgsStoryFn, Args, StrictArgs, DecoratorFunction, LoaderFunction, ComponentAnnotations, ProjectAnnotations, StoryContext as StoryContext$1, AnnotatedStoryFn, StoryAnnotations, RenderContext, StorybookConfig as StorybookConfig$1 } from 'storybook/internal/types';
export { ArgTypes, Args, Parameters, StrictArgs } from 'storybook/internal/types';
import { UserConfig } from 'vite';

declare global {
    interface Window {
        STORYBOOK_ENV: 'symfony';
    }
}

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

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
type Meta<TArgs = Args> = ComponentAnnotations<SymfonyRenderer, TArgs>;
/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
type StoryFn<TArgs = Args> = AnnotatedStoryFn<SymfonyRenderer, TArgs>;
/**
 * Story object that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
type StoryObj<TArgs = Args> = StoryAnnotations<SymfonyRenderer, TArgs>;

type Decorator<TArgs = StrictArgs> = DecoratorFunction<SymfonyRenderer, TArgs>;
type Loader<TArgs = StrictArgs> = LoaderFunction<SymfonyRenderer, TArgs>;
type StoryContext<TArgs = StrictArgs> = StoryContext$1<SymfonyRenderer, TArgs>;
type Preview = ProjectAnnotations<SymfonyRenderer>;

declare const render: ArgsStoryFn<SymfonyRenderer>;
declare function renderToCanvas({ id, showMain, storyFn, storyContext, storyContext: { parameters, args, argTypes }, }: RenderContext<SymfonyRenderer>, canvasElement: SymfonyRenderer['canvasElement']): Promise<void>;

type FrameworkName = '@sensiolabs/storybook-symfony-vite';
type ProxyPaths = string[] | string;
type SymfonyOptions = {
    /**
     * Symfony server URL.
     */
    server?: string;
    /**
     * Paths to proxy to the Symfony server. This is useful to resolve assets (i.e. with '/assets').
     */
    proxyPaths?: ProxyPaths;
    /**
     * Additional paths to watch during compilation.
     */
    additionalWatchPaths?: string[];
};
type FrameworkOptions = {
    builder?: Record<string, unknown>;
    symfony: SymfonyOptions;
};
type StorybookConfigFramework = {
    framework: FrameworkName | {
        name: FrameworkName;
        options: FrameworkOptions;
    };
    viteFinal?: (config: UserConfig, options: Record<string, unknown>) => UserConfig | Promise<UserConfig>;
};
/**
 * The interface for Storybook configuration in `main.ts` files.
 */
type StorybookConfig = Omit<StorybookConfig$1, keyof StorybookConfigFramework> & StorybookConfigFramework;

declare const parameters: {
    renderer: "symfony";
    symfony: {};
};

export { type Decorator, type FrameworkOptions, type Loader, type Meta, type Preview, type StoryContext, type StoryFn, type StoryObj, type StorybookConfig, type SymfonyOptions, type SymfonyRenderer, parameters, render, renderToCanvas, twig };
