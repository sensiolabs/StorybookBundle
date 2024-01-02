'use strict';

var builderWebpack5 = require('@storybook/builder-webpack5');
var httpProxyMiddleware = require('http-proxy-middleware');

// src/builders/webpack5-builder.ts
var start = async (options) => {
  const isProd = options.options.configType === "PRODUCTION";
  const { symfony } = await options.options.presets.apply("frameworkOptions");
  if (symfony.proxyPaths) {
    const paths = !Array.isArray(symfony.proxyPaths) ? [symfony.proxyPaths] : symfony.proxyPaths;
    for (let path of paths) {
      options.router.use(path, httpProxyMiddleware.createProxyMiddleware({
        target: symfony.server,
        changeOrigin: true,
        secure: isProd
      }));
    }
  }
  return builderWebpack5.start(options);
};

Object.defineProperty(exports, "bail", {
  enumerable: true,
  get: function () { return builderWebpack5.bail; }
});
Object.defineProperty(exports, "build", {
  enumerable: true,
  get: function () { return builderWebpack5.build; }
});
Object.defineProperty(exports, "corePresets", {
  enumerable: true,
  get: function () { return builderWebpack5.corePresets; }
});
Object.defineProperty(exports, "getConfig", {
  enumerable: true,
  get: function () { return builderWebpack5.getConfig; }
});
Object.defineProperty(exports, "overridePresets", {
  enumerable: true,
  get: function () { return builderWebpack5.overridePresets; }
});
exports.start = start;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=webpack5-builder.js.map