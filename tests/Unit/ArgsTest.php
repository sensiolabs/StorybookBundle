<?php

namespace Storybook\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Storybook\Args;

class ArgsTest extends TestCase
{
    public function testArgsCreation()
    {
        $args = new Args(['foo' => 'bar']);

        $this->assertEquals('bar', $args['foo']);
    }

    public function testGet()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => null,
        ]);

        // Standard get
        $this->assertEquals('bar', $args->get('foo'));

        // Default get
        $this->assertEquals('default', $args->get('unknown', 'default'));

        // Explicit null
        $this->assertNull($args->get('baz', 'default'));
    }

    public function testSet()
    {
        $args = new Args();

        // Set initial
        $args->set('foo', 'bar');
        $this->assertEquals('bar', $args->get('foo'));

        // Ensure override
        $args->set('foo', 'baz');
        $this->assertEquals('baz', $args->get('foo'));
    }

    public function testHas()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => null,
        ]);

        $this->assertTrue($args->has('foo'));
        $this->assertTrue($args->has('baz'));
        $this->assertFalse($args->has('unknown'));
    }

    public function testMerge()
    {
        // Merge with Args
        $args = new Args(['foo' => 'bar']);
        $args->merge(new Args(['baz' => 'qux']));

        $this->assertEquals('bar', $args->get('foo'));
        $this->assertEquals('qux', $args->get('baz'));

        // Merge with array
        $args = new Args(['foo' => 'bar']);
        $args->merge(['baz' => 'qux']);

        $this->assertEquals('bar', $args->get('foo'));
        $this->assertEquals('qux', $args->get('baz'));

        // Merge without override
        $args = new Args(['foo' => 'bar']);
        $args->merge(['foo' => 'qux']);

        $this->assertEquals('bar', $args->get('foo'));

        // Merge with override
        $args = new Args(['foo' => 'bar']);
        $args->merge(['foo' => 'qux'], true);

        $this->assertEquals('qux', $args->get('foo'));
    }

    public function testOffsetGet()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => null,
        ]);

        $this->assertEquals($args->get('foo'), $args['foo']);

        // Works with null values
        $this->assertNull($args['baz']);
    }

    public function testOffsetSet()
    {
        $args = new Args();

        $args['foo'] = 'bar';

        $this->assertEquals('bar', $args->get('foo'));
    }

    public function testOffsetExists()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => null,
        ]);

        $this->assertTrue(isset($args['foo']));
        $this->assertTrue(isset($args['baz']));
    }

    public function testOffsetUnset()
    {
        $args = new Args(['foo' => 'bar']);

        unset($args['foo']);

        $this->assertFalse(isset($args['foo']));
    }

    public function testToArray()
    {
        $args = new Args(['foo' => 'bar']);

        $this->assertEquals(['foo' => 'bar'], $args->toArray());
    }

    /**
     * @dataProvider getInvalidMethodCalls
     */
    public function testArrayMethodsThrowExceptionWhenKeyIsNotString(callable $test)
    {
        $this->expectException(\InvalidArgumentException::class);

        $test();
    }

    public static function getInvalidMethodCalls(): iterable
    {
        yield 'get' => [static function () {
            $args = new Args();
            // @phpstan-ignore-next-line
            $args[0];
        }];

        yield 'set' => [static function () {
            $args = new Args();
            $args[0] = 'foo';
        }];

        yield 'exists' => [static function () {
            $args = new Args();
            // @phpstan-ignore-next-line
            isset($args[0]);
        }];

        yield 'unset' => [static function () {
            $args = new Args();
            unset($args[0]);
        }];

        yield 'constructor' => [static function () {
            new Args(['foo', 'bar']);
        }];
    }

    public function testCount()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => 'qux',
        ]);

        $this->assertCount(2, $args);
    }

    public function testIterator()
    {
        $args = new Args([
            'foo' => 'bar',
            'baz' => 'qux',
        ]);

        foreach ($args as $key => $value) {
            $this->assertEquals($value, $args->get($key));
        }
    }
}
