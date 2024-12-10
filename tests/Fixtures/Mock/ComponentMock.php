<?php

namespace Storybook\Tests\Fixtures\Mock;

use Storybook\Attributes\AsComponentMock;
use Storybook\Attributes\PropertyMock;
use Storybook\Tests\Fixtures\Component\Component;

#[AsComponentMock(component: Component::class)]
class ComponentMock
{
    #[PropertyMock]
    public function prop2(): string
    {
        return 'mocked prop2';
    }

    #[PropertyMock(property: 'prop3')]
    public function mockProp3(): string
    {
        return 'mocked prop3';
    }

    #[PropertyMock(stories: [
        'story-with-mocked-component',
        'story-with-mocked-component-embedded',
    ])]
    public function prop4(): string
    {
        return 'mocked prop4';
    }

    #[PropertyMock(stories: 'another-story')]
    public function prop5(): string
    {
        return 'mocked prop5';
    }

    #[PropertyMock]
    public function computedProp(): string
    {
        return 'mocked computedProp';
    }
}
