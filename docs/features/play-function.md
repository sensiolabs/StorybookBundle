# Play Function

> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-stories/play-function)

The play function allows to execute code after a story renders. It is used to simulate user interactions with your component.

It is recommended to set up the Storybook's [Interactions](../addons/interactions.md) addon to get visual components in your Storybook preview.

Here is an example of play function:

```js
import Button from './Button.html.twig';
import {userEvent, within} from '@storybook/test';

export default {
    component: Button
}

export default ClickedButton = {
    play: async (canvasElement) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');

        await userEvent.click(button);
    }
}
```
