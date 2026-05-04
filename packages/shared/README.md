# @sensiolabs/storybook-symfony-shared

Internal shared package for the Symfony Storybook framework packages.

This package is private to the repository. Consumers should install one public builder package instead:

- `@sensiolabs/storybook-symfony-vite`
- `@sensiolabs/storybook-symfony-webpack`

## Responsibilities

`packages/shared` contains code used by both builders:

- client-side story rendering and args handling
- Twig story helpers
- docs/source sanitizing helpers
- Symfony command helpers
- Twig component resolution
- preview HTML injection helpers
- file watching helpers

The public Vite and Webpack packages import this package during development and inline the built runtime into their own `dist/` output. Published consumers do not need a dependency on this package.

## Development

From the repository root:

```shell
npm run build --workspace packages/shared
npm run test --workspace packages/shared
```

When changing shared source, rebuild all packages before committing:

```shell
npm run build
```

The Vite and Webpack `dist/` output depends on the shared package, so a shared source change normally affects multiple package directories.
