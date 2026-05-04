import * as unplugin from 'unplugin';

type Options = {
    projectDir: string;
    additionalWatchPaths: string[];
};
/**
 * Compile preview HTML for dev with HMR .
 */
declare const DevPreviewCompilerPlugin: unplugin.UnpluginInstance<Options, boolean>;

export { DevPreviewCompilerPlugin, type Options };
