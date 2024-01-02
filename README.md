# Storybook For Symfony

This bundle provides a basic integration for Storybook into a Symfony application using Twig Components.

> WARNING: this is NOT ready to use

## Installation

Clone this repo and install the bundle in your project.

Install Storybook in your project:

```shell
yarn add @storybook/cli 
yarn run sb init -t server
```

Add the bundled NPM package for Symfony integration:

```shell
yarn add link:vendor/sensiolabs/storybook-bundle/storybook
```

Remove the auto generated `src/stories` directory, and replace the content of `.storybook/main.js|ts` with: 

```ts
import type { StorybookConfig } from "@storybook/symfony-webpack5";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.[tj]s"],
    addons: [
        // Your addons
        "@storybook/addon-links",
        "@storybook/addon-essentials",
    ],
    framework: {
        // 👇 Here tell storybook to use the Symfony framework  
        name: "@storybook/symfony-webpack5",
        options: {
          builder: {
              useSWC: true
          },
          // 👇 Here configure the framework
          symfony: {
              server: 'https://localhost:8000', // This is mandatory, the URL of your Symfony dev server
              proxyPaths: [ // Setup here paths to resolve your assets
                  '/assets'
              ]
          }
        },
    },
    docs: {
        autodocs: "tag",
    },
};
export default config;
```

Initialize Storybook bundle with:

```shell
bin/console storybook:init
```

Run Storybook with:
```shell
yarn run storybook
```

## Symfony configuration

### CORS

As the Symfony integration relies on the Storybook's server renderer, it makes requests to your Symfony server to render Twig components. These requests are cross origins, so you have to configure Symfony to accept them from your Storybook instance.

There is two options to achieve this. You can either configure the Storybook host in the bundle, or use the popular NelmioCORS bundle. 

In the bundle: 

```yaml
# config/storybook.yaml
storybook: 
  server: http://localhost:6006
```

With NelmioCORS:
```yaml
# config/storybook.yaml
storybook: 
  server: null # Disable CORS management in Storybook Bundle
```

```yaml
# config/nelmio_cors.yaml
nelmio_cors:
  # ...
  paths:
    '^/_storybook': 
      allow_origin: ['http://localhost:6006']
      allow_methods: ['GET']
```

### Global assets

To import global assets in the Storybook's preview iframe, you have to declare a custom template that acts like your usual `base.html.twig`, but for Storybook. First create the template:

```twig
{# templates/storybook/preview.html.twig #}

{% extends '@Storybook/preview.html.twig' %}

{% block stylesheets %}
  <link rel="stylesheet" href="{{ asset('styles/app.css') }}">
{% endblock %}

{% block javascripts %}
  {{ importmap() }}
{% endblock %}
```

Then tell the bundle it should use this file to render the preview:
```yaml
# config/storybook.yaml
storybook:
   preview_template: storybook/preview.html.twig 
```

And generate the preview:
```shell
bin/console storybook:init
```

> Important:
> 
> For the moment, you have to run `bin/console storybook:init` each time you update those global assets.  

## Writing stories

Example: 

```js
import { twig } from '@storybook/symfony-webpack5';

const Button = twig`<twig:Button>{{ args.label }}</twig:Button>`;

export default {
    title: 'Bar',
    component: Button
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
    component: Button, // You can pass a specific component for a story
};

```
# License

MIT License (MIT): see [LICENSE](./LICENSE).

# References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
