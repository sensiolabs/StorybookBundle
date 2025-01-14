<?php

namespace Storybook\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * Prepends custom runtime loader in Storybook Twig environment.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class StorybookRuntimeLoaderPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        $twig = $container->getDefinition('storybook.twig');

        $addRuntimeLoaderMethodCall = [
            'addRuntimeLoader',
            [new Reference('storybook.twig.runtime_loader')],
        ];

        // Prepend the Storybook runtime loader to the default Twig ones
        $twig->setMethodCalls(array_merge(
            [$addRuntimeLoaderMethodCall],
            $twig->getMethodCalls())
        );
    }
}
