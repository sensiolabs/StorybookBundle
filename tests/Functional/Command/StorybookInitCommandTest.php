<?php

namespace Storybook\Tests\Functional\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Path;

class StorybookInitCommandTest extends KernelTestCase
{
    private array $filesToCheck = [];

    protected function setUp(): void
    {
        self::bootKernel();

        $projectDir = self::$kernel->getProjectDir();
        $this->filesToCheck = [
            Path::join($projectDir, '.storybook', 'main.ts'),
            Path::join($projectDir, '.storybook', 'preview.ts'),
            Path::join($projectDir, 'config', 'routes', 'storybook.yaml'),
            Path::join($projectDir, 'config', 'packages', 'storybook.yaml'),
            Path::join($projectDir, 'templates', 'bundles', 'StorybookBundle', 'preview.html.twig'),
            Path::join($projectDir, 'stories', 'Component.stories.js'),
            Path::join($projectDir, 'package.json'),
        ];
    }

    protected function tearDown(): void
    {
        parent::tearDown();

        foreach ($this->filesToCheck as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }
    }

    public function testInitCommand()
    {
        $application = new Application(self::$kernel);

        $command = $application->find('storybook:init');
        $commandTester = new CommandTester($command);
        $commandTester->execute([]);

        $commandTester->assertCommandIsSuccessful();

        foreach ($this->filesToCheck as $file) {
            $this->assertFileExists($file);
        }
    }
}
