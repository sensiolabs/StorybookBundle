import { global } from '@storybook/global';

function n(){return global.FRAMEWORK_OPTIONS}var m=[(e,o)=>{let{server:r={}}=o.parameters;return r.url===void 0&&(r.url=`${n().symfony.server}/_storybook/render`),o.parameters.server=r,e()}];

export { m as decorators };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=preview.mjs.map