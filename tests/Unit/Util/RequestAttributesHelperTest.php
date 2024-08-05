<?php

namespace Storybook\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Storybook\Util\RequestAttributesHelper;
use Storybook\Util\StorybookAttributes;
use Symfony\Component\HttpFoundation\Request;

class RequestAttributesHelperTest extends TestCase
{
    public function testIsStorybookRequest()
    {
        $request = new Request();
        $request->attributes->set('_storybook', new StorybookAttributes('story'));
        $this->assertTrue(RequestAttributesHelper::isStorybookRequest($request));

        $this->assertFalse(RequestAttributesHelper::isStorybookRequest(new Request()));
    }

    public function testIsProxyRequest()
    {
        $request = new Request();
        $request->headers->set('X-Storybook-Proxy', 'true');
        $this->assertTrue(RequestAttributesHelper::isProxyRequest($request));
    }

    public function testWithStorybookAttributesAddsAttributesToRequest()
    {
        $request = RequestAttributesHelper::withStorybookAttributes(new Request(), ['story' => 'story']);
        $attributes = $request->attributes->get('_storybook');

        $this->assertInstanceOf(StorybookAttributes::class, $attributes);
        $this->assertEquals('story', $attributes->story);
    }

    public function testWithStorybookAttributesWithInvalidAttributesArrayThrowsException()
    {
        $this->expectException(\InvalidArgumentException::class);
        RequestAttributesHelper::withStorybookAttributes(new Request(), []);
    }

    public function testGetStorybookAttributesReturnsStorybookAttributes()
    {
        $request = new Request();
        $attributes = new StorybookAttributes('story');
        $request->attributes->set('_storybook', $attributes);

        $this->assertEquals($attributes, RequestAttributesHelper::getStorybookAttributes($request));
    }

    public function testGetStorybookAttributesOnNonStorybookRequestThrowsException()
    {
        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('Request is missing a "_storybook" attribute.');
        RequestAttributesHelper::getStorybookAttributes(new Request());
    }

    public function testGetStorybookAttributesThrowsExceptionIfAttributeIsNotStorybookAttributes()
    {
        $request = new Request();
        $request->attributes->set('_storybook', ['foo' => 'bar']);

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessageMatches(\sprintf('/Expecting a instance of "%s" in the "_storybook" request attributes, but found ".*"\./', preg_quote(StorybookAttributes::class)));
        RequestAttributesHelper::getStorybookAttributes($request);
    }
}
