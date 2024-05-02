<?php

namespace Storybook\Command;

use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Path;
use Symfony\UX\LiveComponent\LiveComponentBundle;
use Symfonycasts\TailwindBundle\SymfonycastsTailwindBundle;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[AsCommand(name: 'storybook:init', description: 'Initialize Storybook with basic configuration files.')]
class StorybookInitCommand extends Command
{
    public const STORYBOOK_VERSION = '^8.0.0';
    private SymfonyStyle $io;

    public function __construct(private readonly string $projectDir)
    {
        parent::__construct();
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->io = new SymfonyStyle($input, $output);
    }

    protected function configure(): void
    {
        $this->setHelp(<<<HELP
The <info>storybook:init</info> command generates the base configuration files for Storybook.

It will create a <info>.storybook</info> directory at the root of your project and create/update your <info>package.json</info> file to include
the required dependencies, including the Storybook framework provided by this bundle.

These files should be reviewed after creation and committed to your repository.

HELP
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io->title('Initializing Storybook for Symfony');

        $this->setupPackageJson();
        $this->setupStorybookConfig();
        $this->setupBundleConfig();
        $this->setupRoutes();
        $this->setupPreview();
        $this->addDefaultStory();

        $this->io->success('Storybook initialized!');

        $this->io->text([
            'Some files may have changed.',
            'Here is a list of actions you may need to perform now:',
        ]);

        $this->io->listing([
            'Review your <info>package.json</info> and install new dependencies with <info>npm install</info>',
            'Review your <info>templates/bundles/StorybookBundle/preview.html.twig</info> and adjust your importmap call',
            'Review your <info>.storybook/main.ts</info> configuration and adjust your Symfony server host',
            'Run your Symfony server',
            'Run <info>npm run storybook</info> to start the Storybook development server',
            'Visit <info>http://localhost:6006</info>',
        ]);

        return self::SUCCESS;
    }

    /**
     * @throws \JsonException
     */
    private function setupPackageJson(): void
    {
        $this->io->note('Updating package.json');

        $packageJsonFile = Path::join($this->projectDir, 'package.json');
        $packageJsonData = [];
        if (file_exists($packageJsonFile)) {
            $packageJsonData = json_decode(file_get_contents($packageJsonFile), true);
        }

        $packageJsonData['devDependencies'] ??= [];
        $packageJsonData['devDependencies'] += [
            '@sensiolabs/storybook-symfony-webpack5' => 'file:vendor/sensiolabs/storybook-bundle/storybook',
            '@storybook/addon-essentials' => self::STORYBOOK_VERSION,
            '@storybook/addon-links' => self::STORYBOOK_VERSION,
            '@storybook/addon-webpack5-compiler-swc' => '^1.0.2',
            '@storybook/blocks' => self::STORYBOOK_VERSION,
            '@storybook/cli' => self::STORYBOOK_VERSION,
            'typescript' => '^5.4.2',
            'webpack' => '^5.90.3',
        ];

        $packageJsonData['scripts'] ??= [];
        $packageJsonData['scripts'] += [
            'storybook' => 'sb dev -p 6006 --no-open --disable-telemetry',
            'build-storybook' => 'sb build',
        ];

        $packageJsonContent = json_encode($packageJsonData, \JSON_PRETTY_PRINT | \JSON_THROW_ON_ERROR | \JSON_UNESCAPED_SLASHES);

        $this->writeFileWithConfirmation($packageJsonFile, $packageJsonContent);
    }

    private function setupStorybookConfig(): void
    {
        $this->io->note('Generating Storybook configuration files');

        $previewFile = <<<TS
import { Preview } from '@sensiolabs/storybook-symfony-webpack5';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
TS;
        $mainFile = <<<TS
import type { StorybookConfig } from "@sensiolabs/storybook-symfony-webpack5";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.[tj]s", "../stories/**/*.mdx"],
    addons: [
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-links",
        "@storybook/addon-essentials",
    ],
    framework: {
        name: "@sensiolabs/storybook-symfony-webpack5",
        options: {
            // 👇 Here configure the framework
            symfony: {
                server: 'https://localhost',
                proxyPaths: [
                    '/assets',

TS;
        if ($this->isLiveComponentsInstalled()) {
            $mainFile .= <<<TS
                    '/_components',

TS;
        }
        $mainFile .= <<<TS
                ],
                additionalWatchPaths: [
                    'assets',

TS;
        if ($this->isTailwindInstalled()) {
            $mainFile .= <<<TS
                    'var/tailwind/tailwind.built.css',

TS;
        }
        $mainFile .= <<<TS
                ]
            }
        },
    },
    docs: {
        autodocs: "tag",
    },
};
export default config;
TS;
        $storybookConfigDir = Path::join($this->projectDir, '.storybook');
        $this->writeFileWithConfirmation(Path::join($storybookConfigDir, 'preview.ts'), $previewFile);
        $this->writeFileWithConfirmation(Path::join($storybookConfigDir, 'main.ts'), $mainFile);
    }

    private function setupBundleConfig(): void
    {
        $this->io->note('Creating bundle configuration');

        $configFile = Path::join($this->projectDir, 'config', 'packages', 'storybook.yaml');

        $content = <<<YAML
storybook: ~

when@dev:
  storybook:
    sandbox:
      allowedFunctions:
        - 'dump'

YAML;
        $this->writeFileWithConfirmation($configFile, $content);
    }

    private function setupRoutes(): void
    {
        $this->io->note('Setting up routes');

        $routesFile = Path::join($this->projectDir, 'config', 'routes', 'storybook.yaml');

        $content = <<<YAML
storybook:
  resource: '@StorybookBundle/config/routes.php'

YAML;
        $this->writeFileWithConfirmation($routesFile, $content);
    }

    private function setupPreview(): void
    {
        $this->io->note('Creating preview template');

        $previewPath = Path::join($this->projectDir, 'templates', 'bundles', 'StorybookBundle', 'preview.html.twig');

        $content = "{% extends '@!Storybook/preview.html.twig' %}\n";
        if ($this->isAssetMapperInstalled()) {
            $content .= <<<TWIG

{% block previewHead %}
    {{ importmap() }}
{% endblock %}

TWIG;
        }

        $this->writeFileWithConfirmation($previewPath, $content);
    }

    private function addDefaultStory(): void
    {
        $this->io->note('Creating sample stories');

        $storyFile = Path::join($this->projectDir, 'stories', 'Component.stories.js');

        $content = <<<JS
import {twig} from "@sensiolabs/storybook-symfony-webpack5";

export default {
    component: twig`
        <div>Hello {{ args.name }}!</div>
    `,
    args: {
        name: 'World'
    }
}

export const Default = {};

export const John = {
    args: {
        name: 'John'
    }
};

export const Jane = {
    args: {
        name: 'Jane'
    }
};

JS;

        $this->writeFileWithConfirmation($storyFile, $content);
    }

    private function isLiveComponentsInstalled(): bool
    {
        return class_exists(LiveComponentBundle::class);
    }

    private function isAssetMapperInstalled(): bool
    {
        return interface_exists(AssetMapperInterface::class);
    }

    private function isTailwindInstalled(): bool
    {
        return class_exists(SymfonycastsTailwindBundle::class);
    }

    private function writeFileWithConfirmation(string $filePath, string $content): void
    {
        if (!str_ends_with($content, "\n")) {
            $content .= "\n";
        }

        $shouldOverride = true;
        if (file_exists($filePath) && md5_file($filePath) !== md5($content)) {
            $shouldOverride = $this->io->confirm(sprintf('File "%s" already exists, do you want to override it?', $filePath), false);
        }

        if ($shouldOverride) {
            $dir = \dirname($filePath);
            if (!is_dir($dir)) {
                mkdir($dir, recursive: true);
            }
            file_put_contents($filePath, $content);
        }
    }
}
