<?php

namespace Storybook\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class RegisterLoaderPass implements CompilerPassInterface
{
    private const TAG_NAME = 'storybook.loader';

    public function process(ContainerBuilder $container): void
    {
        $loader = $container->getDefinition('storybook.loader');

        foreach ($container->findTaggedServiceIds(self::TAG_NAME) as $serviceId => $tags) {
            foreach ($tags as $attributes) {
                $loader->addMethodCall('addLoader', [$attributes['name'], new Reference($serviceId)]);
            }
        }
    }
}
