# Docs

## Autodocs

> ✅ This feature works without framework-specific configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-docs/autodocs)

Autodocs generates documentation for a component's stories.

Enable it in `.storybook/main.ts`:

```ts
// .storybook/main.ts

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

const config: StorybookConfig = {
  // ...
  docs: {
    autodocs: "tag", // Enable autodocs.
  },
};
export default config;
```

Then use the `autodocs` tag in stories to generate the docs page automatically:

```js
// stories/Button.stories.js

export default {
  // ...
  tags: ["autodocs"], // Use autodocs.
};
```

## MDX

> ✅ This feature works without additional configurations

> [Storybook Documentation](https://storybook.js.org/docs/writing-docs/mdx)

MDX combines Markdown with JavaScript/JSX and is useful for custom documentation pages:

```mdxjs
// stories/Table.mdx

import {Meta, Primary, Controls, Story, Source, Canvas} from "@storybook/addon-docs/blocks";
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

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx", // Include MDX files.
    "../stories/**/*.stories.[tj]s",
  ],

  // ...
};

export default config;
```

## Rendering Source Snippets

Docs pages can display the source code used to render a component in a story.

Source snippets are rendered with Twig `set` tags to configure template variables:

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
