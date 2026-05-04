# @sensiolabs/storybook-symfony-vite

Vite framework package for `sensiolabs/storybook-bundle`.

This is the default Storybook 10 integration. Symfony still renders Twig over the bundle render endpoint; Vite runs the Storybook preview environment, dev server, HMR, and Storybook/Vitest test flow.

Most users should install the Composer bundle and run:

```shell
bin/console storybook:init --builder=vite
```

That command writes the Storybook config and points the project at this package. In Composer path installs it uses:

```json
"@sensiolabs/storybook-symfony-vite": "file:vendor/sensiolabs/storybook-bundle/packages/vite"
```

Use this package directly only when publishing or developing the JavaScript framework package itself.

## Configuration

```ts
import type { StorybookConfig } from '@sensiolabs/storybook-symfony-vite';

const config: StorybookConfig = {
    stories: ['../templates/components/**/*.stories.[tj]s'],
    addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
    framework: {
        name: '@sensiolabs/storybook-symfony-vite',
        options: {
            symfony: {
                server: 'http://localhost:8000',
                proxyPaths: ['/assets', '/_components'],
                additionalWatchPaths: ['assets'],
            },
        },
    },
};

export default config;
```

The `symfony.server` option is required while running Storybook in development because the preview sends Twig render requests to Symfony. It can be omitted for production builds when the deployed static Storybook is served behind a reverse proxy to Symfony.

## Exported Types

```ts
import type { StorybookConfig, Preview } from '@sensiolabs/storybook-symfony-vite';
```

Use `StorybookConfig` in `.storybook/main.ts` and `Preview` in `.storybook/preview.ts`.

## Development

From the repository root:

```shell
npm run build --workspace packages/vite
npm run test --workspace packages/vite
```

The package consumes shared internals from `packages/shared` during development. Published output in `dist/` inlines those internals, so consumers do not install the shared package.
