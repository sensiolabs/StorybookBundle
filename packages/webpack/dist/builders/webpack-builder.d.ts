import * as webpack from 'webpack';
import * as _storybook_core_webpack from '@storybook/core-webpack';
import * as baseBuilder from '@storybook/builder-webpack5';

type BuilderOptions = {
    server?: string;
    proxyPaths?: string | string[];
};
declare const getConfig: (options: _storybook_core_webpack.Options) => Promise<webpack.Configuration>;
declare const bail: (e?: Error) => Promise<void>;
declare const start: typeof baseBuilder.start;
declare const build: typeof baseBuilder.build;
declare const corePresets: string[];
declare const overridePresets: string[];

export { type BuilderOptions, bail, build, corePresets, getConfig, overridePresets, start };
