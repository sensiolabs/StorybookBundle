<?php

namespace Storybook\Tests\Unit\Command;

use Storybook\Command\GeneratePreviewCommand;
use Storybook\Event\GeneratePreviewEvent;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Twig\Environment;

class GeneratePreviewCommandTest extends KernelTestCase
{
    public function testGeneratePreviewEventIsDispatched()
    {
        $twig = $this->createMock(Environment::class);
        $eventDispatcher = $this->createMock(EventDispatcherInterface::class);

        $command = new GeneratePreviewCommand($twig, $eventDispatcher);

        $twig->method('render')->willReturn('');
        $eventDispatcher
            ->expects($this->once())
            ->method('dispatch')
            ->with($this->isInstanceOf(GeneratePreviewEvent::class));

        $command->run($this->createMock(InputInterface::class), $this->createMock(OutputInterface::class));
    }
}
