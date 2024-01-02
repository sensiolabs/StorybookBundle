import { global } from '@storybook/global';

// src/preview.ts
function getFrameworkOptions() {
  return global.FRAMEWORK_OPTIONS;
}
var decorators = [
  (StoryFn, context) => {
    const serverUrl = `${getFrameworkOptions().symfony.server}/_storybook/render`;
    const { server = {} } = context.parameters;
    if (server.url === void 0) {
      server.url = serverUrl;
      context.parameters.server = server;
    }
    return StoryFn();
  }
];

export { decorators };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=preview.mjs.map