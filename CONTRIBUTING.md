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

## Testing

### Symfony

Run Symfony tests with `vendor/bin/simple-phpunit`.

### TypeScript

For TypeScript modules, tests are written right next to the tested module in a file named `<moduleName>.test.ts`.

Run the tests with `yarn test`.

### Storybook integration tests

Currently, we don't provide integration tests with a real Storybook application. Any suggestion/contribution about this is highly appreciated! 

## Documentation

Documentation pages are located in the `docs/` directory.

The [`docs/features.md`](docs/features.md) file lists the current Storybook features that have been considered and their integration state. When applicable, the feature has a link to our internal documentation in `docs/features` or `docs/addons`, depending on the topic.
