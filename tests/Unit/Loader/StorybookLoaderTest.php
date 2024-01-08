<?php

namespace Storybook\Tests\Unit\Loader;

use PHPUnit\Framework\TestCase;
use Storybook\Loader\StorybookLoader;
use Symfony\Component\HttpFoundation\Request;

class StorybookLoaderTest extends TestCase
{
    /**
     * @dataProvider getExtractTests
     */
    public function testExtractRequest(string $queryString, array $expected)
    {
        $request = Request::create('/'.('' !== $queryString ? '?'.$queryString : ''));

        $loader = new StorybookLoader();

        $data = $loader->load('story', $request);

        $this->assertSame($expected, $data);
    }

    public function getExtractTests(): iterable
    {
        yield from [
            'no data' => ['', []],
            'scalar data' => ['foo=bar&baz=42', ['foo' => 'bar', 'baz' => 42]],
            'boolean' => ['foo=true&bar=false', ['foo' => true, 'bar' => false]],
            'null' => ['foo=null', ['foo' => null]],
            'array' => ['foo=["a", "b"]', ['foo' => ['a', 'b']]],
            'object' => ['foo={"prop": "value"}', ['foo' => ['prop' => 'value']]],
        ];
    }

    public function testCustomLoader()
    {
        $loader = new StorybookLoader();

        $loader->addLoader('story', new class() {
            public function __invoke(array $data)
            {
                return ['custom_data' => 'custom_value'];
            }
        });

        // Custom loader is executed
        $this->assertEquals(['custom_data' => 'custom_value'], $loader->load('story', new Request()));

        // Custom loader data are merged with original request
        $this->assertEquals(['foo' => 'bar', 'custom_data' => 'custom_value'], $loader->load('story', new Request(['foo' => 'bar'])));

        // Custom loader is not executed for another story
        $this->assertEquals([], $loader->load('other-story', new Request()));

        // Multiple loaders can be executed
        $loader->addLoader('story', new class() {
            public function __invoke(array $data)
            {
                return ['other_data' => 'other_value'];
            }
        });
        $this->assertEquals(['custom_data' => 'custom_value', 'other_data' => 'other_value'], $loader->load('story', new Request()));
    }
}
