import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, StoryContext } from '@storybook/types';

export default {
  component: globalThis.Components.Pre,
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) =>
      storyFn({ args: { object: { ...context.args } } }),
  ],
  argTypes: {
    x: { type: { required: true } },
    y: { type: { required: true }, table: { category: 'foo' } },
    z: {},
    a: { type: { required: true } },
    b: { table: { category: 'foo' } },
    c: {},
  },
  args: {
    x: 'x',
    y: 'y',
    z: 'z',
    a: 'a',
    b: 'b',
    c: 'c',
  },
  parameters: { chromatic: { disable: true } },
};

export const None = { parameters: { controls: { sort: 'none' } } };

export const Alpha = { parameters: { controls: { sort: 'alpha' } } };

export const RequiredFirst = { parameters: { controls: { sort: 'requiredFirst' } } };
