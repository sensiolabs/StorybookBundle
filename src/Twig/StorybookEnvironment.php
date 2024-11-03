<?php

namespace Storybook\Twig;

use Symfony\UX\TwigComponent\Twig\ComponentRuntime;
use Twig\Environment;
use Twig\Error\RuntimeError;

/**
 * Custom Twig environment for Storybook.
 *
 * Overrides some base behaviors to ensure environment isolation.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
class StorybookEnvironment extends Environment
{
    private ComponentRuntime $componentRuntime;

    public function setComponentRuntime(ComponentRuntime $componentRuntime): void
    {
        $this->componentRuntime = $componentRuntime;
    }

    /**
     * @template TRuntime
     *
     * @param class-string<TRuntime> $class
     *
     * @return TRuntime
     *
     * @throws RuntimeError
     */
    public function getRuntime(string $class)
    {
        if (ComponentRuntime::class === $class) {
            return $this->componentRuntime;
        }

        return parent::getRuntime($class);
    }
}
