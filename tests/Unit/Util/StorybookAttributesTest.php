<?php

namespace Storybook\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Storybook\Util\StorybookAttributes;

class StorybookAttributesTest extends TestCase
{
    /**
     * @dataProvider getValidArguments
     */
    public function testCreateFromArray(array $array, StorybookAttributes $expected)
    {
        $attributes = StorybookAttributes::from($array);

        $this->assertEquals($expected, $attributes);
    }

    public static function getValidArguments(): iterable
    {
        yield 'only story' => [
            'array' => [
                'story' => 'story',
            ],
            'expected' => new StorybookAttributes(
                'story',
                null
            ),
        ];

        yield 'with template name' => [
            'array' => [
                'story' => 'story',
                'template' => 'story.html.twig',
            ],
            'expected' => new StorybookAttributes(
                'story',
                'story.html.twig'
            ),
        ];
    }

    public function testCreateFromInvalidArrayThrowsException()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing key "story" in attributes.');
        StorybookAttributes::from([]);
    }
}
