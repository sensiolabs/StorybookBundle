<?php

namespace Storybook\Attributes;

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
