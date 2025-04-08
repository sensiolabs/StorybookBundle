<?php

namespace Storybook\Tests\Unit\Controller;

use PHPUnit\Framework\TestCase;
use Storybook\Controller\StorybookPreviewController;
use Storybook\Event\GeneratePreviewEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

class StorybookPreviewControllerTest extends TestCase
{
    public function testControllerReturnsResponse()
    {
        $twig = $this->createMock(Environment::class);
        $eventDispatcher = $this->createMock(EventDispatcherInterface::class);

        $controller = new StorybookPreviewController($twig, $eventDispatcher);

        $twig->expects($this->once())
            ->method('render')
            ->with('@Storybook/preview.html.twig')
            ->willReturn('');

        $eventDispatcher
            ->expects($this->once())
            ->method('dispatch')
            ->with($this->isInstanceOf(GeneratePreviewEvent::class));

        $this->assertInstanceOf(Response::class, $controller());
    }
}
