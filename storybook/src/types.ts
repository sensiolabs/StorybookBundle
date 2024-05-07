export type { BuilderResult, TypescriptOptions } from '@storybook/core-webpack';

import type {
    StorybookConfig as StorybookConfigBase,
    TypescriptOptions as TypescriptOptionsReact,
} from '@storybook/core-webpack';

import type {
    StorybookConfigWebpack,
    BuilderOptions,
    TypescriptOptions as TypescriptOptionsBuilder,
} from '@storybook/builder-webpack5';

type FrameworkName = '@sensiolabs/storybook-symfony-webpack5';
type BuilderName = '@storybook/builder-webpack5';

type ProxyPaths = string[] | string;

export type SymfonyOptions = {
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

export type FrameworkOptions = {
    builder?: BuilderOptions;
    symfony: SymfonyOptions;
};

type StorybookConfigFramework = {
    framework:
        | FrameworkName
        | {
              name: FrameworkName;
              options: FrameworkOptions;
          };
    core?: StorybookConfigBase['core'] & {
        builder?:
            | BuilderName
            | {
                  name: BuilderName;
                  options: BuilderOptions;
              };
    };
    typescript?: Partial<TypescriptOptionsBuilder & TypescriptOptionsReact> & StorybookConfigBase['typescript'];
};

/**
 * The interface for Storybook configuration in `main.ts` files.
 */
export type StorybookConfig = Omit<StorybookConfigBase, keyof StorybookConfigWebpack | keyof StorybookConfigFramework> &
    StorybookConfigWebpack &
    StorybookConfigFramework;
