function h(n){for(var r=[],e=1;e<arguments.length;e++)r[e-1]=arguments[e];var t=Array.from(typeof n=="string"?[n]:n);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var o=t.reduce(function(i,d){var u=d.match(/\n([\t ]+|(?!\s).)/g);return u?i.concat(u.map(function(l){var s,a;return (a=(s=l.match(/[\t ]/g))===null||s===void 0?void 0:s.length)!==null&&a!==void 0?a:0})):i},[]);if(o.length){var f=new RegExp(`
[	 ]{`+Math.min.apply(Math,o)+"}","g");t=t.map(function(i){return i.replace(f,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var c=t[0];return r.forEach(function(i,d){var u=c.match(/(?:^|\n)( *)$/),l=u?u[1]:"",s=i;typeof i=="string"&&i.includes(`
`)&&(s=String(i).split(`
`).map(function(a,y){return y===0?a:""+l+a}).join(`
`)),c+=s+t[d+1];}),c}var m=h;var v="data-storybook-action",A=n=>{if(n.currentTarget!==null&&Object.hasOwn(n.currentTarget,"__component")){let r=new Proxy(n.currentTarget,{ownKeys(e){return Object.keys(e).filter(t=>t!=="__component")}});return new Proxy(n,{get(e,t){return t==="currentTarget"?r:Reflect.get(e,t)}})}return n},p=(n,r)=>{let{args:e}=r,t=document.getElementById("storybook-root");return document.addEventListener("DOMContentLoaded",()=>{t!==null&&Object.entries(e).filter(([,o])=>typeof o=="function"&&o._sfActionId!==void 0).forEach(([o,f])=>{let c=t.querySelector(`[${v}='${f._sfActionId}']`);c!==null?c.addEventListener(o,(...i)=>{f(...i.map(A));}):console.warn(m`
                        Action arg "${o} is not bound to any DOM element."
                    `);});},{once:!0}),n(r)};var x=n=>typeof n=="function"&&("_isMockFunction"in n&&n._isMockFunction||"isAction"in n&&n.isAction),g=n=>{let{args:r}=n;Object.entries(r).filter(([,e])=>x(e)).forEach(([e,t])=>{t._sfActionId=e,t._isMockFunction&&t.mockReset();});};var L=async(n,r,e,t)=>{let o=new URL(`${n}/${r}`);for(let c in e)e[c]._sfActionId!==void 0&&(e[c]=e[c]._sfActionId);return o.search=new URLSearchParams({...t.globals,...e}).toString(),(await fetch(o)).text()},k=[p],I=[g],O={server:{url:`${window.location.origin}/_storybook/render`,fetchStoryHtml:L}};

export { k as decorators, I as loaders, O as parameters };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=preview.mjs.map