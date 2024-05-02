import { global } from '@storybook/global';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';

function l(e){for(var r=[],n=1;n<arguments.length;n++)r[n-1]=arguments[n];var t=Array.from(typeof e=="string"?[e]:e);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var o=t.reduce(function(i,f){var p=f.match(/\n([\t ]+|(?!\s).)/g);return p?i.concat(p.map(function(y){var c,d;return (d=(c=y.match(/[\t ]/g))===null||c===void 0?void 0:c.length)!==null&&d!==void 0?d:0})):i},[]);if(o.length){var a=new RegExp(`
[	 ]{`+Math.min.apply(Math,o)+"}","g");t=t.map(function(i){return i.replace(a,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var s=t[0];return r.forEach(function(i,f){var p=s.match(/(?:^|\n)( *)$/),y=p?p[1]:"",c=i;typeof i=="string"&&i.includes(`
`)&&(c=String(i).split(`
`).map(function(d,m){return m===0?d:""+y+d}).join(`
`)),s+=c+t[f+1];}),s}var g=l;var v="data-storybook-action",O=e=>{if(e.currentTarget!==null&&Object.hasOwn(e.currentTarget,"__component")){let r=new Proxy(e.currentTarget,{ownKeys(n){return Object.keys(n).filter(t=>t!=="__component")}});return new Proxy(e,{get(n,t){return t==="currentTarget"?r:Reflect.get(n,t)}})}return e},w=(e,r)=>{let{args:n}=r,t=document.getElementById("storybook-root");return document.addEventListener("DOMContentLoaded",()=>{t!==null&&Object.entries(n).filter(([,o])=>typeof o=="function"&&o._sfActionId!==void 0).forEach(([o,a])=>{let s=t.querySelector(`[${v}='${a._sfActionId}']`);s!==null?s.addEventListener(o,(...i)=>{a(...i.map(O));}):console.warn(g`
                        Action arg "${o} is not bound to any DOM element."
                    `);});},{once:!0}),e(r)};var C=e=>typeof e=="function"&&("_isMockFunction"in e&&e._isMockFunction||"isAction"in e&&e.isAction),A=e=>{let{args:r}=e;Object.entries(r).filter(([,n])=>C(n)).forEach(([n,t])=>{t._sfActionId=n,t._isMockFunction&&t.mockReset();});};var h=class{constructor(r){this.source=r;this.source=r;}getSource(){return this.source}toString(){return this.source}};function S(e,...r){let n=typeof e=="string"?[e]:e,t=String.raw({raw:n},...r);return new h(g(t))}var {fetch:I,Node:F}=global,j=async(e,r,n,t,o)=>{let a=new URL(`${e}/${r}`);for(let f in n)n[f]._sfActionId!==void 0&&(n[f]=n[f]._sfActionId);let s={args:{...t.globals,...n},template:o.getSource()};return (await I(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).text()},k=(e,r)=>{let n={...e};return Object.keys(r).forEach(t=>{let o=r[t],{control:a}=o,s=a&&a.type.toLowerCase(),i=n[t];switch(s){case"date":n[t]=new Date(i).toISOString();break;}}),n},D=(e,r)=>{let n=Object.entries(r).map(([t,o])=>o._sfActionId!==void 0?`:data-storybook-action="_context['${t}']"`:`:${t}="_context['${t}']"`).join(" ");return S`
        <twig:${e} ${n} />
    `},H=(e,r)=>{let{id:n,component:t}=r;if(typeof t=="string")return {template:S(t)};if(typeof t=="object"){if("getSource"in t&&typeof t.getSource=="function")return {template:t};if("name"in t)return {template:D(t.name,e),components:[t]}}if(typeof t=="function")return t(e,r);throw console.warn(l`
    Symfony renderer only supports rendering Twig templates. Either:
    - Create a "render" function in your story export
    - Set the "component" story's property to a string or a template created with the "twig" helper

    Received: ${t}
    `),new Error(`Unable to render story ${n}`)};async function P({id:e,title:r,name:n,showMain:t,showError:o,forceRemount:a,storyFn:s,storyContext:i,storyContext:{parameters:f,args:p,argTypes:y}},c){let{template:d,setup:m}=s();typeof m=="function"&&(p=m());let T=k(p,y),{symfony:{id:b,params:x}}=f,L=`${window.location.origin}/_storybook/render`,$=b||e,_={...x,...T},u=await j(L,$,_,i,d);if(t(),typeof u=="string")c.innerHTML=u,simulatePageLoad(c);else if(u instanceof F){if(c.firstChild===u&&!a)return;c.innerHTML="",c.appendChild(u),simulateDOMContentLoaded();}else o({title:`Expecting an HTML snippet or DOM node from the story: "${n}" of "${r}".`,description:l`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `});}var Z=[w],tt=[A],et={renderer:"symfony",symfony:{}};

export { Z as decorators, tt as loaders, et as parameters, H as render, P as renderToCanvas };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=entry-preview.mjs.map