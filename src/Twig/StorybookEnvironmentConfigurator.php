<?php

namespace Storybook\Twig;

use Symfony\UX\TwigComponent\ComponentAttributes;
use Twig\Environment;
use Twig\Extension\EscaperExtension;
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
            throw new \InvalidArgumentException(\sprintf('Expected the inner configurator to declare a "%s" method, but it was not found in class "%s".', 'configure', get_debug_type($this->inner)));
        }
    }

    public function configure(Environment $environment): void
    {
        $this->inner->configure($environment);

        $environment->getExtension(EscaperExtension::class)->addSafeClass(ComponentAttributes::class, ['html']);

        if (!$environment->hasExtension(SandboxExtension::class)) {
            $environment->addExtension(new SandboxExtension($this->securityPolicy));
        }

        if (!$environment->hasExtension(StoryExtension::class)) {
            $environment->addExtension(new StoryExtension());
        }

        $environment->setCache($this->cacheDir);
    }
}
