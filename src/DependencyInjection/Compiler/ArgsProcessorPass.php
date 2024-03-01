<?php

namespace Storybook\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Compiler\PriorityTaggedServiceTrait;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class ArgsProcessorPass implements CompilerPassInterface
{
    use PriorityTaggedServiceTrait;

    public function process(ContainerBuilder $container): void
    {
        $loader = $container->getDefinition('storybook.args_processor');

        $processors = $this->findAndSortTaggedServices('storybook.args_processor', $container);

        foreach ($processors as $ref) {
            $tag = $container->getDefinition($ref)->getTag('storybook.args_processor');
            foreach ($tag as $attributes) {
                $loader->addMethodCall('addProcessor', [$ref, $attributes['story']]);
            }
        }
    }
}
