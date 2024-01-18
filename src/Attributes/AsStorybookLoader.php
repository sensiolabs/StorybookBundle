<?php

namespace Storybook\Attributes;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
#[\Attribute(\Attribute::TARGET_CLASS)]
class AsStorybookLoader
{
    public function __construct(private readonly string $name)
    {
    }

    public function getName(): string
    {
        return $this->name;
    }
}
