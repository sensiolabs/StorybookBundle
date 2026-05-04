import { StorybookConfig as StorybookConfig$1, TypescriptOptions as TypescriptOptions$1 } from '@storybook/core-webpack';
import { StorybookConfigWebpack, BuilderOptions, TypescriptOptions } from '@storybook/builder-webpack5';
import { PresetProperty } from 'storybook/internal/types';

type FrameworkName = '@sensiolabs/storybook-symfony-webpack';
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

declare const webpack: StorybookConfig['webpack'];
declare const previewHead: PresetProperty<'previewHead'>;
declare const previewBody: PresetProperty<'previewBody'>;

export { previewBody, previewHead, webpack };
