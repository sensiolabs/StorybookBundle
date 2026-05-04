<?php

namespace Storybook\Tests\Functional\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Path;

class StorybookInitCommandTest extends KernelTestCase
{
    /** @var string[] */
    private array $filesToClean = [];

    protected function setUp(): void
    {
        self::bootKernel();
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        foreach ($this->filesToClean as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }

        $this->filesToClean = [];
    }

    private function projectPath(string ...$parts): string
    {
        return Path::join(self::$kernel->getProjectDir(), ...$parts);
    }

    private function getCommandTester(): CommandTester
    {
        $application = new Application(self::$kernel);

        return new CommandTester($application->find('storybook:init'));
    }

    /** @param string[] $files */
    private function trackFiles(array $files): void
    {
        $this->filesToClean = array_merge($this->filesToClean, $files);
    }

    // -------------------------------------------------------------------------
    // Default path: vite builder, auto-detected package manager
    // -------------------------------------------------------------------------

    public function testDefaultInitCreatesExpectedFiles(): void
    {
        $files = [
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
            $this->projectPath('vitest.config.ts'),
        ];
        $this->trackFiles($files);

        $commandTester = $this->getCommandTester();
        $commandTester->execute([]);

        $commandTester->assertCommandIsSuccessful();

        foreach ($files as $file) {
            $this->assertFileExists($file);
        }
    }

    public function testViteBuilderReferencesVitePackage(): void
    {
        $this->trackFiles([
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
            $this->projectPath('vitest.config.ts'),
        ]);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--builder' => 'vite']);

        $commandTester->assertCommandIsSuccessful();

        $main = file_get_contents($this->projectPath('.storybook', 'main.ts'));
        $this->assertStringContainsString('@sensiolabs/storybook-symfony-vite', $main);
        $this->assertStringNotContainsString('@sensiolabs/storybook-symfony-webpack', $main);

        $this->assertFileExists($this->projectPath('vitest.config.ts'));
    }

    // -------------------------------------------------------------------------
    // Webpack builder
    // -------------------------------------------------------------------------

    public function testWebpackBuilderCreatesExpectedFiles(): void
    {
        $files = [
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
        ];
        $this->trackFiles($files);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--builder' => 'webpack']);

        $commandTester->assertCommandIsSuccessful();

        foreach ($files as $file) {
            $this->assertFileExists($file);
        }

        // Webpack path must NOT generate vitest.config.ts
        $this->assertFileDoesNotExist($this->projectPath('vitest.config.ts'));
    }

    public function testWebpackBuilderReferencesWebpackPackage(): void
    {
        $this->trackFiles([
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
        ]);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--builder' => 'webpack']);

        $commandTester->assertCommandIsSuccessful();

        $main = file_get_contents($this->projectPath('.storybook', 'main.ts'));
        $this->assertStringContainsString('@sensiolabs/storybook-symfony-webpack', $main);
        $this->assertStringNotContainsString('@sensiolabs/storybook-symfony-vite', $main);
    }

    // -------------------------------------------------------------------------
    // Package manager option
    // -------------------------------------------------------------------------

    public function testPackageManagerPnpmShowsCorrectInstallCommand(): void
    {
        $this->trackFiles([
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
            $this->projectPath('vitest.config.ts'),
        ]);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--package-manager' => 'pnpm']);

        $commandTester->assertCommandIsSuccessful();

        $display = $commandTester->getDisplay();
        $this->assertStringContainsString('pnpm install', $display);
        $this->assertStringContainsString('pnpm storybook', $display);

        $vitestConfig = file_get_contents($this->projectPath('vitest.config.ts'));
        $this->assertStringContainsString("storybookScript: 'pnpm storybook'", $vitestConfig);
    }

    public function testPackageManagerYarnShowsCorrectRunCommand(): void
    {
        $this->trackFiles([
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
            $this->projectPath('vitest.config.ts'),
        ]);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--package-manager' => 'yarn']);

        $commandTester->assertCommandIsSuccessful();

        $display = $commandTester->getDisplay();
        $this->assertStringContainsString('yarn install', $display);
        $this->assertStringContainsString('yarn storybook', $display);
    }

    public function testPackageManagerBunShowsCorrectRunCommand(): void
    {
        $this->trackFiles([
            $this->projectPath('.storybook', 'main.ts'),
            $this->projectPath('.storybook', 'preview.ts'),
            $this->projectPath('config', 'routes', 'storybook.yaml'),
            $this->projectPath('config', 'packages', 'storybook.yaml'),
            $this->projectPath('templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            $this->projectPath('stories', 'Component.stories.js'),
            $this->projectPath('package.json'),
            $this->projectPath('vitest.config.ts'),
        ]);

        $commandTester = $this->getCommandTester();
        $commandTester->execute(['--package-manager' => 'bun']);

        $commandTester->assertCommandIsSuccessful();

        $display = $commandTester->getDisplay();
        $this->assertStringContainsString('bun install', $display);
        $this->assertStringContainsString('bun run storybook', $display);
    }

    // -------------------------------------------------------------------------
    // Invalid options
    // -------------------------------------------------------------------------

    public function testInvalidBuilderOptionReturnsInvalid(): void
    {
        $commandTester = $this->getCommandTester();
        $exitCode = $commandTester->execute(['--builder' => 'rollup']);

        $this->assertSame(Command::INVALID, $exitCode);
        $this->assertStringContainsString('"vite" or "webpack"', $commandTester->getDisplay());
    }

    public function testInvalidPackageManagerOptionReturnsInvalid(): void
    {
        $commandTester = $this->getCommandTester();
        $exitCode = $commandTester->execute(['--package-manager' => 'deno']);

        $this->assertSame(Command::INVALID, $exitCode);
        $this->assertStringContainsString('"npm", "pnpm", "yarn"', $commandTester->getDisplay());
    }
}
