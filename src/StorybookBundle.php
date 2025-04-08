<?php

namespace Storybook;

use Storybook\DependencyInjection\Compiler\ArgsProcessorPass;
use Storybook\DependencyInjection\Compiler\CacheWarmerPass;
use Storybook\DependencyInjection\Compiler\ComponentMockPass;
use Storybook\DependencyInjection\StorybookExtension;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class StorybookBundle extends Bundle
{
    public function build(ContainerBuilder $container): void
    {
        $container->addCompilerPass(new ArgsProcessorPass());
        $container->addCompilerPass(new ComponentMockPass());
        $container->addCompilerPass(new CacheWarmerPass());
    }

    public function getContainerExtension(): ?ExtensionInterface
    {
        return new StorybookExtension();
    }

    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
