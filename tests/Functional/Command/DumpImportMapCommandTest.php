<?php

namespace Functional\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

class DumpImportMapCommandTest extends KernelTestCase
{
    public function testDumpImportMap()
    {
        self::bootKernel();

        $application = new Application(self::$kernel);

        $command = $application->find('storybook:dump-importmap');
        $commandTester = new CommandTester($command);
        $commandTester->execute([]);

        $commandTester->assertCommandIsSuccessful();

        $expectedOutput = <<<JS
        import './assets/app.js';

        JS;

        $this->assertEquals($expectedOutput, $commandTester->getDisplay());
    }
}
