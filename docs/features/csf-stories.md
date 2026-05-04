# Writing Stories in CSF

> ⚠️ This feature uses framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-stories)

Stories are written using the Storybook recommended [Component Story Format](https://storybook.js.org/docs/api/csf) (CSF).

JavaScript and TypeScript story files are supported through `.stories.js` and `.stories.ts`.

## Twig Templates in CSF

To render Twig from CSF, provide a Twig template through the story `component` or `render` configuration. There are several supported patterns.

### Using a component with automatic args binding

Use automatic binding when a story only needs to render one component:

```js
// stories/Button.stories.js
import Button from "../templates/components/Button.html.twig";

export default {
  component: Button,
};

export const Primary = {
  args: {
    btnType: "primary",
  },
};

export const Secondary = {
  args: {
    btnType: "secondary",
  },
};
```

All members of the `args` object are inlined and passed to the component. The story above generates a template like:

```twig
<twig:Button :btnType="btnType" />
```

### Using a Component in a Custom Template

Use a custom Twig template when a story needs more control over how args are rendered:

```js
// stories/Button.stories.js
import Button from "../templates/components/Button.html.twig";
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  render: (args) => ({
    components: { Button }, // This is recommended so your component can be hot reloaded
    template: twig`
            <twig:Button :btnType="primary ? 'primary' : 'secondary'">
                {{ label }}
            </twig:Button>
        `,
  }),
};

export const Primary = {
  args: {
    primary: true,
    label: "Button",
  },
};

export const Secondary = {
  args: {
    ...Primary.args,
    primary: false,
  },
};

export const SearchButton = {
  // Template can be overridden at story level.
  component: twig`
        <twig:Button>
            <twig:ux:icon name="flowbite:search-outline" />
        </twig:Button>
    `,
};
```

### Using a raw template

You can also provide a raw Twig template as a component when the story does not render a Twig component:

```js
// stories/Button.stories.js
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  component: twig`<button type="button">{{ label }}</button>`,
};

export const Default = {
  args: {
    label: "Button",
  },
};
```

### Referring to args in the template

Args are passed in the root context of the story when the template is rendered. That means you can use them with their original name in your story template.

Args can use JavaScript object keys that are not valid Twig variable names.

Consider the following story:

```js
import Button from "../templates/components/Button.html.twig";
import { twig } from "@sensiolabs/storybook-symfony-vite";

export default {
  render: (args) => ({
    components: { Button },
    template: twig`
            <twig:Button :btnType="is-primary ? 'primary' : 'secondary'">
                {{ button:label }}
            </twig:Button>
        `,
  }),
};

export const Default = {
  args: {
    "is-primary": true,
    "button:label": "Button",
  },
};
```

The template provided in the `render` function is invalid because Twig cannot parse variable names like `is-primary` or `button:label`.

Use the `_context` variable to access those parameters:

```js
export default {
  render: (args) => ({
    components: { Button },
    template: twig`
            <twig:Button :btnType="_context['is-primary'] ? 'primary' : 'secondary'">
                {{ _context['button:label'] }}
            </twig:Button>
        `,
  }),
};
```

Avoid this naming style in stories when possible. JavaScript allows these object keys, but generated source snippets in [Docs](./docs.md#rendering-source-snippets) can contain invalid Twig variable names.

The common exception is [action attributes](../addons/actions.md#actions), where event names often include `:`.
