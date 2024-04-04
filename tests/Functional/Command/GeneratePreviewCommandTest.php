<?php

namespace Storybook\Tests\Functional\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

class GeneratePreviewCommandTest extends KernelTestCase
{
    public function testGeneratePreview()
    {
        self::bootKernel();

        $application = new Application(self::$kernel);

        $command = $application->find('storybook:generate-preview');
        $commandTester = new CommandTester($command);
        $commandTester->execute([]);

        $commandTester->assertCommandIsSuccessful();

        $this->assertNotEmpty($commandTester->getDisplay());
    }
}
