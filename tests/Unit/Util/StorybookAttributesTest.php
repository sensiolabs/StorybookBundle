<?php

namespace Storybook\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Storybook\Util\StorybookAttributes;

class StorybookAttributesTest extends TestCase
{
    /**
     * @dataProvider getValidArguments
     *
     * @param array<string, string> $array
     */
    public function testCreateFromArray(array $array, StorybookAttributes $expected): void
    {
        $attributes = StorybookAttributes::from($array);

        $this->assertEquals($expected, $attributes);
    }

    /**
     * @return \Generator<string, array{array: array<string, string>, expected: StorybookAttributes}>
     */
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

    public function testCreateFromInvalidArrayThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing key "story" in attributes.');
        StorybookAttributes::from([]);
    }
}
