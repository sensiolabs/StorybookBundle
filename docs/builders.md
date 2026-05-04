# Vite and Webpack Builders

The bundle supports two Storybook framework packages:

- `@sensiolabs/storybook-symfony-vite`
- `@sensiolabs/storybook-symfony-webpack`

Both packages use the same Symfony renderer. The difference is the Storybook builder used to compile and serve the preview application.

## Vite

Vite is the default generated setup:

```shell
bin/console storybook:init --builder=vite
```

Typical `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

const config: StorybookConfig = {
  stories: ["../templates/components/**/*.stories.[tj]s"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: {
    name: "@sensiolabs/storybook-symfony-vite",
    options: {
      symfony: {
        server: "http://localhost:8000",
        proxyPaths: ["/assets", "/_components"],
        additionalWatchPaths: ["assets"],
      },
    },
  },
};

export default config;
```

Use Vite when starting a new project, when using Storybook/Vitest browser tests, or when you do not need Webpack-specific loaders and plugins.

## Webpack

Webpack is available for projects that already rely on Storybook's Webpack 5 builder:

```shell
bin/console storybook:init --builder=webpack
```

Typical `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack";

const config: StorybookConfig = {
  stories: ["../templates/components/**/*.stories.[tj]s"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@sensiolabs/storybook-symfony-webpack",
    options: {
      symfony: {
        server: "http://localhost:8000",
        proxyPaths: ["/assets", "/_components"],
        additionalWatchPaths: ["assets"],
      },
    },
  },
};

export default config;
```

Use Webpack when your Storybook configuration needs Webpack loaders, plugins, aliases, or other Webpack-only behavior.

## Symfony Options

Both builders accept the same Symfony options:

| Option                 | Required         | Purpose                                                                                  |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `server`               | Development only | Base URL of the Symfony app used by Storybook to render Twig                             |
| `proxyPaths`           | No               | URL prefixes proxied from Storybook to Symfony, for example `/assets` and `/_components` |
| `additionalWatchPaths` | No               | Files, directories, or globs that should trigger preview recompilation                   |

`server` is not required for production `storybook build`; deployed static Storybook output should be served behind a reverse proxy that forwards Symfony render and asset requests to the Symfony application.

## Preview Types

Each framework package exports Storybook-compatible TypeScript types:

```ts
import type {
  StorybookConfig,
  Preview,
} from "@sensiolabs/storybook-symfony-vite";
```

Use the matching package for the selected builder:

```ts
import type {
  StorybookConfig,
  Preview,
} from "@sensiolabs/storybook-symfony-webpack";
```
