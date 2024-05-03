<?php

namespace Storybook\Twig;

use Storybook\Twig\Sandbox\StoryExtension;
use Twig\Environment;
use Twig\Extension\SandboxExtension;
use Twig\Sandbox\SecurityPolicyInterface;

class StorybookEnvironmentConfigurator
{
    public function __construct(
        private readonly object $inner,
        private readonly SecurityPolicyInterface $securityPolicy,
        private readonly string|bool $cacheDir,
    ) {
        if (!method_exists($this->inner, 'configure')) {
            throw new \InvalidArgumentException(sprintf('Expected the inner configurator to declare a "%s" method, but it was not found in class "%s".', 'configure', get_debug_type($this->inner)));
        }
    }

    public function configure(Environment $environment): void
    {
        $this->inner->configure($environment);

        $environment->setExtensions([
            new SandboxExtension($this->securityPolicy),
            new StoryExtension(),
        ]);

        $environment->setCache($this->cacheDir);
    }
}
