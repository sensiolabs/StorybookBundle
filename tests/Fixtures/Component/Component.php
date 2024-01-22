<?php

namespace Storybook\Tests\Fixtures\Component;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent]
class Component
{
    public string $prop1 = 'prop1';
    public string $prop2 = 'prop2';
    public string $prop3 = 'prop3';
    public string $prop4 = 'prop4';
    public string $prop5 = 'prop5';

    public function computedProp(): string
    {
        return 'computedProp';
    }
}
