# Docs

## Autodocs

> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-docs/autodocs)

Autodocs generates a complete documentation for all the stories of a component.

The feature must be enabled in `.storybook/main.ts`: 
```ts
// .storybook/main.ts

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack5";

const config: StorybookConfig = {
    // ...
    docs: {
        autodocs: "tag", // 👈 Enable autodocs
    },
};
export default config;
```

Then in stories, use the `autodocs` tag to generate the docs page automatically:

```js
// stories/Button.stories.js

export default {
    // ...
    tags: ['autodocs'], // 👈 Use autodocs
}
```

## MDX

> ✅ This feature works without additional configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-docs/mdx)

MDX is a mixed syntax between Markdown and JavaScript/JSX. In opposition to autodocs, they are used to write custom docs pages for stories: 

```mdxjs
// stories/Table.mdx

import {Meta, Primary, Controls, Story, Source, Canvas} from "@storybook/blocks";
import * as TableStories from './Table.stories';

<Meta of={TableStories} />

# Table

A table represents a structured list of data.

## Stories

### Default

<Canvas of={TableStories.Default} />

### Rounded

Use the `rounded` attribute to display a table with rounded corners.

<Canvas of={TableStories.Rounded} />
```

Be sure to include `.mdx` files in the story specifier of your `.storybook/main.ts` configuration:

```ts
// .storybook/main.ts

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack5";

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.mdx", // 👈 Include MDX files 
        "../stories/**/*.stories.[tj]s",
    ],
    
    // ...
};

export default config;
```

## Rendering Source Snippets

A powerful feature of docs pages is to display the source code used to render the component in a given story. 

Those source snippets are rendered with Twig `set` tags to configures template variables:

```twig
{# Example snippet #}

{% set columns = [
    'Product name',
    'Color'
] %}

{% set rows = [
    [
        'Apple MacBook Pro 17"',
        'Silver'
    ],
    [
        'Microsoft Surface Prop',
        'White'
    ]
] %}

<twig:Table :columns="columns" :rows="rows"/>
```

When your story uses [actions](../addons/actions.md), it uses a special `data-storybook-action` attribute to bind the action listener to the DOM. This attribute is removed from the source snippet, as it is only used internally by Storybook and not your component.
