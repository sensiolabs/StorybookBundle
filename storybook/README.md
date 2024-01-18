# Storybook Symfony Framework

## Usage

Currently, in development mode only.

From your main project with Storybook installed, update your `main.ts|js` file:

```ts
import type { StorybookConfig } from '@storybook/symfony-webpack5';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.[tj]s'],
    addons: [
        // Your addons
        '@storybook/addon-links',
        '@storybook/addon-essentials',
    ],
    framework: {
        // 👇 Here tell storybook to use the Symfony framework
        name: '@storybook/symfony-webpack5',
        options: {
            builder: {
                useSWC: true,
            },
            // 👇 Here configure the framework
            symfony: {
                server: 'https://localhost:8000', // This is mandatory, the URL of your Symfony dev server
                proxyPaths: [
                    // Setup here paths to resolve your assets
                    '/assets',
                ],
            },
        },
    },
    docs: {
        autodocs: 'tag',
    },
};

export default config;
```
