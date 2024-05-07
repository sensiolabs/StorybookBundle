<?php

namespace Storybook\Attributes;

/**
 * Registers this class as an args processor for Storybook rendering.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
final class AsArgsProcessor
{
    /**
     * @param string|null $story The story id that triggers this processor
     */
    public function __construct(public readonly ?string $story = null, public readonly int $priority = 0)
    {
    }
}
