# Actions

> ⚠️ This feature uses framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/essentials/actions)

The Actions addon lets you track events triggered within a story, and report them into the Actions panel in the Storybook UI.

To set up an action in a Twig template, you can use the `fn()` spy in an arg:

```js
// stories/Button.stories.js
import Button from '../templates/components/Button.html.twig';
import { fn } from '@storybook/test';

export default {
    component: Button
}

export const Default = {
    args: {
        click: fn(),
    }
}
```

When providing a template for the story, you have to reference your action arg in the template using the `data-storybook-callbacks` attribute:

```js
// stories/Button.stories.js
import Button from '../templates/components/Button.html.twig';
import { fn } from '@storybook/test';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    component: (args) => ({
        components: {Button},
        template: twig`
        <twig:Button :data-storybook-callbacks="click">
            Click me!
        </twig:Button>
        `
    })
}

export const Default = {
    args: {
        click: fn(),
    }
}
```

## Stimulus events

When using Stimulus events (dispatched from a controller with `this.dispatch()`), the event name will follow the `<controller>:<event>` pattern. Because of the `:`, you will have trouble accessing the arg value the regular way.

You can use the `_context` variable instead:

```js
// stories/Counter.stories.js
import Counter from '../templates/components/Counter.html.twig';
import { fn } from '@storybook/test';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    render: (args) => ({
        components: {Counter},
        template: twig`
        <twig:Counter :data-storybook-callbacks="_context['counter:increment']">
            Increase count
        </twig:Counter>
        `
    })
}

export const Default = {
    args: {
        'counter:increment': fn(),
    }
}
```

Note that even if it works for any kind of arg, it's not recommended to use arg names with characters not allowed in a Twig variable name.


## Multiple actions on the same element

Using multiple actions on the same element works fine with the short component syntax (i.e. `component: Button`).

But when using a custom template, things get a bit more complex. You have to output the action args in the `data-storybook-callbacks` attribute using multiple print nodes:

```js
import Toggle from '../templates/components/Toggle.html.twig';
import { fn } from '@storybook/test';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    render: (args) => ({
        components: {Toggle},
        template: twig`
        <twig:Toggle data-storybook-callbacks="{{ _context['toggle:enable'] }} {{ _context['toggle:disable'] }}" />
        `
    })
}

export const Default = {
    args: {
        'toggle:enable': fn(),
        'toggle:disable': fn(),
    }
}
```
