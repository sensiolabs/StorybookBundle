# Storybook For Symfony

[![Packagist Version](https://img.shields.io/packagist/v/sensiolabs/storybook-bundle?style=flat-square)](https://packagist.org/packages/sensiolabs/storybook-bundle)
[![Packagist Downloads](https://img.shields.io/packagist/dt/sensiolabs/storybook-bundle?style=flat-square)](https://packagist.org/packages/sensiolabs/storybook-bundle)
[![Vite Package](https://img.shields.io/npm/v/@sensiolabs/storybook-symfony-vite?label=vite%20package&style=flat-square)](https://www.npmjs.com/package/@sensiolabs/storybook-symfony-vite)
[![Webpack Package](https://img.shields.io/npm/v/@sensiolabs/storybook-symfony-webpack?label=webpack%20package&style=flat-square)](https://www.npmjs.com/package/@sensiolabs/storybook-symfony-webpack)
[![CI](https://github.com/sensiolabs/StorybookBundle/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/sensiolabs/StorybookBundle/actions/workflows/ci.yaml?query=branch%3Amain)
[![PHP](https://img.shields.io/badge/PHP-%3E%3D8.4-777bb4?style=flat-square)](https://www.php.net/supported-versions.php)
[![Symfony](https://img.shields.io/badge/Symfony-%5E8.0-000000?style=flat-square)](https://symfony.com/releases)
[![Storybook](https://img.shields.io/badge/Storybook-%5E10-ff4785?style=flat-square)](https://storybook.js.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20.19-43853d?style=flat-square)](https://nodejs.org/)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

Storybook for Symfony integrates Storybook 10 with Symfony and Twig Components. It renders Twig through Symfony, provides Storybook framework packages for Vite and Webpack, and includes sandbox and test workflows for maintaining the integration.

> [!IMPORTANT]
> This bundle is under active development. APIs and documented workflows may still change before a stable release.

## Quick Links

| I want to...                  | Start here                                    |
| ----------------------------- | --------------------------------------------- |
| Install the bundle            | [Installation](#installation)                 |
| Write the first story         | [Getting Started](docs/getting-started.md)    |
| Choose Vite or Webpack        | [Vite and Webpack Builders](docs/builders.md) |
| Configure Symfony rendering   | [Configuration](docs/configuration.md)        |
| Understand the repo layout    | [Architecture](docs/architecture.md)          |
| Run checks or use the sandbox | [Contributing](CONTRIBUTING.md)               |
| Migrate from an older version | [Upgrade Guide](UPGRADE.md)                   |

## Supported Stack

| Runtime    | Supported version |
| ---------- | ----------------- |
| PHP        | 8.4+              |
| Symfony    | 8.x               |
| Symfony UX | 3.x               |
| Storybook  | 10.x              |
| Node.js    | 20.19+            |
| Builders   | Vite, Webpack 5   |

## Table of Contents

1. [Installation](#installation)
2. [Composer and JavaScript Packages](#composer-and-javascript-packages)
3. [Builders](#builders)
4. [Package Managers and Lockfiles](#package-managers-and-lockfiles)
5. [Testing](#testing)
6. [Composer Performance](#composer-performance)
7. [Documentation](#documentation)
8. [Contributing and Support](#contributing-and-support)
9. [License](#license)
10. [References](#references)

## Installation

> [!NOTE]
> This version targets PHP 8.4+, Symfony 8, Symfony UX 3, Node.js 20.19+, and Storybook 10.

> [!WARNING]
> Upgrading from an older version is a breaking migration. Read the [upgrade guide](UPGRADE.md) before changing an existing project.

Install the Composer bundle:

```shell
composer require sensiolabs/storybook-bundle
```

Initialize Storybook. Vite is the default builder. The command detects the package manager from an existing lockfile when possible and falls back to npm.

```shell
bin/console storybook:init
```

Choose a builder or package manager explicitly when needed:

| Setup            | Command                                                              |
| ---------------- | -------------------------------------------------------------------- |
| Vite with npm    | `bin/console storybook:init --builder=vite --package-manager=npm`    |
| Vite with pnpm   | `bin/console storybook:init --builder=vite --package-manager=pnpm`   |
| Vite with Yarn   | `bin/console storybook:init --builder=vite --package-manager=yarn`   |
| Vite with Bun    | `bin/console storybook:init --builder=vite --package-manager=bun`    |
| Webpack with npm | `bin/console storybook:init --builder=webpack --package-manager=npm` |

This creates the Storybook configuration files and adds required dependencies to `package.json`.

Install the JavaScript dependencies:

| Package manager | Command        |
| --------------- | -------------- |
| npm             | `npm install`  |
| pnpm            | `pnpm install` |
| Yarn            | `yarn install` |
| Bun             | `bun install`  |

Start the Symfony server at the address configured in `.storybook/main.ts`, then run Storybook:

| Package manager | Command             |
| --------------- | ------------------- |
| npm             | `npm run storybook` |
| pnpm            | `pnpm storybook`    |
| Yarn            | `yarn storybook`    |
| Bun             | `bun run storybook` |

## Composer and JavaScript Packages

The Composer package remains `sensiolabs/storybook-bundle`. It provides the Symfony bundle, render endpoint, Twig sandboxing, component integration, and the `storybook:init` command.

| Path               | Package                                 | Audience     | Responsibility                                                              |
| ------------------ | --------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `src/`             | `sensiolabs/storybook-bundle`           | Symfony apps | Bundle services, render endpoint, Twig integration, mocks, and init command |
| `packages/shared`  | `@sensiolabs/storybook-symfony-shared`  | Internal     | Shared client renderer, Twig helpers, docs helpers, Symfony command helpers |
| `packages/vite`    | `@sensiolabs/storybook-symfony-vite`    | Consumers    | Storybook framework package for Vite                                        |
| `packages/webpack` | `@sensiolabs/storybook-symfony-webpack` | Consumers    | Storybook framework package for Webpack 5                                   |
| `sandbox/`         | Local app                               | Contributors | Integration and smoke-test application                                      |

> [!NOTE]
> Consumers install only the selected public builder package. The public Vite and Webpack packages inline the shared runtime in their built `dist/` files.

Generated projects use local file dependencies while developing from Composer:

| Builder | Local package dependency                                   |
| ------- | ---------------------------------------------------------- |
| Vite    | `file:vendor/sensiolabs/storybook-bundle/packages/vite`    |
| Webpack | `file:vendor/sensiolabs/storybook-bundle/packages/webpack` |

## Builders

`storybook:init` generates a Vite-based `.storybook/main.ts` using `@sensiolabs/storybook-symfony-vite`. Symfony itself does not require Webpack for Storybook rendering; the bundle renders Twig through Symfony over HTTP and uses the Storybook builder only for the preview app, docs, story modules, and dev-server integration.

| Builder | Use when...                                                                                  |
| ------- | -------------------------------------------------------------------------------------------- |
| Vite    | Starting a new project, using Storybook/Vitest browser tests, or using the generated default |
| Webpack | An existing setup depends on Webpack loaders, plugins, aliases, or Webpack-specific behavior |

> [!TIP]
> Vite is the default because it is ESM-native, faster for development, and required by Storybook's Vitest addon.

Generate a Webpack setup explicitly:

```shell
bin/console storybook:init --builder=webpack
```

Generated installs no longer include legacy empty or deprecated addon packages such as `@storybook/addon-essentials`, `@storybook/addon-links`, `@storybook/blocks`, or `@storybook/addon-interactions`. The old link addon sandbox stories were removed with that package set.

See [Vite and Webpack Builders](docs/builders.md) for full configuration examples and [Architecture](docs/architecture.md) for how the Composer bundle and JavaScript packages fit together.

## Package Managers and Lockfiles

The repo supports npm, pnpm, Yarn, and Bun for contributor workflows. `package.json` is the shared dependency contract and direct JavaScript dependencies are pinned exactly for stability.

> [!NOTE]
> Multiple lockfiles are committed on purpose. They verify that the same dependency contract installs cleanly with every supported package manager.

| Lockfile            | Package manager | Why it exists                         |
| ------------------- | --------------- | ------------------------------------- |
| `package-lock.json` | npm             | npm workspace resolution              |
| `pnpm-lock.yaml`    | pnpm            | pnpm peer dependency and store layout |
| `yarn.lock`         | Yarn            | Yarn lockfile resolution              |
| `bun.lock`          | Bun             | Bun lockfile resolution               |

Each package manager resolves peer dependencies, stores packages, and links workspaces differently.

For day-to-day work, install with whichever supported manager you are using:

```shell
npm install
pnpm install
yarn install
bun install
```

The root build, test, lint, and format scripts are manager-compatible:

| Task   | npm                    | pnpm                | Yarn                | Bun                    |
| ------ | ---------------------- | ------------------- | ------------------- | ---------------------- |
| Build  | `npm run build`        | `pnpm build`        | `yarn build`        | `bun run build`        |
| Test   | `npm run test`         | `pnpm test`         | `yarn test`         | `bun run test`         |
| Lint   | `npm run lint`         | `pnpm lint`         | `yarn lint`         | `bun run lint`         |
| Format | `npm run format:check` | `pnpm format:check` | `yarn format:check` | `bun run format:check` |

When JavaScript dependencies change, refresh all committed lockfiles before opening a pull request:

```shell
npm run lock:update
```

You can also refresh a single lockfile:

```shell
npm run lock:update:npm
npm run lock:update:pnpm
npm run lock:update:yarn
npm run lock:update:bun
```

> [!NOTE]
> Yarn 1 does not have a lockfile-only install mode, so `lock:update:yarn` runs a normal install with package scripts disabled.

Corepack is optional. It is a Node package-manager version shim for pnpm and Yarn, but CI installs package managers directly instead of requiring Corepack to be enabled.

## Testing

| Check                    | Command                                                |
| ------------------------ | ------------------------------------------------------ |
| JavaScript package tests | `npm run test`                                         |
| JavaScript lint          | `npm run lint`                                         |
| JavaScript formatting    | `npm run format:check`                                 |
| JavaScript build         | `npm run build`                                        |
| PHP package validation   | `composer validate --strict`                           |
| PHP coding standards     | `vendor/bin/php-cs-fixer fix --dry-run --diff`         |
| PHP static analysis      | `vendor/bin/phpstan analyse --memory-limit=1G`         |
| PHP tests                | `vendor/bin/simple-phpunit`                            |
| PHPactor diagnostics     | `vendor/bin/phpactor worse:analyse . --ignore-failure` |
| Sandbox smoke test       | `./scripts/test-sandbox.sh`                            |

Generated Vite projects use Storybook/Vitest via `@storybook/addon-vitest`:

```shell
npm run test-storybook
```

The generated script name follows the selected package manager's normal run syntax, for example `pnpm test-storybook`, `yarn test-storybook`, or `bun run test-storybook`.

> [!TIP]
> The integration test script also runs a static `storybook build` smoke check. Playwright is present as the browser provider for Vitest browser mode and may be used for small black-box smoke tests.

The sandbox excludes stories tagged `will-fail` from Storybook/Vitest. Those stories are retained as upstream behavioral and error-case fixtures, not as passing smoke coverage.

## Composer Performance

Composer can be slow for real reasons: dependency solving is CPU-heavy, downloads depend on network/cache state, archive extraction is I/O-bound, and Symfony Flex/scripts such as `cache:clear`, `assets:install`, and `importmap:install` boot real application code.

This repo's standalone sandbox is slower by design because it behaves like a fresh external app and runs against latest constraints. Use lockfile-based `composer install` for fast local development, and reserve fresh `composer update` runs for compatibility checks.

The sandbox uses npm in `sandbox/bin/setup-standalone`, so its Vitest config intentionally starts Storybook with `npm run storybook`. Generated project configs remain package-manager-aware through `storybook:init --package-manager=...`.

## Documentation

| Topic                     | Page                                               |
| ------------------------- | -------------------------------------------------- |
| Upgrade guide             | [UPGRADE.md](UPGRADE.md)                           |
| Getting started           | [docs/getting-started.md](docs/getting-started.md) |
| Architecture              | [docs/architecture.md](docs/architecture.md)       |
| Vite and Webpack builders | [docs/builders.md](docs/builders.md)               |
| Configuration             | [docs/configuration.md](docs/configuration.md)     |
| Storybook feature support | [docs/features.md](docs/features.md)               |
| Args processors           | [docs/args-processors.md](docs/args-processors.md) |
| Component mocks           | [docs/component-mock.md](docs/component-mock.md)   |
| Static Storybook builds   | [docs/static-build.md](docs/static-build.md)       |

Feature-specific pages:

- Stories: [Writing Stories](docs/features/csf-stories.md), [Docs](docs/features/docs.md), [Play Function](docs/features/play-function.md)
- Addons: [Actions](docs/addons/actions.md), [Interactions](docs/addons/interactions.md)

## Contributing and Support

| Need                 | Where to go                                              |
| -------------------- | -------------------------------------------------------- |
| Contributor workflow | [CONTRIBUTING.md](CONTRIBUTING.md)                       |
| Security reporting   | [.github/SECURITY.md](.github/SECURITY.md)               |
| Support guidance     | [.github/SUPPORT.md](.github/SUPPORT.md)                 |
| Code of Conduct      | [.github/CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md) |

Issues and pull requests should use the templates in `.github/`.

## License

MIT License (MIT): see [LICENSE](./LICENSE).

## References

- [Storybook](https://storybook.js.org/)
- [TwigComponent](https://symfony.com/bundles/ux-twig-component/current/index.html)
