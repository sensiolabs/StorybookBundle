<?php

namespace Storybook\Tests\Unit\EventListener;

use PHPUnit\Framework\TestCase;
use Storybook\EventListener\ProxyRequestListener;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ProxyRequestListenerTest extends TestCase
{
    /**
     * @dataProvider requestsProvider
     */
    public function testProxyRequestStorybookAttributes(array $headers, ?array $attributeValues)
    {
        $request = new Request();
        $request->headers->add($headers);

        $listener = new ProxyRequestListener();

        $listener->onKernelRequest(new RequestEvent($this->createMock(KernelInterface::class), $request, HttpKernelInterface::MAIN_REQUEST));

        if (null === $attributeValues) {
            $this->assertFalse(RequestAttributesHelper::isStorybookRequest($request));

            return;
        }

        $this->assertTrue(RequestAttributesHelper::isStorybookRequest($request));
        $attributes = RequestAttributesHelper::getStorybookAttributes($request);

        foreach ($attributeValues as $name => $value) {
            $this->assertEquals($value, $attributes->{$name});
        }
    }

    public static function requestsProvider(): iterable
    {
        yield 'Proxy request with viewMode=story and id in referer' => [
            [
                'X-Storybook-Proxy' => true,
                'referer' => 'http://localhost/iframe.html?viewMode=story&id=some-story',
            ],
            [
                'story' => 'some-story',
            ],
        ];
        yield 'Proxy request without viewMode and id in referer' => [
            [
                'X-Storybook-Proxy' => true,
                'referer' => 'http://localhost/iframe.html',
            ],
            null,
        ];
        yield 'Proxy request without id in referer' => [
            [
                'X-Storybook-Proxy' => true,
                'referer' => 'http://localhost/iframe.html?viewMode=story',
            ],
            null,
        ];
        yield 'Proxy request without viewMode in referer' => [
            [
                'X-Storybook-Proxy' => true,
                'referer' => 'http://localhost/iframe.html?id=some-story',
            ],
            null,
        ];
        yield 'Proxy request with another viewMode in referer' => [
            [
                'X-Storybook-Proxy' => true,
                'referer' => 'http://localhost/iframe.html?viewMode=foo&id=some-story',
            ],
            null,
        ];
        yield 'Non-proxy request' => [
            [
                'referer' => 'http://localhost/iframe.html?viewMode=story&id=some-story',
            ],
            null,
        ];
    }
}
