import { SymfonyOptions } from '../types';
import { start as baseStart } from '@storybook/builder-webpack5';
import { createProxyMiddleware } from 'http-proxy-middleware';

export { build, bail, getConfig, corePresets, overridePresets } from '@storybook/builder-webpack5';

export const start: typeof baseStart = async (options) => {
    const isProd = options.options.configType === 'PRODUCTION';

    const { symfony } = await options.options.presets.apply<{
        symfony: SymfonyOptions;
    }>('frameworkOptions');

    if (symfony.proxyPaths) {
        const paths = !Array.isArray(symfony.proxyPaths) ? [symfony.proxyPaths] : symfony.proxyPaths;
        for (const path of paths) {
            options.router.use(
                path,
                createProxyMiddleware({
                    target: symfony.server,
                    changeOrigin: true,
                    secure: isProd,
                })
            );
        }
    }

    return baseStart(options);
};
