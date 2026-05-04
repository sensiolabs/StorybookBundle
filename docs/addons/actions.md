# Actions

> ⚠️ This feature uses framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/essentials/actions)

The Actions addon tracks events triggered within a story and reports them in the Storybook Actions panel.

To set up an action in a Twig template, you can use the `fn()` spy in an arg:

```js
// stories/Button.stories.js
import Button from "../templates/components/Button.html.twig";
import { fn } from "storybook/test";

export default {
  component: Button,
};

export const Default = {
  args: {
    click: fn(),
  },
};
```

When a story provides a custom template, reference the action arg with the `data-storybook-callbacks` attribute:

```js
// stories/Button.stories.js
import Button from "../templates/components/Button.html.twig";
import { fn } from "storybook/test";
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  render: (args) => ({
    components: { Button },
    template: twig`
        <twig:Button :data-storybook-callbacks="click">
            Click me!
        </twig:Button>
        `,
  }),
};

export const Default = {
  args: {
    click: fn(),
  },
};
```

## Stimulus events

Stimulus events dispatched with `this.dispatch()` use the `<controller>:<event>` pattern. Because the event name contains `:`, the arg cannot be accessed with normal Twig variable syntax.

You can use the `_context` variable instead:

```js
// stories/Counter.stories.js
import Counter from "../templates/components/Counter.html.twig";
import { fn } from "storybook/test";
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  render: (args) => ({
    components: { Counter },
    template: twig`
        <twig:Counter :data-storybook-callbacks="_context['counter:increment']">
            Increase count
        </twig:Counter>
        `,
  }),
};

export const Default = {
  args: {
    "counter:increment": fn(),
  },
};
```

This works for any arg, but avoid arg names with characters that are not valid in Twig variable names unless the story needs event-style names.

## Multiple actions on the same element

Multiple actions on the same element work with the short component syntax, for example `component: Button`.

With a custom template, output each action arg in the `data-storybook-callbacks` attribute using multiple print nodes:

```js
import Toggle from "../templates/components/Toggle.html.twig";
import { fn } from "storybook/test";
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  render: (args) => ({
    components: { Toggle },
    template: twig`
        <twig:Toggle data-storybook-callbacks="{{ _context['toggle:enable'] }} {{ _context['toggle:disable'] }}" />
        `,
  }),
};

export const Default = {
  args: {
    "toggle:enable": fn(),
    "toggle:disable": fn(),
  },
};
```
