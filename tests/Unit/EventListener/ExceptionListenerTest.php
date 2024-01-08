<?php

namespace Storybook\Tests\Unit\EventListener;

use PHPUnit\Framework\TestCase;
use Storybook\EventListener\ExceptionListener;
use Storybook\Exception\TemplateNotFoundException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ExceptionListenerTest extends TestCase
{
    public function testTemplateNotFoundExceptionIsConvertedToHttpNotFound()
    {
        $event = new ExceptionEvent($this->createMock(KernelInterface::class), new Request(), HttpKernelInterface::MAIN_REQUEST, new TemplateNotFoundException());

        (new ExceptionListener())($event);

        $th = $event->getThrowable();

        $this->assertInstanceOf(HttpExceptionInterface::class, $th);
        $this->assertEquals(404, $th->getStatusCode());
    }
}
