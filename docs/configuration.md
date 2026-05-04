# Configuration

## Twig Rendering

### How It Works

Storybook controls component rendering from the browser. Templates are generated **at runtime** from args, loaders, decorators, and story configuration. The generated template is sent to Symfony in an HTTP POST request with a JSON body containing the story template and args.

To render stories, the bundle configures Twig with a **dedicated loader and cache**. The main Twig environment stays unchanged, so Storybook rendering does not interfere with the application templates.

```mermaid
sequenceDiagram
    title Symfony Renderer
    Storybook Manager->>Storybook Preview: Render story "my-story"
    activate Storybook Preview
    Storybook Preview->>Storybook Preview: Generate Twig template and args
    Storybook Preview->>Symfony App: POST /_storybook/render/my-story
    activate Symfony App
    Note over Storybook Preview,Symfony App: Body: <br/>template: "<twig:Button :btnType="btnType"/>"<br/>args: { "btnType: "primary" }
    Symfony App-->>Storybook Preview: HTML for "my-story"
    deactivate Symfony App
    Storybook Preview->>Storybook Preview: Merge rendered HTML in viewport
    Storybook Preview-->>Storybook Manager: Simulate page load
    deactivate Storybook Preview
```

### Twig Sandboxing

Story templates are rendered in a **sandboxed environment**. Because the bundle turns the Symfony application into a remote Twig renderer, it controls what story templates are allowed to render.

The sandbox works like the [built-in Twig sandbox](https://twig.symfony.com/doc/3.x/tags/sandbox.html), but only applies to code sent by Storybook. Templates owned by the Symfony application are considered **trusted**.

By default, the following Twig elements are allowed in stories:

- The `component` function
- The `component` tag
- The `escape` filter

You can configure the sandbox to allow more elements in the bundle configuration:

```yaml
# config/packages/storybook.yaml
storybook:
  sandbox:
    allowedTags:
      - if
    allowedFilters:
      - length

when@dev:
  storybook:
    sandbox:
      allowedFunctions:
        - dump
```

### The Preview Iframe

When Storybook compiles stories, it also prepares the HTML document used by the preview iframe. This document contains the scripts and styles required by Storybook features.

To customize the iframe, you can override the preview template provided by the bundle:

```twig
{# templates/bundles/@StorybookBundle/preview.html.twig #}

{% extends '@!Storybook/preview.html.twig' %}

{% block previewHead %}
    {# render additional tags to <head> #}
{% endblock %}

{% block previewBody %}
    {# render additional tags to <body> #}
{% endblock %}
```

The rendered content of these blocks is injected into the preview iframe, similar to Storybook's [previewHead](https://storybook.js.org/docs/configure/story-rendering#adding-to-head) and [previewBody](https://storybook.js.org/docs/configure/story-rendering#adding-to-body) configuration.

## Symfony UX packages

### Live Components

To use [Live Components](https://symfony.com/bundles/ux-live-component/current/index.html) in Storybook, enable proxying for Live Component requests in the Storybook `main.ts` or `main.js` configuration:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
  framework: {
    name: "@sensiolabs/storybook-symfony-vite",
    options: {
      // ...
      symfony: {
        proxyPaths: [
          // ...
          // This is the Live Component route prefix usually set in config/routes/ux_live_component.yaml.
          "/_components",
        ],
      },
    },
  },
};
```

With this configuration, Live Component re-render requests are sent to the Symfony application.

### AssetMapper

To use Storybook with a project that uses the [AssetMapper component](https://symfony.com/doc/current/frontend/asset_mapper.html), you need to render your importmap in the preview template:

```twig
{# templates/bundles/@StorybookBundle/preview.html.twig #}

{% extends '@!Storybook/preview.html.twig' %}

{% block previewHead %}
    {{ importmap('app') }}
{% endblock %}
```

Standard HMR does not cover AssetMapper files. To register additional paths and re-trigger iframe compilation on change, update your `main.ts` or `main.js` configuration:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
  framework: {
    name: "@sensiolabs/storybook-symfony-vite",
    options: {
      // ...
      symfony: {
        // Add more paths to watch.
        additionalWatchPaths: [
          "assets", // Directories
          "assets/app.js", // Files
          "assets/**/*.js", // Glob patterns
        ],
      },
    },
  },
};
```

### StimulusBundle

Stimulus controllers are automatically imported with AssetMapper and the importmap directive. They will be loaded in the preview iframe thanks to the AssetMapper configuration described above.

To enable HMR for Stimulus controllers, ensure they are watched in your `additionalWatchPaths` config key.

### TailwindBundle

If you use [TailwindBundle](https://symfony.com/bundles/TailwindBundle/current/index.html) to manage CSS, configure Storybook to watch the built CSS file so the preview refreshes when it changes:

```ts
// .storybook/main.ts

// ...

const config: StorybookConfig = {
  framework: {
    name: "@sensiolabs/storybook-symfony-vite",
    options: {
      // ...
      symfony: {
        additionalWatchPaths: [
          // ...
          "var/tailwind/tailwind.built.css",
        ],
      },
    },
  },
};
```

## Configuration Reference

### Storybook Bundle

```yaml
# config/packages/storybook.yaml

storybook:
  # Cache base directory for story rendering.
  # Set false to disable caching.
  cache: "%kernel.cache_dir%/storybook/twig"

  # Configure the sandbox for Twig rendering.
  sandbox:
    # Functions that are allowed in stories.
    allowedFunctions: []

    # Tags that are allowed in stories.
    allowedTags: []

    # Filters that are allowed in stories.
    allowedFilters: []

  # Properties that are allowed in stories.
  allowedProperties:
    App\MyVariable: ["foo", "bar"]

  # Methods that are allowed in stories.
  allowedMethods:
    App\MyVariable: ["someMethod", "getBaz"]
```

### Storybook Framework

The examples below use Vite because it is the default generated builder. Webpack accepts the same `symfony` options; only the imported type and `framework.name` change.

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@sensiolabs/storybook-symfony-vite";

/**
 * Main Storybook configuration.
 */
const config: StorybookConfig = {
  /**
   * Stories specifier.
   *
   * @see https://storybook.js.org/docs/configure#configure-your-storybook-project
   */
  stories: [
    "../templates/components/**/*.mdx",
    "../templates/components/**/*.stories.[tj]s",
  ],

  /**
   * Addons configuration.
   *
   * @see https://storybook.js.org/docs/configure#configure-your-storybook-project
   */
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],

  framework: {
    // Tell Storybook to use the Symfony framework.
    name: "@sensiolabs/storybook-symfony-vite",
    options: {
      /**
       * Symfony framework options.
       *
       * These options only apply to the dev environment.
       */
      symfony: {
        /**
         * Mandatory, the URL of the Symfony development server.
         *
         * @var string
         */
        server: "http://localhost:8000",

        /**
         * URLs that should be proxied to the Symfony server.
         *
         * Useful to resolve assets and re-render LiveComponents.
         *
         * @var string[]
         */
        proxyPaths: ["/assets", "/_components"],

        /**
         * Additional paths where changes should re-trigger compilation.
         *
         * Use this if your stories depend on modules that are not part
         * of the JavaScript compilation (e.g. with AssetMapper and TailwindBundle).
         *
         * @var string[]
         */
        additionalWatchPaths: ["assets", "var/tailwind/tailwind.built.css"],
      },
    },
  },
};

export default config;
```

For Webpack:

```ts
// .storybook/main.ts
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
        additionalWatchPaths: ["assets", "var/tailwind/tailwind.built.css"],
      },
    },
  },
};

export default config;
```

The Vite and Webpack packages export matching `StorybookConfig` and `Preview` types. Import them from the package selected by `framework.name`.

See [Vite and Webpack Builders](builders.md) for builder choice guidance and production-build notes.
