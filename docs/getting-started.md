# Getting Started

After installing the bundle and its dependencies as described in [Installation](../README.md#installation), you can start writing stories.

This guide assumes a Symfony UX setup using the [LAST stack](https://symfony.com/doc/current/frontend.html) architecture (Live Components, AssetMapper, Stimulus, Twig Components) and Tailwind.

## Choose Story Locations

First choose where stories should live. Common approaches are:

1. Put all stories in a dedicated location, such as a root-level `stories` directory.
2. Put each story next to the component it describes, for example in `templates/components`.

This guide uses the second approach.

Update your `.storybook/main.ts` configuration file accordingly:

```ts
// .storybook/main.ts

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

const config: StorybookConfig = {
  stories: [
    // Configure the stories specifier here.
    "../templates/components/**/*.stories.[tj]s",
  ],
  // ...
};
export default config;
```

## Create Your First Story

Create an anonymous `Button` component with the following template:

```twig
{# templates/components/Button.html.twig #}

{% props
    variant = 'primary',
    size = 'md',
    label = 'Click me!'
%}

{% set button = cva({
    base: 'focus:ring-4 rounded-lg ',
    variants: {
        variant: {
            primary: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800',
            alternative: 'text-gray-900 focus:outline-none bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
        },
        size: {
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-5 py-3 text-base',
        }
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    }
}) %}

<button type="button" class="{{ button.apply({variant, size}, attributes.render('class')) }}" {{ attributes }}>
    {{ label }}
</button>

```

This component uses the [`cva`](https://symfony.com/bundles/ux-twig-component/current/index.html#component-with-complex-variants-cva) function to handle different variants for size and color.

Then create a story for this component:

```js
// templates/components/Button.stories.js

import Button from "./Button.html.twig";

export default {
  component: Button,
};

export const Default = {};
```

Run Storybook:

```shell
npm run storybook
```

Open <http://localhost:6006> to view the component:

![img.png](img/getting-started/button.png)

Next, add controls for the component props:

```js
// templates/components/Button.stories.js

import Button from "./Button.html.twig";

export default {
  component: Button,
};

export const Default = {
  args: {
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: {
      options: ["primary", "alternative"],
      control: { type: "radio" },
    },
    size: {
      options: ["lg", "md"],
      control: { type: "radio" },
    },
  },
};
```

You can now control the component props from the Storybook UI.

![button_controls.gif](img/getting-started/button_controls.gif)

## Interactions and Play Functions

Reuse the Button component to create a Counter that increases a value when clicked.

Storybook 10 exposes testing helpers from the `storybook/test` entrypoint. No separate interactions addon is required.

Add the Counter template and its Stimulus controller:

```twig
{# templates/components/Counter.html.twig #}

<div {{ attributes.defaults(stimulus_controller('counter')) }}>
    {% set label %}
        {%- block content 'Increase' -%}
    {% endset %}

    <twig:Button :label="label" {{ ...stimulus_action('counter', 'increment') }} />
    Counter: <span {{ stimulus_target('counter', 'count') }}>0</span>
</div>
```

```js
// assets/controllers/counter_controller.js

import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["count"];

  initialize() {
    this.count = 0;
  }

  countTargetConnected() {
    this.countTarget.innerHTML = this.count;
  }

  increment() {
    this.count++;
  }
}
```

Create a story for this component and add a play function:

```js
// templates/components/Counter.stories.js

import Counter from "./Counter.html.twig";
import { userEvent, within } from "storybook/test";

export default {
  component: Counter,
};

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button");

    await userEvent.click(button);
  },
};
```

Open the new story in the Storybook UI.

![counter_play_function.png](img/getting-started/counter_play_function.png)

The play function simulates a click on the button, but the counter still shows `0` because the controller does not update the HTML. An assertion makes that regression visible:

```js
import { userEvent, waitFor, within, expect } from "storybook/test";

// ...

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button");

    await userEvent.click(button);

    // Assert against the text rendered by the component.
    await waitFor(() => expect(canvasElement).toHaveTextContent("Counter: 1"));
  },
};
```

The assertion fails:

![counter_play_function_assert.png](img/getting-started/counter_play_function_assert.png)

Fix the bug in `counter_controller.js`:

```js
// assets/controllers/counter_controller.js

export default class extends Controller {
  // ...

  increment() {
    this.count++;
    // Update the count HTML.
    this.countTarget.innerHTML = this.count;
  }
}
```

Return to Storybook:

![counter_play_function_assert_fixed.png](img/getting-started/counter_play_function_assert_fixed.png)

The test now passes.

## Listen to Component Events

The Counter component now updates correctly. To let other components react to the increment action, dispatch an event from the controller.

Update the controller to dispatch an event:

```js
// assets/controllers/counter_controller.js

export default class extends Controller {
  // ...

  increment() {
    this.count++;
    this.countTarget.innerHTML = this.count;
    // Dispatch an increment event with the count value in the payload.
    this.dispatch("increment", { detail: { count: this.count } });
  }
}
```

Update the story to add a spy for the `counter:increment` event:

```js
// templates/components/Counter.stories.js

import { userEvent, waitFor, within, expect, fn } from "storybook/test";

// ...

export const Default = {
  args: {
    "counter:increment": fn(), // Create a spy listener for the event.
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button");

    await userEvent.click(button);

    await waitFor(() => expect(canvasElement).toHaveTextContent("Counter: 1"));

    // Assert that the event listener was called.
    await waitFor(() => expect(args["counter:increment"]).toHaveBeenCalled());
  },
};
```

The play function now verifies that the event was dispatched:

![counter_action_play_function.png](img/getting-started/counter_action_play_function.png)

The Actions panel shows the event payload:

![counter_action_event_details.png](img/getting-started/counter_action_event_details.png)
