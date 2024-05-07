# Writing Stories in CSF

> ⚠️ This feature uses framework-specific configurations


> [Storybook Documentation](https://storybook.js.org/docs/writing-stories)

Stories are written using the Storybook recommended [Component Story Format](https://storybook.js.org/docs/api/csf) (CSF).

> Currently, only JavaScript is supported.

## Twig templates in CSF 

To make your stories work with Twig, you have to provide a twig template in the `component` member of the story. There are multiple ways to achieve this.

### Using a component with automatic args binding

If you just want to render a single component, you can use automatic binding: 

```js
// stories/Button.stories.js
import Button from '../templates/components/Button.html.twig';

export default {
    component: Button
}

export const Primary = {
    args: {
        btnType: 'primary',
    }
}

export const Secondary = {
    args: {
        btnType: 'secondary'
    }
}
```

This way, all members of the `args` object will be inlined and passed to your component. The story above will generate a template like: 

```twig
<twig:Button :btnType="btnType" />
```

### Using a component in custom template

If you have to customize the way story args are used to render your component, you can define a Twig template for your story: 

```js
// stories/Button.stories.js
import Button from '../templates/components/Button.html.twig';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    render: (args) => ({
        components: {Button}, // This is recommended so your component can be hot reloaded
        template: twig`
            <twig:Button :btnType="primary ? 'primary' : 'secondary'">
                {{ label }}
            </twig:Button>
        `
    })
};

export const Primary = {
    args: {
        primary: true,
        label: 'Button',
    },
};

export const Secondary = {
    args: {
        ...Primary.args,
        primary: false
    },
};

export const SearchButton = {
    // 👇 Template can be overriden at story level 
    component: twig`
        <twig:Button>
            <twig:ux:icon name="flowbite:search-outline" />
        </twig:Button>
    `
}

```

### Using a raw template

Finally, you can also provide a raw Twig template as a component, for example if you don't want to render a Twig component:

```js
// stories/Button.stories.js
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    component: twig`<button type="button">{{ label }}</button>`
};

export const Default = {
    args: {
        label: 'Button',
    },
};
```

### Referring to args in the template

Args are passed in the root context of the story when the template is rendered. That means you can use them with their original name in your story template.

However, you can name args the way you want, with some characters that are not allowed in a Twig variable name. 

Consider the following story: 

```js
import Button from '../templates/components/Button.html.twig';
import { twig } from '@sensiolabs/storybook-symfony-webpack5';

export default {
    render: (args) => ({
        components: {Button},
        template: twig`
            <twig:Button :btnType="is-primary ? 'primary' : 'secondary'">
                {{ button:label }}
            </twig:Button>
        `
    })
};

export const Default = {
    args: {
        'is-primary': true,
        'button:label': 'Button',
    },
};
```

The template provided in the `render` function is invalid, because Twig can not parse variable names like `is-primary` or `button:label`.

You could instead use the `_context` variable to access those parameters: 

```js
export default {
    render: (args) => ({
        components: {Button},
        template: twig`
            <twig:Button :btnType="_context['is-primary'] ? 'primary' : 'secondary'">
                {{ _context['button:label'] }}
            </twig:Button>
        `
    })
};
```

But in a general way, it is **not recommended** to use a such naming in your stories, even if the JavaScript object declaration permits it, because code snippets generated in [Docs](./docs.md#rendering-source-snippets) pages will dump wrong variable names.

The only place you would legally use this method is in the [action attributes](../addons/actions.md#actions).
