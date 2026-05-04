# Upgrade Guide

This branch is a breaking modernization release. It targets PHP 8.4+, Symfony 8, Symfony UX 3, Node.js 20.19+, and Storybook 10.

## Platform Requirements

- PHP 8.1, 8.2, and 8.3 are no longer supported. Use PHP 8.4 or newer.
- Symfony 6.4 and 7.x are no longer supported. Use Symfony 8.
- Symfony UX Twig Component and Live Component must be upgraded to `^3.0`.
- Node.js must be 20.19 or newer.
- Storybook is pinned to `10.3.5` in generated setups.

## Storybook Packages

The JavaScript integration is now split by builder:

- Vite: `@sensiolabs/storybook-symfony-vite`
- Webpack: `@sensiolabs/storybook-symfony-webpack`

The previous `@sensiolabs/storybook-symfony-webpack5` package name and `storybook/` package directory are replaced by the new workspace layout:

- `packages/shared`
- `packages/vite`
- `packages/webpack`

Generated Composer-local file dependencies now point to:

- `file:vendor/sensiolabs/storybook-bundle/packages/vite`
- `file:vendor/sensiolabs/storybook-bundle/packages/webpack`

## Generated Configuration

`storybook:init` defaults to Vite:

```shell
bin/console storybook:init
```

Use Webpack explicitly if your project still depends on Webpack-specific Storybook loaders, plugins, or custom configuration:

```shell
bin/console storybook:init --builder=webpack
```

The command also supports generated install/run instructions for npm, pnpm, Yarn, and Bun:

```shell
bin/console storybook:init --builder=vite --package-manager=pnpm
```

When `--package-manager` is omitted, the command detects an existing lockfile and falls back to npm.

## Removed Legacy Addons

Generated installs no longer include Storybook 8-era empty or deprecated addon packages such as `@storybook/addon-essentials`, `@storybook/addon-links`, `@storybook/blocks`, and `@storybook/addon-interactions`.

Docs blocks should be imported from `@storybook/addon-docs/blocks`. Link addon sandbox stories were removed with the legacy addon package; use Storybook 10 APIs and project-local navigation patterns instead.

## Testing Changes

The default story test flow is now Storybook/Vitest through `@storybook/addon-vitest`. The deprecated `@storybook/test-runner` path has been removed from the modern setup.

The sandbox keeps some upstream behavioral/error-case stories tagged with `will-fail`. These are excluded from the Storybook/Vitest suite because they intentionally exercise failing or incompatible behavior rather than passing smoke coverage.

## Sandbox Setup

The standalone sandbox intentionally runs `composer update` against the latest matching Symfony constraints. This is useful for compatibility testing, but slower and less deterministic than lockfile-based local development.

For normal development, use lockfile-based installs. Treat the standalone sandbox as a fresh-latest compatibility check.
