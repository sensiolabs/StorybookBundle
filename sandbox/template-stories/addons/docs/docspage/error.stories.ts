import { global as globalThis } from '@storybook/global';

export default {
  component: globalThis.Components.Button,
  tags: ['autodocs'],
  args: { label: 'Click Me!' },
  parameters: { chromatic: { disable: true } },
};

/**
 * A story that throws
 */
export const ErrorStory = {
  decorators: [
    (storyFn) => {
      // Don't throw in the test runner; there's no easy way to skip (yet)
      if (window?.navigator?.userAgent?.match(/StorybookTestRunner/)) return storyFn();

      throw new Error('Story did something wrong');
    },
  ],
};
