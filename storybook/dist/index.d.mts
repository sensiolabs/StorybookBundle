import { StorybookConfig as StorybookConfig$2, Options, TypescriptOptions as TypescriptOptions$1, DecoratorFunction } from '@storybook/types';
export { ArgTypes, Args, Parameters, StrictArgs } from '@storybook/types';
import { BuilderOptions, StorybookConfigWebpack, TypescriptOptions } from '@storybook/builder-webpack5';
import { ServerRenderer } from '@storybook/server';

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
     * Location of Storybook generated assets for Symfony renderer.
     */
    runtimePath?: string;
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

type HtmlWrapper = (html: string) => string;
declare const wrapHtml: (wrapper: HtmlWrapper) => DecoratorFunction<ServerRenderer>;

declare class TwigTemplate {
    private readonly source;
    private readonly components;
    constructor(source: string, components: string[]);
    getSource(): string;
    toString(): string;
    getComponents(): string[];
}
declare function twig(source: TemplateStringsArray | string, ...values: any[]): TwigTemplate;

export { type FrameworkOptions, type StorybookConfig, type SymfonyOptions, twig, wrapHtml };
