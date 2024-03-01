<?php

namespace Storybook\Tests\Unit\EventListener;

use PHPUnit\Framework\TestCase;
use Storybook\EventListener\CorsListener;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class CorsListenerTest extends TestCase
{
    public function testCorsHeaderIsAddedForStorybookRequest()
    {
        $host = 'http://localhost:6006';
        $request = new Request();
        $request = RequestAttributesHelper::withStorybookAttributes($request, ['story' => 'story']);
        $event = new ResponseEvent($this->createMock(KernelInterface::class), $request, HttpKernelInterface::MAIN_REQUEST, new Response());
        (new CorsListener($host))($event);

        $this->assertEquals($host, $event->getResponse()->headers->get('Access-Control-Allow-Origin'));
    }

    public function testCorsHeaderIsNotAddedForOtherRequests()
    {
        $host = 'http://localhost:6006';
        $request = new Request();
        $event = new ResponseEvent($this->createMock(KernelInterface::class), $request, HttpKernelInterface::MAIN_REQUEST, new Response());
        (new CorsListener($host))($event);

        $this->assertNull($event->getResponse()->headers->get('Access-Control-Allow-Origin'));
    }
}
