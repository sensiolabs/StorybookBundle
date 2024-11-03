<?php

namespace Storybook\Twig;

use Twig\Environment;
use Twig\Extension\ExtensionInterface;

/**
 * Configure Twig for story renderer.
 *
 * @internal
 */
final class StorybookEnvironmentConfigurator
{
    /**
     * @param iterable<ExtensionInterface> $extensions
     */
    public function __construct(
        private readonly object $inner,
        private readonly iterable $extensions,
        private readonly string|bool $cacheDir,
    ) {
        if (!method_exists($this->inner, 'configure')) {
            throw new \InvalidArgumentException(\sprintf('Expected the inner configurator to declare a "%s" method, but it was not found in class "%s".', 'configure', get_debug_type($this->inner)));
        }
    }

    public function configure(Environment $environment): void
    {
        $this->inner->configure($environment);

        $environment->setCache($this->cacheDir);

        foreach ($this->extensions as $extension) {
            $environment->addExtension($extension);
        }
    }
}
