'use strict';

var fastXmlParser = require('fast-xml-parser');

var i=class{constructor(t,r){this.source=t;this.components=r;this.source=t;}getSource(){return this.source}toString(){return this.source}getComponents(){return this.components}};function m(n){let t=["block"],r=new RegExp(/twig:[A-Za-z]+(?::[A-Za-z]+)*/),u=new RegExp(/component\(\s*'([A-Za-z]+(?::[A-Za-z]+)*)'\s*(?:,.*)?\)/,"gs"),g=new fastXmlParser.XMLParser().parse(`<div>${n}</div>`),c=s=>Object.entries(s).reduce((o,[p,e])=>{if(e!==null&&typeof e=="object")o.push(...c(e));else if(typeof e=="string")for(let a of e.matchAll(u))o.push([...a][1]);return r.test(p)&&o.push(p.replace("twig:","")),o},[]);return c(g).filter(s=>!t.includes(s))}function w(n,...t){let r=String.raw({raw:n},...t);return new i(r,m(r))}

exports.TwigTemplate = i;
exports.twig = w;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map