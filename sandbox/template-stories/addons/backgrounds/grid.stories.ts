import { global as globalThis } from '@storybook/global';

export default {
  component: globalThis.Components.Button,
  args: {
    label: 'Click Me!',
  },
  parameters: {
    backgrounds: {
      grid: {
        cellSize: 10,
        cellAmount: 4,
        opacity: 0.2,
      },
    },
    chromatic: { disable: true },
  },
};

export const Basic = {
  parameters: {},
};

export const Custom = {
  parameters: {
    backgrounds: {
      grid: {
        cellSize: 100,
        cellAmount: 10,
        opacity: 0.8,
      },
    },
  },
};

// Grid should have an offset of 0 when in fullscreen
export const Fullscreen = {
  parameters: {
    layout: 'fullscreen',
  },
};

export const Disabled = {
  parameters: {
    backgrounds: {
      grid: {
        disable: true,
      },
    },
  },
};
