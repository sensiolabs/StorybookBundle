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
    private ?ComponentRuntime $componentRuntime = null;

    public function setComponentRuntime(ComponentRuntime $componentRuntime): void
    {
        $this->componentRuntime = $componentRuntime;
    }

    /**
     * @template TRuntime
     *
     * @param class-string<TRuntime> $class
     *
     * @return ComponentRuntime|object
     *
     * @throws RuntimeError
     */
    public function getRuntime(string $class)
    {
        if (ComponentRuntime::class === $class) {
            if (!$this->componentRuntime instanceof ComponentRuntime) {
                throw new RuntimeError(\sprintf('The "%s" runtime has not been configured.', ComponentRuntime::class));
            }

            return $this->componentRuntime;
        }

        return parent::getRuntime($class);
    }
}
