<?php

namespace Storybook\Attributes;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
final class AsArgsProcessor
{
    public function __construct(public readonly ?string $story = null, public readonly int $priority = 0)
    {
    }
}
