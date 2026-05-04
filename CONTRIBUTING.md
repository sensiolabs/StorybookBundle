# Contributing

This bundle is still in the early stage of development. Contributions are warmly welcomed.

You can contribute by giving feedback, opening issues, or creating pull requests.

## Configure Development Environment

Start by creating a fork of the repository on GitHub.

Then clone your fork, navigate to the project, and install PHP and JavaScript dependencies:

```shell
cd StorybookBundle
composer install
npm install
```

The JavaScript workspace supports npm, pnpm, Yarn, and Bun. npm is the baseline command used in examples because it is available with Node.js, but the root scripts also work through the other supported package managers:

```shell
npm install
pnpm install
yarn install
bun install
```

The repository intentionally commits one lockfile per supported package manager:

| Lockfile            | Package manager |
| ------------------- | --------------- |
| `package-lock.json` | npm             |
| `pnpm-lock.yaml`    | pnpm            |
| `yarn.lock`         | Yarn            |
| `bun.lock`          | Bun             |

These lockfiles are not duplicates. They verify that the same `package.json` dependency contract works with each supported installer, whose peer dependency resolution, package store, and workspace linking behavior differ.

Keep all committed lockfiles in sync when changing JavaScript dependencies:

```shell
npm run lock:update
```

The root scripts are expected to run through every supported manager:

```shell
npm run build
pnpm build
yarn build
bun run build
```

## Package Layout

The Composer package remains the Symfony bundle. The Storybook framework code lives in JavaScript workspace packages:

| Package            | Purpose                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `packages/shared`  | Shared renderer, Twig story helpers, Symfony command helpers, docs/source helpers, and preview utilities |
| `packages/vite`    | Vite Storybook framework package, published as `@sensiolabs/storybook-symfony-vite`                      |
| `packages/webpack` | Webpack Storybook framework package, published as `@sensiolabs/storybook-symfony-webpack`                |

`packages/shared` is internal to this repository. The Vite and Webpack packages inline the shared runtime in their built `dist/` output.

For a fuller explanation of the runtime model, package boundaries, generated config, sandbox modes, and verification workflow, read [`docs/architecture.md`](docs/architecture.md).

## Compile TypeScript Modules

Use the root build command before submitting a pull request:

```shell
npm run build
```

For focused package development, run a package-local watcher:

```shell
npm run build:watch --workspace packages/shared
npm run build:watch --workspace packages/vite
npm run build:watch --workspace packages/webpack
```

The committed `dist/` output is checked in CI. The freshness check is run from the canonical npm build leg, so regenerate `dist/` with `npm run build` before committing JavaScript source changes.

## Using The Sandbox

This repository provides a sandbox you can run to test the Storybook Symfony integration.

First navigate to the sandbox directory:

```shell
cd sandbox
```

Set up the sandbox for interactive development:

```shell
bin/setup-dev
```

This installs the bundle as a symlink, so PHP changes and compiled JavaScript changes are reflected in the sandbox dependencies.

Then run the Symfony server and Storybook:

```shell
symfony server:start --port 8000 --daemon --no-tls
npm run storybook
```

Now you can visit <http://localhost:6006> to use the sandbox while developing the bundle.

### Sandbox Components And Stories

The sandbox comes with two kinds of components/stories:

|                              | Components                       | Stories                | Usage                                                          |
| ---------------------------- | -------------------------------- | ---------------------- | -------------------------------------------------------------- |
| Symfony UX components        | `templates/components`           | `templates/components` | Symfony UX use cases such as component mocks and callbacks     |
| Storybook testing components | `templates/components/Storybook` | `template-stories`     | Storybook compatibility fixtures used by the integration tests |

The committed sandbox is npm-based because `sandbox/bin/setup-standalone` installs with npm. Generated user projects remain package-manager-aware through `bin/console storybook:init --package-manager=...`.

## Testing

### PHP

Run the PHP checks from the repository root:

```shell
composer validate --strict
vendor/bin/php-cs-fixer fix --dry-run --diff
vendor/bin/simple-phpunit
vendor/bin/phpstan analyse --memory-limit=1G
vendor/bin/phpactor worse:analyse . --ignore-failure
```

PHPactor is installed as an isolated Composer bin tool. Its dependency graph is intentionally separate from the bundle because PHPactor currently depends on older Symfony Console constraints than the bundle itself.

### JavaScript

For TypeScript modules, tests are written next to the tested module in a file named `<moduleName>.test.ts`.

Run workspace checks from the repository root:

```shell
npm run test
npm run lint
npm run format:check
```

The same root scripts are expected to work through pnpm, Yarn, and Bun:

```shell
pnpm test
yarn test
bun run test
```

### Storybook Integration Tests

Storybook integration tests use Storybook/Vitest via `@storybook/addon-vitest`. The deprecated `@storybook/test-runner` flow is no longer used.

#### Template Stories And Storybook Testing Components

We use adapted stories from the main Storybook repository to test the Symfony framework integration. Those stories are located in `sandbox/template-stories`:

| Sandbox location                       | Storybook repository location                         |
| -------------------------------------- | ----------------------------------------------------- |
| `template-stories/lib/preview-api`     | `storybook/code/lib/preview-api/template/stories`     |
| `template-stories/addons/<addon-name>` | `storybook/code/addons/<addon-name>/template/stories` |

The files may differ from the original ones to be compatible with this framework, but changes should be minimal and required for the Symfony integration. Those changes are indicated with a `@OVERRIDE` comment.

Some upstream behavioral and error-case fixtures are excluded from Storybook/Vitest with the `will-fail` tag. These are retained as compatibility references, not as passing smoke coverage.

See [Updating Template Stories](#updating-template-stories) for how those stories are maintained.

#### Running Tests With Sandbox In Development Mode

Given you have your sandbox running as described in [Using The Sandbox](#using-the-sandbox), run:

```shell
npm run test-storybook
```

This executes the Storybook/Vitest project defined in `sandbox/vitest.config.ts`.

#### Running Tests With Sandbox In CI Mode

To run the sandbox tests in a CI-like environment, first ensure the sandbox is not already running. Configure it with:

```shell
./sandbox/bin/setup-standalone
```

This exports the project to `sandbox/.bundle` and installs it in the sandbox dependencies as a raw copy. It intentionally runs `composer update` against the latest matching Symfony constraints, so it is slower and less deterministic than normal lockfile-based local development.

Then run:

```shell
./scripts/test-sandbox.sh
```

The script starts the Symfony server, runs Storybook/Vitest, and performs the sandbox build smoke check.

#### Updating Template Stories

You can update the current stories with the `update-sandbox-stories.sh` script:

```shell
scripts/update-sandbox-stories.sh # Update to the latest stable version from the Storybook repository
scripts/update-sandbox-stories.sh 10.3.5 # Update to a specific Storybook version
```

Review the changes carefully and restore required Symfony-specific overrides when upstream updates remove them. For example, the change below should be reverted if it does not pass the tests:

```diff
--- a/sandbox/template-stories/addons/actions/basics.stories.ts
+++ b/sandbox/template-stories/addons/actions/basics.stories.ts
@@ -93,8 +93,7 @@ export const Disabled = {
   args: { onClick: action('onCLick') },
   parameters: {
     actions: {
-      // @OVERRIDE typo
-      disable: true,
+      disabled: true,
     },
   },
 };
```

If some stories do not pass because of an incompatibility with the framework, either tag them with `will-fail` or patch the story. In both cases, indicate the change with an `@OVERRIDE` comment.

## Documentation

Documentation pages are located in the `docs/` directory.

The [`docs/features.md`](docs/features.md) file lists the current Storybook features that have been considered and their integration state. When applicable, the feature has a link to internal documentation in `docs/features` or `docs/addons`, depending on the topic.

Breaking changes for this modernization are documented in [`UPGRADE.md`](UPGRADE.md). Update it when a change affects existing users.
