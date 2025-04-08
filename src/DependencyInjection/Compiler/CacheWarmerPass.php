<?php

declare(strict_types=1);

namespace Storybook\DependencyInjection\Compiler;

use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;

class CacheWarmerPass implements CompilerPassInterface
{
    private ?array $extensionConfig = null;

    public function process(ContainerBuilder $container): void
    {
        $cacheWarmerDefinition = $container->getDefinition('storybook.cache_warmer');

        $cacheWarmerDefinition
            ->setArgument(3, $this->getConfig($container, $container->getExtension('twig')))
            ->setArgument(4, $this->getConfig($container, $container->getExtension('twig_component')))
        ;
    }

    private function getConfigForExtension(ExtensionInterface $extension, ContainerBuilder $container)
    {
        $extensionAlias = $extension->getAlias();

        if (isset($this->extensionConfig[$extensionAlias])) {
            return $this->extensionConfig[$extensionAlias];
        }

        $configs = $container->getExtensionConfig($extensionAlias);

        $configuration = $extension instanceof ConfigurationInterface ? $extension : $extension->getConfiguration($configs, $container);

        return $this->extensionConfig[$extensionAlias] = (new Processor())->processConfiguration($configuration, $configs);
    }

    private function getConfig(ContainerBuilder $container, ExtensionInterface $extension): array
    {
        return $container->resolveEnvPlaceholders(
            $container->getParameterBag()->resolveValue(
                $this->getConfigForExtension($extension, $container)
            ), true
        );
    }
}
