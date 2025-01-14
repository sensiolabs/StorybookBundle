<?php

namespace Storybook\Twig;

use Twig\RuntimeLoader\RuntimeLoaderInterface;

/**
 * Runtime loader for custom runtimes that have to be used in a Storybook context.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class StorybookRuntimeLoader implements RuntimeLoaderInterface
{
    /**
     * @var array<string, object>
     */
    private array $map = [];

    public function load(string $class): ?object
    {
        return $this->map[$class] ?? null;
    }

    public function addRuntime(object $runtime): void
    {
        $class = $runtime::class;
        if (isset($this->map[$class])) {
            throw new \InvalidArgumentException(\sprintf('Runtime "%s" is already registered.', $class));
        }

        $this->map[$class] = $runtime;
    }
}
