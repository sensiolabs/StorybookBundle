'use strict';

var builderWebpack5 = require('@storybook/builder-webpack5');
var httpProxyMiddleware = require('http-proxy-middleware');

var n=async t=>{let o=t.options.configType==="PRODUCTION",{symfony:r}=await t.options.presets.apply("frameworkOptions");if(r.proxyPaths){let e=Array.isArray(r.proxyPaths)?r.proxyPaths:[r.proxyPaths];for(let s of e)t.router.use(s,httpProxyMiddleware.createProxyMiddleware({target:r.server,changeOrigin:!0,secure:o}));}return builderWebpack5.start(t)};

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
exports.start = n;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=webpack5-builder.js.map