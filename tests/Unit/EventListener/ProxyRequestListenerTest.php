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
    public function testProxyRequestStorybookAttributes(bool $isProxy, ?string $referer, bool $shouldHaveAttributes, array $attributeValues)
    {
        $request = new Request();
        if ($isProxy) {
            $request->headers->set('X-Storybook-Proxy', 'true');
        }
        if (null !== $referer) {
            $request->headers->set('referer', $referer);
        }

        $listener = new ProxyRequestListener();

        $listener->onKernelRequest(new RequestEvent($this->createMock(KernelInterface::class), $request, HttpKernelInterface::MAIN_REQUEST));

        if (!$shouldHaveAttributes) {
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
            true,
            'http://localhost/iframe.html?viewMode=story&id=some-story',
            true,
            [
                'story' => 'some-story',
            ],
        ];
        yield 'Proxy request without viewMode and id in referer' => [
            true,
            'http://localhost/iframe.html',
            false,
            [],
        ];
        yield 'Proxy request without id in referer' => [
            true,
            'http://localhost/iframe.html?viewMode=story',
            false,
            [],
        ];
        yield 'Proxy request without viewMode in referer' => [
            true,
            'http://localhost/iframe.html?id=some-story',
            false,
            [],
        ];
        yield 'Proxy request with another viewMode in referer' => [
            true,
            'http://localhost/iframe.html?viewMode=foo&id=some-story',
            false,
            [],
        ];
        yield 'Non-proxy request' => [
            false,
            'http://localhost/iframe.html?viewMode=story&id=some-story',
            false,
            [],
        ];
    }
}
