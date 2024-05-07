import { global } from '@storybook/global';
import { simulatePageLoad, simulateDOMContentLoaded } from '@storybook/preview-api';

function l(e){for(var o=[],n=1;n<arguments.length;n++)o[n-1]=arguments[n];var t=Array.from(typeof e=="string"?[e]:e);t[t.length-1]=t[t.length-1].replace(/\r?\n([\t ]*)$/,"");var r=t.reduce(function(s,d){var p=d.match(/\n([\t ]+|(?!\s).)/g);return p?s.concat(p.map(function(u){var a,f;return (f=(a=u.match(/[\t ]/g))===null||a===void 0?void 0:a.length)!==null&&f!==void 0?f:0})):s},[]);if(r.length){var i=new RegExp(`
[	 ]{`+Math.min.apply(Math,r)+"}","g");t=t.map(function(s){return s.replace(i,`
`)});}t[0]=t[0].replace(/^\r?\n/,"");var c=t[0];return o.forEach(function(s,d){var p=c.match(/(?:^|\n)( *)$/),u=p?p[1]:"",a=s;typeof s=="string"&&s.includes(`
`)&&(a=String(s).split(`
`).map(function(f,m){return m===0?f:""+u+f}).join(`
`)),c+=a+t[d+1];}),c}var g=l;var _="data-storybook-action",R=e=>{if(e.currentTarget!==null&&Object.hasOwn(e.currentTarget,"__component")){let o=new Proxy(e.currentTarget,{ownKeys(n){return Object.keys(n).filter(t=>t!=="__component")}});return new Proxy(e,{get(n,t){return t==="currentTarget"?o:Reflect.get(n,t)}})}return e},w=(e,o)=>{let{args:n}=o,t=document.getElementById("storybook-root");return document.addEventListener("DOMContentLoaded",()=>{t!==null&&Object.entries(n).filter(([,r])=>typeof r=="function"&&r._sfActionId!==void 0).forEach(([r,i])=>{let c=t.querySelector(`[${_}~='${i._sfActionId}']`);c!==null?c.addEventListener(r,(...s)=>{i(...s.map(R));}):console.warn(g`
                        Action arg "${r}" is not bound to any DOM element.
                    `);});},{once:!0}),e(o)};var M=e=>typeof e=="function"&&("_isMockFunction"in e&&e._isMockFunction||"isAction"in e&&e.isAction),S=e=>{let{args:o}=e;Object.entries(o).filter(([,n])=>M(n)).forEach(([n,t])=>{t._sfActionId=n,t._isMockFunction&&t.mockReset();});};var A=class{constructor(o){this.source=o;this.source=o;}getSource(){return this.source}toString(){return this.source}};function h(e,...o){let n=typeof e=="string"?[e]:e,t=String.raw({raw:n},...o);return new A(g(t))}var b=(e,o)=>{let n=Object.entries(o).reduce((r,[i,c])=>(c._sfActionId!==void 0?r.actions.push(`{{ _context['${i}'] }}`):r.props.push(`:${i}="${i}"`),r),{props:[],actions:[]}),t=n.props;return n.actions.length>0&&t.push(`data-storybook-action="${n.actions.join(" ")}"`),h`
        <twig:${e} ${t.join(" ")} />
    `};var {fetch:F,Node:k}=global,T=e=>{let o={};for(let n in e)e[n]._sfActionId!==void 0?o[n]=e[n]._sfActionId:typeof e[n]=="object"?o[n]=T(e[n]):o[n]=e[n];return o},D=async(e,o,n,t,r)=>{let i=new URL(`${e}/${o}`);n=T(n);let c={args:{...t.globals,...n},template:r.getSource()};return (await F(i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)})).text()},H=(e,o)=>{let n={...e};return Object.keys(o).forEach(t=>{let r=o[t],{control:i}=r,c=i&&i.type.toLowerCase(),s=n[t];switch(c){case"date":n[t]=new Date(s).toISOString();break;}}),n},P=(e,o)=>{let{id:n,component:t}=o;if(typeof t=="string")return {template:h(t)};if(typeof t=="object"){if("getSource"in t&&typeof t.getSource=="function")return {template:t};if("name"in t)return {template:b(t.name,e),components:[t]}}if(typeof t=="function")return t(e,o);throw console.warn(l`
    Symfony renderer only supports rendering Twig templates. Either:
    - Create a "render" function in your story export
    - Set the "component" story's property to a string or a template created with the "twig" helper

    Received: ${t}
    `),new Error(`Unable to render story ${n}`)};async function U({id:e,title:o,name:n,showMain:t,showError:r,forceRemount:i,storyFn:c,storyContext:s,storyContext:{parameters:d,args:p,argTypes:u}},a){let{template:f,setup:m}=c();typeof m=="function"&&(p=m());let x=H(p,u),{symfony:{id:L,params:$}}=d,v=`${window.location.origin}/_storybook/render`,C=L||e,O={...$,...x},y=await D(v,C,O,s,f);if(t(),typeof y=="string")a.innerHTML=y,simulatePageLoad(a);else if(y instanceof k){if(a.firstChild===y&&!i)return;a.innerHTML="",a.appendChild(y),simulateDOMContentLoaded();}else r({title:`Expecting an HTML snippet or DOM node from the story: "${n}" of "${o}".`,description:l`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `});}var ot=[w],rt=[S],st={renderer:"symfony",symfony:{}};

export { ot as decorators, rt as loaders, st as parameters, P as render, U as renderToCanvas };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=entry-preview.mjs.map