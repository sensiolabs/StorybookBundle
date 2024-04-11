import { StorybookConfig as StorybookConfig$2, Options, TypescriptOptions as TypescriptOptions$1, WebRenderer, ArgsStoryFn, Args, ComponentAnnotations, AnnotatedStoryFn, StoryAnnotations, StrictArgs, DecoratorFunction, LoaderFunction, StoryContext as StoryContext$1, ProjectAnnotations } from '@storybook/types';
export { ArgTypes, Args, Parameters, StrictArgs } from '@storybook/types';
import { BuilderOptions, StorybookConfigWebpack, TypescriptOptions } from '@storybook/builder-webpack5';

type RulesConfig = any;
type ModuleConfig = {
    rules?: RulesConfig[];
};
type ResolveConfig = {
    extensions?: string[];
    mainFields?: (string | string[])[] | undefined;
    alias?: any;
};
interface WebpackConfiguration {
    plugins?: any[];
    module?: ModuleConfig;
    resolve?: ResolveConfig;
    optimization?: any;
    devtool?: false | string;
}
type StorybookConfig$1<TWebpackConfiguration = WebpackConfiguration> = StorybookConfig$2 & {
    /**
     * Modify or return a custom Webpack config after the Storybook's default configuration
     * has run (mostly used by addons).
     */
    webpack?: (config: TWebpackConfiguration, options: Options) => TWebpackConfiguration | Promise<TWebpackConfiguration>;
    /**
     * Modify or return a custom Webpack config after every addon has run.
     */
    webpackFinal?: (config: TWebpackConfiguration, options: Options) => TWebpackConfiguration | Promise<TWebpackConfiguration>;
};

type FrameworkName = '@sensiolabs/storybook-symfony-webpack5';
type BuilderName = '@storybook/builder-webpack5';
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
    builder?: BuilderOptions;
    symfony: SymfonyOptions;
};
type StorybookConfigFramework = {
    framework: FrameworkName | {
        name: FrameworkName;
        options: FrameworkOptions;
    };
    core?: StorybookConfig$1['core'] & {
        builder?: BuilderName | {
            name: BuilderName;
            options: BuilderOptions;
        };
    };
    typescript?: Partial<TypescriptOptions & TypescriptOptions$1> & StorybookConfig$1['typescript'];
};
/**
 * The interface for Storybook configuration in `main.ts` files.
 */
type StorybookConfig = Omit<StorybookConfig$1, keyof StorybookConfigWebpack | keyof StorybookConfigFramework> & StorybookConfigWebpack & StorybookConfigFramework;

declare class TwigTemplate {
    private readonly source;
    constructor(source: string);
    getSource(): string;
    toString(): string;
}
declare function twig(source: TemplateStringsArray | string, ...values: any[]): TwigTemplate;

type StoryFnSymfonyReturnType = {
    template: TwigTemplate;
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

export { type Decorator, type FrameworkOptions, type Loader, type Meta, type Preview, type StoryContext, type StoryFn, type StoryObj, type StorybookConfig, type SymfonyOptions, type SymfonyRenderer, twig };
