<?php

namespace Storybook\Command;

use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Path;
use Symfony\UX\LiveComponent\LiveComponentBundle;
use Symfonycasts\TailwindBundle\SymfonycastsTailwindBundle;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[AsCommand(name: 'storybook:init', description: 'Initialize Storybook with basic configuration files.')]
final class StorybookInitCommand extends Command
{
    public const STORYBOOK_VERSION = '10.3.5';
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
        $this->addOption('builder', null, InputOption::VALUE_REQUIRED, 'Storybook builder to generate config for: vite or webpack.', 'vite');
        $this->addOption('package-manager', null, InputOption::VALUE_REQUIRED, 'Package manager to use in generated instructions: npm, pnpm, yarn, or bun.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io->title('Initializing Storybook for Symfony');

        $builder = $input->getOption('builder');
        if (!\in_array($builder, ['vite', 'webpack'], true)) {
            $this->io->error('The --builder option must be either "vite" or "webpack".');

            return self::INVALID;
        }

        $packageManager = $input->getOption('package-manager') ?: $this->detectPackageManager();
        if (!\in_array($packageManager, ['npm', 'pnpm', 'yarn', 'bun'], true)) {
            $this->io->error('The --package-manager option must be one of "npm", "pnpm", "yarn", or "bun".');

            return self::INVALID;
        }

        $legacyWebpack = 'webpack' === $builder;

        $this->setupPackageJson($legacyWebpack);
        $this->setupStorybookConfig($legacyWebpack, $packageManager);
        $this->setupBundleConfig();
        $this->setupRoutes();
        $this->setupPreview();
        $this->addDefaultStory($legacyWebpack);

        $this->io->success('Storybook initialized!');

        $this->io->text([
            'Some files may have changed.',
            'Here is a list of actions you may need to perform now:',
        ]);

        $nextSteps = [
            \sprintf('Review your <info>package.json</info> and install new dependencies with <info>%s</info>', $this->getInstallCommand($packageManager)),
            'Review your <info>templates/bundles/StorybookBundle/preview.html.twig</info> and adjust your importmap call',
            'Review your <info>.storybook/main.ts</info> configuration and adjust your Symfony server host',
        ];

        if (!$legacyWebpack) {
            $nextSteps[] = 'Review your <info>vitest.config.ts</info> proxy targets if your Symfony server does not run on http://localhost:8000';
        }

        $nextSteps[] = 'Run your Symfony server';
        $nextSteps[] = \sprintf('Run <info>%s</info> to start the Storybook development server', $this->getRunCommand($packageManager, 'storybook'));
        $nextSteps[] = 'Visit <info>http://localhost:6006</info>';

        $this->io->listing($nextSteps);

        return self::SUCCESS;
    }

    /**
     * @throws \JsonException
     */
    private function setupPackageJson(bool $legacyWebpack): void
    {
        $this->io->note('Updating package.json');

        $packageJsonFile = Path::join($this->projectDir, 'package.json');
        $packageJsonData = [];
        if (file_exists($packageJsonFile)) {
            $packageJsonContent = file_get_contents($packageJsonFile);
            if (false === $packageJsonContent) {
                throw new \RuntimeException(\sprintf('Unable to read "%s".', $packageJsonFile));
            }

            $packageJsonData = json_decode($packageJsonContent, true, flags: \JSON_THROW_ON_ERROR);
            if (!\is_array($packageJsonData)) {
                throw new \RuntimeException(\sprintf('The "%s" file must contain a JSON object.', $packageJsonFile));
            }
        }

        $packageJsonData['devDependencies'] ??= [];
        if ($legacyWebpack) {
            $packageJsonData['devDependencies'] += [
                '@sensiolabs/storybook-symfony-webpack' => 'file:vendor/sensiolabs/storybook-bundle/packages/webpack',
                '@storybook/addon-docs' => self::STORYBOOK_VERSION,
                '@storybook/addon-webpack5-compiler-swc' => '4.0.3',
                'storybook' => self::STORYBOOK_VERSION,
                'typescript' => '5.9.3',
                'webpack' => '5.106.2',
            ];
        } else {
            $packageJsonData['devDependencies'] += [
                '@sensiolabs/storybook-symfony-vite' => 'file:vendor/sensiolabs/storybook-bundle/packages/vite',
                '@storybook/addon-docs' => self::STORYBOOK_VERSION,
                '@storybook/addon-vitest' => self::STORYBOOK_VERSION,
                '@vitest/browser' => '4.1.5',
                '@vitest/browser-playwright' => '4.1.5',
                'playwright' => '1.59.1',
                'storybook' => self::STORYBOOK_VERSION,
                'typescript' => '5.9.3',
                'vite' => '8.0.10',
                'vitest' => '4.1.5',
            ];
        }

        $packageJsonData['scripts'] ??= [];
        $packageJsonData['scripts'] += [
            'storybook' => 'storybook dev -p 6006 --no-open --disable-telemetry',
            'build-storybook' => 'storybook build',
        ];
        if (!$legacyWebpack) {
            $packageJsonData['scripts'] += [
                'test-storybook' => 'vitest --project=storybook',
            ];
        }

        $packageJsonContent = json_encode($packageJsonData, \JSON_PRETTY_PRINT | \JSON_THROW_ON_ERROR | \JSON_UNESCAPED_SLASHES);

        $this->writeFileWithConfirmation($packageJsonFile, $packageJsonContent);
    }

    private function setupStorybookConfig(bool $legacyWebpack, string $packageManager): void
    {
        $this->io->note('Generating Storybook configuration files');

        $packageName = $legacyWebpack ? '@sensiolabs/storybook-symfony-webpack' : '@sensiolabs/storybook-symfony-vite';
        $addons = $legacyWebpack ? <<<TS
        "@storybook/addon-webpack5-compiler-swc",
        "@storybook/addon-docs",
TS : <<<TS
        "@storybook/addon-docs",
        "@storybook/addon-vitest",
TS;

        $previewFile = <<<TS
import { Preview } from '$packageName';

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
import type { StorybookConfig } from "$packageName";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.[tj]s", "../stories/**/*.mdx"],
    addons: [
$addons
    ],
    framework: {
        name: "$packageName",
        options: {
            // 👇 Here configure the framework
            symfony: {
                server: 'http://localhost:8000',
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
        if (!$legacyWebpack) {
            $this->writeFileWithConfirmation(Path::join($this->projectDir, 'vitest.config.ts'), $this->getVitestConfig($packageManager));
        }
    }

    private function getVitestConfig(string $packageManager): string
    {
        $storybookScript = $this->getRunCommand($packageManager, 'storybook');

        $config = <<<TS
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: '.storybook',
                        storybookScript: '$storybookScript',
                        tags: {
                            exclude: ['will-fail'],
                        },
                    }),
                ],
                server: {
                    proxy: {
                        '/_storybook/render': {
                            target: 'http://localhost:8000',
                            changeOrigin: true,
                            headers: {
                                'X-Storybook-Proxy': 'true',
                            },
                        },
                        '/assets': {
                            target: 'http://localhost:8000',
                            changeOrigin: true,
                            headers: {
                                'X-Storybook-Proxy': 'true',
                            },
                        },
TS;
        if ($this->isLiveComponentsInstalled()) {
            $config .= <<<TS
                        '/_components': {
                            target: 'http://localhost:8000',
                            changeOrigin: true,
                            headers: {
                                'X-Storybook-Proxy': 'true',
                            },
                        },
TS;
        }
        $config .= <<<TS
                    },
                },
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: 'chromium' }],
                    },
                },
            },
        ],
    },
});
TS;

        return $config;
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

    private function addDefaultStory(bool $legacyWebpack): void
    {
        $this->io->note('Creating sample stories');

        $storyFile = Path::join($this->projectDir, 'stories', 'Component.stories.js');

        $packageName = $legacyWebpack ? '@sensiolabs/storybook-symfony-webpack' : '@sensiolabs/storybook-symfony-vite';

        $content = <<<JS
import {twig} from "$packageName";

export default {
    component: twig`
        <div>Hello {{ name }}!</div>
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

    private function detectPackageManager(): string
    {
        // Prefer strict/workspace-aware managers when multiple lockfiles are present.
        $lockFiles = [
            'pnpm-lock.yaml' => 'pnpm',
            'package-lock.json' => 'npm',
            'yarn.lock' => 'yarn',
            'bun.lock' => 'bun',
            'bun.lockb' => 'bun',
        ];

        foreach ($lockFiles as $lockFile => $packageManager) {
            if (file_exists(Path::join($this->projectDir, $lockFile))) {
                return $packageManager;
            }
        }

        return 'npm';
    }

    private function getInstallCommand(string $packageManager): string
    {
        return match ($packageManager) {
            'pnpm' => 'pnpm install',
            'yarn' => 'yarn install',
            'bun' => 'bun install',
            default => 'npm install',
        };
    }

    private function getRunCommand(string $packageManager, string $script): string
    {
        return match ($packageManager) {
            'pnpm' => \sprintf('pnpm %s', $script),
            'yarn' => \sprintf('yarn %s', $script),
            'bun' => \sprintf('bun run %s', $script),
            default => \sprintf('npm run %s', $script),
        };
    }

    private function writeFileWithConfirmation(string $filePath, string $content): void
    {
        if (!str_ends_with($content, "\n")) {
            $content .= "\n";
        }

        $shouldOverride = true;
        if (file_exists($filePath) && md5_file($filePath) !== md5($content)) {
            $shouldOverride = $this->io->confirm(\sprintf('File "%s" already exists, do you want to override it?', $filePath), false);
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
