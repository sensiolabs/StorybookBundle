<?php

namespace Storybook;

use Storybook\Attributes\AsStorybookLoader;
use Storybook\DependencyInjection\Compiler\RegisterLoaderPass;
use Storybook\DependencyInjection\StorybookExtension;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;

class StorybookBundle extends Bundle implements ConfigurationInterface
{
    public function build(ContainerBuilder $container): void
    {
        $container->registerAttributeForAutoconfiguration(
            AsStorybookLoader::class,
            static function (ChildDefinition $definition, AsStorybookLoader $attributeInstance, \Reflector $ref) {
                $definition->addTag('storybook.loader', ['name' => $attributeInstance->getName()]);
            }
        );

        $container->addCompilerPass(new RegisterLoaderPass());

    }

    public function getContainerExtension(): ?ExtensionInterface
    {
        return new StorybookExtension();
    }

    public function getPath(): string
    {
        return \dirname(__DIR__);
    }

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('storybook');
        $rootNode = $treeBuilder->getRootNode();
        assert($rootNode instanceof ArrayNodeDefinition);

        $rootNode
            ->children()
                ->scalarNode('server')
                    ->info('The URL of the Storybook server. Pass null to disable the CORS headers.')
                    ->defaultValue('http://localhost:6006')
                ->end()
            ->end();
        return $treeBuilder;
    }
}
