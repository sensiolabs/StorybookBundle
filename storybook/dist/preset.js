'use strict';

var o=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(r,t)=>(typeof require<"u"?require:r)[t]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var n=[o.resolve("./server/framework-preset")],p=async(e,r)=>{let t=await r.presets.apply("framework");return {...e,builder:{name:o.resolve("./builders/webpack-builder"),options:typeof t=="string"?{}:t.options.builder||{}}}},a=async(e=[],r)=>{let t=Object.keys(await r.presets.apply("docs",{},r)).length>0;return e.concat(o.resolve("./entry-preview")).concat(t?[o.resolve("./entry-preview-docs")]:[])};

exports.addons = n;
exports.core = p;
exports.previewAnnotations = a;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=preset.js.map