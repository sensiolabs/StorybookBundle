<?php

namespace Storybook\Tests\Fixtures\SandboxTest;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class TwigSandboxTestExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('unauthorized', static fn () => null),
        ];
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('unauthorized', static fn () => null),
        ];
    }

    public function getTokenParsers(): array
    {
        return [new UnauthorizedTagTokenParser()];
    }
}
