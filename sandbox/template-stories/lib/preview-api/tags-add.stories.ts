import { global as globalThis } from '@storybook/global';
import type { PartialStoryFn, PlayFunctionContext, StoryContext } from '@storybook/types';
import { within, expect } from '@storybook/test';

export default {
  component: globalThis.Components.Pre,
  tags: ['!dev', '!autodocs', '!test'],
  decorators: [
    (storyFn: PartialStoryFn, context: StoryContext) => {
      return storyFn({
        args: { object: { tags: context.tags } },
      });
    },
  ],
  parameters: { chromatic: { disable: true } },
};

export const Inheritance = {
  tags: ['story-one'],
  play: async ({ canvasElement }: PlayFunctionContext<any>) => {
    const canvas = within(canvasElement);
    await expect(JSON.parse(canvas.getByTestId('pre').innerText)).toEqual({
      tags: ['story-one'],
    });
  },
  parameters: { chromatic: { disable: false } },
};

export const Dev = {
  tags: ['dev'],
};

export const Autodocs = {
  tags: ['autodocs'],
};

export const Test = {
  tags: ['test'],
};
