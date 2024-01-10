# Storybook For Symfony

This bundle provides a basic integration for Storybook into a Symfony application using Twig Components.

> WARNING: this is NOT ready to use

## Installation

Clone this repo and install the bundle in your project.

Install Storybook in your project:

```shell
yarn add -D @storybook/cli @storybook/addon-essentials @storybook/addon-links @storybook/blocks react react-dom 
```

Add the bundled NPM package for Symfony integration:

```shell
yarn add -D @sensiolabs/storybook-symfony-webpack5@file:vendor/sensiolabs/storybook-bundle/storybook
```

Create storybook configuration in `.storybook/`: 

```ts
// .storybook/main.ts

import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack5";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.[tj]s"],
    addons: [
        // Your addons
        "@storybook/addon-links",
        "@storybook/addon-essentials",
    ],
    framework: {
        // 👇 Here tell storybook to use the Symfony framework  
        name: "@sensiolabs/storybook-symfony-webpack5",
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

```ts
// .storybook/preset.ts

import { Preview } from '@storybook/server';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;

```

Register the route for Storybook in your symfony project:

```yaml
# config/routes/storybook.yaml

storybook:
  resource: '@StorybookBundle/config/routes.php'
```

Run Storybook with:
```shell
yarn run sb dev -p 6006
```

Additionally, you can add custom scripts to your `package.json` file: 

```json
{
    "scripts": {
        "storybook": "sb dev -p 6006",
        "build-storybook": "sb build"
    }
}
```

## Symfony configuration

### CORS

As the Symfony integration relies on the Storybook's server renderer, it makes requests to your Symfony server to render Twig components. These requests are cross origins, so you have to configure Symfony to accept them from your Storybook instance.

There is two options to achieve this. You can either configure the Storybook host in the bundle, or use the popular [NelmioCorsBundle](https://symfony.com/bundles/NelmioCorsBundle/current/index.html). 

In the StorybookBundle: 

```yaml
# config/storybook.yaml
storybook: 
  server: http://localhost:6006
```

With NelmioCorsBundle:
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
        name: "@sensiolabs/storybook-symfony-webpack5",
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

import { twig } from '@sensiolabs/storybook-symfony-webpack5';

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
# Troubleshooting

## Conflicting `string-width` module

When you install storybook, you might encounter the following warnings:

```
warning Pattern ["string-width-cjs@npm:string-width@^4.2.0"] is trying to unpack in the same destination "/home/john/.cache/yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
warning Pattern ["strip-ansi-cjs@npm:strip-ansi@^6.0.1"] is trying to unpack in the same destination "/home/john/.cache/yarn/v6/npm-strip-ansi-cjs-6.0.1-9e26c63d30f53443e9489495b2105d37b67a85d9-integrity/node_modules/strip-ansi-cjs" as pattern ["strip-ansi@^6.0.0"]. This could result in non-deterministic behavior, skipping.
warning Pattern ["string-width@^4.1.0"] is trying to unpack in the same destination "/home/john/.cache/yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
```


When trying to run storybook, if you get the following error:
```
🔴 Error: It looks like you are having a known issue with package hoisting.
Please check the following issue for details and solutions: https://github.com/storybookjs/storybook/issues/22431#issuecomment-1630086092


/home/john/Projects/storybook/node_modules/cli-table3/src/utils.js:1
const stringWidth = require('string-width');
                    ^

Error [ERR_REQUIRE_ESM]: require() of ES Module /home/john/Projects/storybook/node_modules/string-width/index.js from /home/john/Projects/storybook/node_modules/cli-table3/src/utils.js not supported.

```

Then you have to clean the yarn cache for the conflicting module and reinstall: 

```
yarn cache clean string-width-cjs@npm:string-width@^4.2.0
rm -rf node_modules yarn.lock
yarn install --force
```

# License

MIT License (MIT): see [LICENSE](./LICENSE).

# References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
