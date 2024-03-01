<?php

namespace Storybook\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Storybook\Util\StorybookAttributes;

class StorybookAttributesTest extends TestCase
{
    public function testCreateFromArray()
    {
        $attributes = StorybookAttributes::from(['story' => 'story']);

        $this->assertInstanceOf(StorybookAttributes::class, $attributes);
        $this->assertEquals('story', $attributes->story);
    }

    public function testCreateFromInvalidArrayThrowsException()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing key "story" in attributes.');
        StorybookAttributes::from([]);
    }
}
