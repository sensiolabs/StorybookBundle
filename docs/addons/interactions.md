# Interactions


> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/essentials/interactions)

The Interactions addon provides a panel to visualize the interactions simulated by the [play function](../features/play-function.md).

It also uses the [Testing Library](https://testing-library.com/) and [Vitest](https://vitest.dev/) to turn the play function into an interaction test, and make assertions about the component state and behavior.

## Installation

The addon must be installed with:
```shell
npm install @storybook/test @storybook/addon-interactions --save-dev
```

Then it has to be registered in the `main.js|ts` configuration, **after the actions addon**:

```ts
// .storybook/main.ts
// ...

const config: StorybookConfig = {
    addons: [
        // ...
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    // ...
};
```

## Usage

Here is an example for a _Counter_ component that increments a count on button click:

```js
// stories/Counter.stories.js
import Counter from '../templates/components/Counter.html.twig';
import { twig } from "@sensiolabs/storybook-symfony-webpack5";
import {userEvent, waitFor, within, expect, fn} from "@storybook/test";

export default {
    render: (args) => ({
        components: {Counter},
        template: twig`
        <twig:Counter :data-storybook-action="_context['button:increment']">
            Increase count
        </twig:Counter>
        `
    }),
    args: {
        'counter:increment': fn(),
    },
}

export const Default = {
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);
        const clicks = 2;

        for (const i of Array(clicks).keys()) {
            await step(`Click button #${i+1}`, async () => {
                await userEvent.click(canvas.getByRole('button'));
            })
        }

        await waitFor(async () => {
            await expect(args['button:increment']).toHaveBeenCalledTimes(clicks);
            await expect(canvasElement).toHaveTextContent(`Counter: ${clicks}`);
        })
    }
}
```

For more advanced usage, refer to the official Storybook documentation.
