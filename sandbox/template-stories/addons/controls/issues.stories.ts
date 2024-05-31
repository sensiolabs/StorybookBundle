import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, StoryContext } from '@storybook/types';

export default {
  component: globalThis.Components.Pre,
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ args: { object: { ...context.args } } }),
  ],
};

// https://github.com/storybookjs/storybook/issues/14752
export const MissingRadioOptions = {
  argTypes: { invalidRadio: { control: 'radio' } },
  args: { invalidRadio: 'someValue' },
};
