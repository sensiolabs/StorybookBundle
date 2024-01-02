import { SymfonyOptions } from '../types';

export { build, bail, getConfig, corePresets, overridePresets } from "@storybook/builder-webpack5";
import { start as baseStart } from "@storybook/builder-webpack5";
import {createProxyMiddleware} from 'http-proxy-middleware';

export const start: typeof baseStart = async (options) => {
  const isProd = options.options.configType === 'PRODUCTION';

  const { symfony } = await options.options.presets.apply<{symfony: SymfonyOptions}>('frameworkOptions');

  if (symfony.proxyPaths) {
    const paths = !Array.isArray(symfony.proxyPaths) ? [symfony.proxyPaths] : symfony.proxyPaths;
    for (let path of paths) {
      options.router.use(path, createProxyMiddleware({
        target: symfony.server,
        changeOrigin: true,
        secure: isProd
      }));
    }
  }

  return baseStart(options);
}
