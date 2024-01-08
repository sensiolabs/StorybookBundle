import { global } from '@storybook/global';

// src/preview.ts
function getFrameworkOptions() {
  return global.FRAMEWORK_OPTIONS;
}
var decorators = [
  (StoryFn, context) => {
    const { server = {} } = context.parameters;
    if (server.url === void 0) {
      server.url = `${getFrameworkOptions().symfony.server}/_storybook/render`;
    }
    context.parameters.server = server;
    return StoryFn();
  }
];

export { decorators };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=preview.mjs.map