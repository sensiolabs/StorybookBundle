<?php

namespace Storybook\Attributes;

/**
 * Registers this class as a mock provider for Storybook rendering.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
final class AsComponentMock
{
    /**
     * @param string $component The component class to mock
     */
    public function __construct(
        public readonly string $component,
    ) {
    }
}
