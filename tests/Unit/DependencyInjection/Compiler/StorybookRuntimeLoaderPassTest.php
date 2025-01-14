<?php

namespace Storybook\Tests\Unit\DependencyInjection\Compiler;

use PHPUnit\Framework\TestCase;
use Storybook\DependencyInjection\Compiler\StorybookRuntimeLoaderPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

final class StorybookRuntimeLoaderPassTest extends TestCase
{
    public function testProcessAddsStorybookRuntimeLoaderBeforeTheOriginalOnes()
    {
        $container = new ContainerBuilder();
        $twigDefinition = new Definition();
        $container->setDefinition('storybook.twig', $twigDefinition);

        $twigDefinition->addMethodCall(
            'addRuntimeLoader',
            [new Reference('native_loader')],
        );

        $pass = new StorybookRuntimeLoaderPass();
        $pass->process($container);

        $runtimeLoaderCalls = array_filter(
            $twigDefinition->getMethodCalls(),
            static fn (array $call) => 'addRuntimeLoader' === $call[0],
        );

        self::assertCount(2, $runtimeLoaderCalls);
        self::assertEquals(
            new Reference('storybook.twig.runtime_loader'),
            $runtimeLoaderCalls[0][1][0],
        );
    }
}
