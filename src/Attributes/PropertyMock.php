<?php

namespace Storybook\Attributes;

/**
 * Configures a method mock to use for Storybook rendering.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[\Attribute(\Attribute::TARGET_METHOD)]
final class PropertyMock
{
    /**
     * @param string|null          $property The property to mock. Defaults to the method name.
     * @param string|string[]|null $stories  Stories that use this mock. Pass null to use the mock in all stories.
     */
    public function __construct(
        public readonly ?string $property = null,
        public readonly string|array|null $stories = null,
    ) {
    }
}
