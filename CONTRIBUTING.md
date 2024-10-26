# Contributing

This bundle is still in the early stage of development. Contributions are warmly welcomed!

You can contribute by giving us some feedback and/or creating pull requests.

## Configure development environment

Start by creating a fork of the repository on GitHub.

Then clone your fork, navigate to the project, and install PHP and JavaScript dependencies:

```shell
cd storybook-bundle
composer install
cd storybook
yarn install
```

## Compile TypeScript modules

To compile TypeScript modules during the development process, use the `yarn build:watch` command. 

Before submitting a pull request, you have to build the modules using `yarn build` instead. This will clean and output "production-ready" JavaScript files to the `dist/` directory. 

## Using the sandbox

This repository provides a sandbox you can run to test the Storybook Symfony integration.

First navigate to the sandbox directory:

```shell
cd sandbox
```

Set up the sandbox for interactive development:

```shell
bin/setup-dev
```

This will install the bundle as a symlink, so any change in PHP code or compiled JavaScript will be reflected in the 
sandbox dependencies.

Then run the Symfony server and Storybook:

```shell
symfony server:start --port 8000 --daemon --no-tls
npm run storybook
```

Now you can visit http://localhost:6006 to use the sandbox while developing the bundle.

### Sandbox components and stories

The sandbox comes with two kind of components/stories:

|                              | Components                       | Stories                | Usage                                                                                     |
|------------------------------|----------------------------------|------------------------|-------------------------------------------------------------------------------------------|
| Symfony UX components        | `templates/components`           | `templates/components` | Show Symfony UX use cases<br/>(component mocks, callbacks...)                             |
| Storybook testing components | `templates/components/Storybook` | `templates-stories`    | Main Storybook testings (see [Storybook integration tests](#storybook-integration-tests)) |


## Testing

### Symfony

Run Symfony tests with `vendor/bin/simple-phpunit`.

### TypeScript

For TypeScript modules, tests are written right next to the tested module in a file named `<moduleName>.test.ts`.

Run the tests with `yarn test`:

```shell
cd storybook
yarn test
```

### Storybook integration tests

Storybook tests are run with [Storybook Test Runner](https://github.com/storybookjs/test-runner).

#### Template-stories and Storybook testing components

We use the same stories as the main Storybook repository to test the Symfony framework integration. Those stories are
located in `sandbox/template-stories`: 

| Sandbox location                       | Storybook repository location                         |
|----------------------------------------|-------------------------------------------------------|
| `template-stories/lib/preview-api`     | `storybook/code/lib/preview-api/template/stories`     |
| `template-stories/addons/<addon-name>` | `storybook/code/addons/<addon-name>/template/stories` |


The files may differ from the original ones to be compatible with our framework, but changes should be minimal and
absolutely required for the Symfony framework. Those changes are indicated with a `@OVERRIDE` comment.

Some stories may be excluded from the test suite with the `will-fail` tag.

See [here](#updating-template-stories) how those stories are maintained.

#### Running tests with sandbox in development mode

Given you have your sandbox running as described [here](#using-the-sandbox), you can run the tests with:

```shell
npm run test-storybook -- --stories-json --excludeTags will-fail
```

> Note: \
> The `--stories-json` flag is required to make stories with a custom id pass the tests

#### Running tests with sandbox in CI mode

To run the tests in a CI environment, first ensure the sandbox is not running. Configure it with:

```shell
./sandbox/bin/setup-standalone
```

This will export the project to the `sandbox/.bundle` directory and install it in the sandbox dependencies as a raw 
copy.

Then run the tests with:

```shell
./scripts/test-sandbox.sh
```

#### Updating template stories

You can update the current stories with the `update-sandbox-stories.sh` script:

```shell
scripts/update-sandbox-stories.sh # Update to the latest stable version from Storybook repository
scripts/update-sandbox-stories.sh 8.1.3 # Update to the 8.1.3 version from Storybook repository
```

You have to review the changes, and detect some overrides that have been removed the update to revert them back. For 
example, the change below should be reverted if it doesn't pass the tests:

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

If some stories don't pass because of an incompatibility with the framework, you can either tag them with `will-fail` or 
patch the story. In both cases, indicate the change with an `@OVERRIDE` comment.

## Documentation

Documentation pages are located in the `docs/` directory.

The [`docs/features.md`](docs/features.md) file lists the current Storybook features that have been considered and their integration state. When applicable, the feature has a link to our internal documentation in `docs/features` or `docs/addons`, depending on the topic.
