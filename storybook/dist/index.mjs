function m(r){for(var e=[],o=1;o<arguments.length;o++)e[o-1]=arguments[o];var t=Array.from(typeof r=="string"?[r]:r);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var p=t.reduce(function(n,c){var s=c.match(/\n([\t ]+|(?!\s).)/g);return s?n.concat(s.map(function(u){var a,i;return (i=(a=u.match(/[\t ]/g))===null||a===void 0?void 0:a.length)!==null&&i!==void 0?i:0})):n},[]);if(p.length){var h=new RegExp(`
[	 ]{`+Math.min.apply(Math,p)+"}","g");t=t.map(function(n){return n.replace(h,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var g=t[0];return e.forEach(function(n,c){var s=g.match(/(?:^|\n)( *)$/),u=s?s[1]:"",a=n;typeof n=="string"&&n.includes(`
`)&&(a=String(n).split(`
`).map(function(i,l){return l===0?i:""+u+i}).join(`
`)),g+=a+t[c+1];}),g}var d=m;var f=class{constructor(e){this.source=e;this.source=e;}getSource(){return this.source}toString(){return this.source}};function v(r,...e){let o=typeof r=="string"?[r]:r,t=String.raw({raw:o},...e);return new f(d(t))}

export { v as twig };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map