'use strict';

var httpProxyMiddleware = require('http-proxy-middleware');
var e = require('@storybook/builder-webpack5');

function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
                Object.keys(e).forEach(function (k) {
                        if (k !== 'default') {
                                var d = Object.getOwnPropertyDescriptor(e, k);
                                Object.defineProperty(n, k, d.get ? d : {
                                        enumerable: true,
                                        get: function () { return e[k]; }
                                });
                        }
                });
        }
        n.default = e;
        return Object.freeze(n);
}

var e__namespace = /*#__PURE__*/_interopNamespace(e);

function m(o){for(var c=[],t=1;t<arguments.length;t++)c[t-1]=arguments[t];var r=Array.from(typeof o=="string"?[o]:o);r[r.length-1]=r[r.length-1].replace(/\r?\n([\t ]*)$/,"");var s=r.reduce(function(n,d){var p=d.match(/\n([\t ]+|(?!\s).)/g);return p?n.concat(p.map(function(f){var a,i;return (i=(a=f.match(/[\t ]/g))===null||a===void 0?void 0:a.length)!==null&&i!==void 0?i:0})):n},[]);if(s.length){var l=new RegExp(`
[	 ]{`+Math.min.apply(Math,s)+"}","g");r=r.map(function(n){return n.replace(l,`
`)});}r[0]=r[0].replace(/^\r?\n/,"");var u=r[0];return c.forEach(function(n,d){var p=u.match(/(?:^|\n)( *)$/),f=p?p[1]:"",a=n;typeof n=="string"&&n.includes(`
`)&&(a=String(n).split(`
`).map(function(i,g){return g===0?i:""+f+i}).join(`
`)),u+=a+r[d+1];}),u}var y=m;var P=e__namespace.getConfig,B=e__namespace.bail,w=async o=>{let c=o.options.configType==="PRODUCTION",{symfony:t}=await o.options.presets.apply("frameworkOptions");if(!t.server)throw new Error(y`
        Cannot configure dev server.
        
        "server" option in "frameworkOptions.symfony" is required for Storybook dev server to run.
        Update your main.ts|js file accordingly.
        `);let r=["/_storybook/render"];if(t.proxyPaths){let s=Array.isArray(t.proxyPaths)?t.proxyPaths:[t.proxyPaths];r.push(...s);}for(let s of r)o.router.use(s,httpProxyMiddleware.createProxyMiddleware({target:t.server,changeOrigin:!0,secure:c,headers:{"X-Storybook-Proxy":"true"}}));return e__namespace.start(o)},O=e__namespace.build,k=e__namespace.corePresets,S=e__namespace.overridePresets;

exports.bail = B;
exports.build = O;
exports.corePresets = k;
exports.getConfig = P;
exports.overridePresets = S;
exports.start = w;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map