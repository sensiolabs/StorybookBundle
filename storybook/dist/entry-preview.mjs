import { global } from '@storybook/global';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';

function m(e){for(var r=[],n=1;n<arguments.length;n++)r[n-1]=arguments[n];var t=Array.from(typeof e=="string"?[e]:e);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var o=t.reduce(function(s,f){var d=f.match(/\n([\t ]+|(?!\s).)/g);return d?s.concat(d.map(function(y){var c,p;return (p=(c=y.match(/[\t ]/g))===null||c===void 0?void 0:c.length)!==null&&p!==void 0?p:0})):s},[]);if(o.length){var a=new RegExp(`
[	 ]{`+Math.min.apply(Math,o)+"}","g");t=t.map(function(s){return s.replace(a,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var i=t[0];return r.forEach(function(s,f){var d=i.match(/(?:^|\n)( *)$/),y=d?d[1]:"",c=s;typeof s=="string"&&s.includes(`
`)&&(c=String(s).split(`
`).map(function(p,g){return g===0?p:""+y+p}).join(`
`)),i+=c+t[f+1];}),i}var l=m;var v="data-storybook-action",O=e=>{if(e.currentTarget!==null&&Object.hasOwn(e.currentTarget,"__component")){let r=new Proxy(e.currentTarget,{ownKeys(n){return Object.keys(n).filter(t=>t!=="__component")}});return new Proxy(e,{get(n,t){return t==="currentTarget"?r:Reflect.get(n,t)}})}return e},w=(e,r)=>{let{args:n}=r,t=document.getElementById("storybook-root");return document.addEventListener("DOMContentLoaded",()=>{t!==null&&Object.entries(n).filter(([,o])=>typeof o=="function"&&o._sfActionId!==void 0).forEach(([o,a])=>{let i=t.querySelector(`[${v}='${a._sfActionId}']`);i!==null?i.addEventListener(o,(...s)=>{a(...s.map(O));}):console.warn(l`
                        Action arg "${o} is not bound to any DOM element."
                    `);});},{once:!0}),e(r)};var C=e=>typeof e=="function"&&("_isMockFunction"in e&&e._isMockFunction||"isAction"in e&&e.isAction),A=e=>{let{args:r}=e;Object.entries(r).filter(([,n])=>C(n)).forEach(([n,t])=>{t._sfActionId=n,t._isMockFunction&&t.mockReset();});};var h=class{constructor(r){this.source=r;this.source=r;}getSource(){return this.source}toString(){return this.source}};function S(e,...r){let n=typeof e=="string"?[e]:e,t=String.raw({raw:n},...r);return new h(l(t))}var {fetch:E,Node:I}=global,F=async(e,r,n,t,o)=>{let a=new URL(`${e}/${r}`);for(let f in n)n[f]._sfActionId!==void 0&&(n[f]=n[f]._sfActionId);let i={args:{...t.globals,...n},template:o.getSource()};return (await E(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})).text()},j=(e,r)=>{let n={...e};return Object.keys(r).forEach(t=>{let o=r[t],{control:a}=o,i=a&&a.type.toLowerCase(),s=n[t];switch(i){case"date":n[t]=new Date(s).toISOString();break;}}),n},k=(e,r)=>{let n=Object.entries(r).map(([t,o])=>o._sfActionId!==void 0?`:data-storybook-action="args['${t}']"`:`:${t}="args['${t}']"`).join(" ");return S`
        <twig:${e} ${n} />
    `},D=(e,r)=>{let{id:n,component:t}=r;if(typeof t=="string")return {template:S(t)};if(typeof t=="object"){if("getSource"in t&&typeof t.getSource=="function")return {template:t};if("name"in t)return {template:k(t.name,e),components:[t]}}if(typeof t=="function")return t(e,r);throw console.log(t),console.warn(m`
    Symfony renderer only supports rendering Twig templates. Either:
    - Create a "render" function in your story export
    - Set the "component" story's property to a string or a template created with the "twig" helper

    Received: ${t}
    `),new Error(`Unable to render story ${n}`)};async function H({id:e,title:r,name:n,showMain:t,showError:o,forceRemount:a,storyFn:i,storyContext:s,storyContext:{parameters:f,args:d,argTypes:y}},c){let{template:p}=i(),g=j(d,y),{symfony:{id:T,params:b}}=f,x=`${window.location.origin}/_storybook/render`,L=T||e,$={...b,...g},u=await F(x,L,$,s,p);if(t(),typeof u=="string")c.innerHTML=u,simulatePageLoad(c);else if(u instanceof I){if(c.firstChild===u&&!a)return;c.innerHTML="",c.appendChild(u),simulateDOMContentLoaded();}else o({title:`Expecting an HTML snippet or DOM node from the story: "${n}" of "${r}".`,description:m`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `});}var Y=[w],Z=[A],tt={renderer:"symfony",symfony:{}};

export { Y as decorators, Z as loaders, tt as parameters, D as render, H as renderToCanvas };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=entry-preview.mjs.map