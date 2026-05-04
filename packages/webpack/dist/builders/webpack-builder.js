import { createProxyMiddleware } from 'http-proxy-middleware';
import * as baseBuilder from '@storybook/builder-webpack5';
import { dedent } from 'ts-dedent';

// src/builders/webpack-builder.ts
var getConfig2 = baseBuilder.getConfig;
var bail2 = baseBuilder.bail;
var start2 = async (options) => {
  const isProd = options.options.configType === "PRODUCTION";
  const { symfony = {} } = await options.options.presets.apply("frameworkOptions");
  if (!isProd && !symfony.server) {
    throw new Error(dedent`
        Cannot configure dev server.

        "server" option in "framework.options.symfony" is required for Storybook dev server to run.
        Update your main.ts|js file accordingly.
        `);
  }
  if (isProd && !symfony.server) {
    return baseBuilder.start(options);
  }
  const proxyPaths = ["/_storybook/render"];
  if (symfony.proxyPaths) {
    const paths = !Array.isArray(symfony.proxyPaths) ? [symfony.proxyPaths] : symfony.proxyPaths;
    proxyPaths.push(...paths);
  }
  for (const path of proxyPaths) {
    options.router.use(
      path,
      createProxyMiddleware({
        target: symfony.server,
        changeOrigin: true,
        secure: isProd,
        headers: {
          "X-Storybook-Proxy": "true"
        }
      })
    );
  }
  return baseBuilder.start(options);
};
var build2 = baseBuilder.build;
var corePresets2 = baseBuilder.corePresets;
var overridePresets2 = baseBuilder.overridePresets;

export { bail2 as bail, build2 as build, corePresets2 as corePresets, getConfig2 as getConfig, overridePresets2 as overridePresets, start2 as start };
