import { global } from '@storybook/global';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';

function l(n){for(var r=[],e=1;e<arguments.length;e++)r[e-1]=arguments[e];var t=Array.from(typeof n=="string"?[n]:n);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var s=t.reduce(function(o,f){var p=f.match(/\n([\t ]+|(?!\s).)/g);return p?o.concat(p.map(function(u){var c,d;return (d=(c=u.match(/[\t ]/g))===null||c===void 0?void 0:c.length)!==null&&d!==void 0?d:0})):o},[]);if(s.length){var a=new RegExp(`
[	 ]{`+Math.min.apply(Math,s)+"}","g");t=t.map(function(o){return o.replace(a,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var i=t[0];return r.forEach(function(o,f){var p=i.match(/(?:^|\n)( *)$/),u=p?p[1]:"",c=o;typeof o=="string"&&o.includes(`
`)&&(c=String(o).split(`
`).map(function(d,m){return m===0?d:""+u+d}).join(`
`)),i+=c+t[f+1];}),i}var g=l;var S="data-storybook-action",v=n=>{if(n.currentTarget!==null&&Object.hasOwn(n.currentTarget,"__component")){let r=new Proxy(n.currentTarget,{ownKeys(e){return Object.keys(e).filter(t=>t!=="__component")}});return new Proxy(n,{get(e,t){return t==="currentTarget"?r:Reflect.get(e,t)}})}return n},h=(n,r)=>{let{args:e}=r,t=document.getElementById("storybook-root");return document.addEventListener("DOMContentLoaded",()=>{t!==null&&Object.entries(e).filter(([,s])=>typeof s=="function"&&s._sfActionId!==void 0).forEach(([s,a])=>{let i=t.querySelector(`[${S}='${a._sfActionId}']`);i!==null?i.addEventListener(s,(...o)=>{a(...o.map(v));}):console.warn(g`
                        Action arg "${s} is not bound to any DOM element."
                    `);});},{once:!0}),n(r)};var w=n=>typeof n=="function"&&("_isMockFunction"in n&&n._isMockFunction||"isAction"in n&&n.isAction),T=n=>{let{args:r}=n;Object.entries(r).filter(([,e])=>w(e)).forEach(([e,t])=>{t._sfActionId=e,t._isMockFunction&&t.mockReset();});};var{fetch:R,Node:C}=global,D=async(n,r,e,t,s)=>{let a=new URL(`${n}/${r}`);for(let f in e)e[f]._sfActionId!==void 0&&(e[f]=e[f]._sfActionId);let i={args:{...t.globals,...e},template:s.getSource()};return (await R(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})).text()},E=(n,r)=>{let e={...n};return Object.keys(r).forEach(t=>{let s=r[t],{control:a}=s,i=a&&a.type.toLowerCase(),o=e[t];switch(i){case"date":e[t]=new Date(o).toISOString();break;}}),e};async function F({id:n,title:r,name:e,showMain:t,showError:s,forceRemount:a,storyFn:i,storyContext:o,storyContext:{parameters:f,args:p,argTypes:u}},c){let{template:d}=i(o),m=E(p,u),{server:{url:A,fetchStoryHtml:b=D,params:L}}=f,x={...L,...m},y=await b(A,n,x,o,d);if(t(),typeof y=="string")c.innerHTML=y,simulatePageLoad(c);else if(y instanceof C){if(c.firstChild===y&&!a)return;c.innerHTML="",c.appendChild(y),simulateDOMContentLoaded();}else s({title:`Expecting an HTML snippet or DOM node from the story: "${e}" of "${r}".`,description:l`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `});}var q=[h],J=[T],K={renderer:"symfony",server:{url:`${window.location.origin}/_storybook/render`}};

export { q as decorators, J as loaders, K as parameters, F as renderToCanvas };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=entry-preview.mjs.map