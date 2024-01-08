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
// .storybook/main.ts

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

## AssetMapper integration

To use Storybook with a project that uses the [AssetMapper component](https://symfony.com/doc/current/frontend/asset_mapper.html), you have to enable the integration in your `main.js|ts` file: 

```ts
// .storybook/main.ts

const config: StorybookConfig = {
    framework: {
        name: "@storybook/symfony-webpack5",
        options: {
            symfony: {
                // 👇 Here enable AssetMapper integration
                useAssetMapper: true
            }
        },
    },
};
export default config;
```

Now, before your stories are compiled by Storybook, a virtual `importmap` JS module is generated to import all assets declared in your `importmap.php` file. 

To actually load this module in the Storybook preview, you have to import it in your `preview.js|ts` file:

```ts
// .storybook/preview.ts

import '../importmap';

// ...
```

## Writing stories

Example: 

```js
// stories/Button.stories.js

import { twig } from '@storybook/symfony-webpack5';

const Button = twig`<twig:Button btnType="{{ args.primary ? 'primary' : 'secondary' }}">{{ args.label }}</twig:Button>`;

export default {
    title: 'Button',
    template: Button
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
    template: Button, // You can pass a specific template for a story
};

```

# License

MIT License (MIT): see [LICENSE](./LICENSE).

# References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
