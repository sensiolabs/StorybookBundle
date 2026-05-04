# Interaction Tests

> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/essentials/interactions)

Storybook 10 exposes Testing Library and Vitest-backed helpers from `storybook/test` for [play functions](../features/play-function.md).

## Usage

The following example tests a _Counter_ component that increments a count on button click:

```js
// stories/Counter.stories.js
import Counter from "../templates/components/Counter.html.twig";
import { twig } from "@sensiolabs/storybook-symfony-vite";
import { userEvent, waitFor, within, expect, fn } from "storybook/test";

export default {
  render: (args) => ({
    components: { Counter },
    template: twig`
        <twig:Counter :data-storybook-callbacks="_context['counter:increment']">
            Increase count
        </twig:Counter>
        `,
  }),
  args: {
    "counter:increment": fn(),
  },
};

export const Default = {
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const clicks = 2;

    for (const i of Array(clicks).keys()) {
      await step(`Click button #${i + 1}`, async () => {
        await userEvent.click(canvas.getByRole("button"));
      });
    }

    await waitFor(async () => {
      await expect(args["counter:increment"]).toHaveBeenCalledTimes(clicks);
      await expect(canvasElement).toHaveTextContent(`Counter: ${clicks}`);
    });
  },
};
```

For more advanced usage, refer to the official Storybook documentation.
