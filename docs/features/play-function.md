# Play Function

> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-stories/play-function)

The play function executes code after a story renders. It is commonly used to simulate user interactions with a component.

Use Storybook's [Interactions](../addons/interactions.md) tooling when you want visual debugging for play functions in the Storybook preview.

Example:

```js
import Button from "./Button.html.twig";
import { userEvent, within } from "storybook/test";

export default {
  component: Button,
};

export const ClickedButton = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    await userEvent.click(button);
  },
};
```
