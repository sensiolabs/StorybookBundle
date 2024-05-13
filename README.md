# Storybook For Symfony

This bundle provides a basic integration for Storybook into a Symfony application using Twig Components.

> DISCLAIMER: \
> This bundle is under active development. Some features may not work as expected and the current documentation may be incomplete.

## Table of Content

1. [Installation](#installation)
2. [Getting Started](docs/getting-started.md)
3. [Configuration](docs/configuration.md)
   1. [Twig Rendering](docs/configuration.md#twig-rendering)
   2. [Symfony UX Packages](docs/configuration.md#symfony-ux-packages)
   3. [Configuration Reference](docs/configuration.md#configuration-reference)
4. [Storybook Features](docs/features.md)
   1. Stories
      1. [Writing Stories](docs/features/csf-stories.md)
      2. [Docs](docs/features/docs.md)
      3. [Play Function](docs/features/play-function.md)
   2. Addons
      1. [Actions](docs/addons/actions.md)
      2. [Interactions](docs/addons/interactions.md)
5. [Args Processors](docs/args-processors.md)
6. [Component Mock](docs/component-mock.md)
7. [Static Build](docs/static-build.md)

## Installation

To install the bundle into your project run:

```shell
composer require sensiolabs/storybook-bundle
```

Initialize Storybook in your project:

```shell
bin/console storybook:init
```

This will create basic configuration files and add required dependencies to your `package.json`.  

Install new dependencies with: 
```shell
npm install
```

Ensure your Symfony server is running on the same address defined in your `main.ts` configuration file. Then run the Storybook dev server with:

```shell
npm run storybook
```

# License

MIT License (MIT): see [LICENSE](./LICENSE).

# References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
