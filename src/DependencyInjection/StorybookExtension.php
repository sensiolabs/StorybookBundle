<?php

namespace Storybook\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;
use Twig\Loader\FilesystemLoader;

class StorybookExtension extends Extension implements ConfigurationInterface
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $loader = new PhpFileLoader(
            $container,
            new FileLocator(__DIR__ . '/../../config')
        );

        $loader->load('services.php');

        $config = (new Processor())->processConfiguration($this, $configs);

        if (isset($config['server'])) {
            $container->getDefinition('storybook.listener.cors')
                ->replaceArgument(1, $config['server']);
        } else {
            $container->removeDefinition('storybook.listener.cors');
        }

        $storiesPath = \sprintf('%s/stories', $config['runtime_dir']);
        $container->register('storybook.twig.loader', FilesystemLoader::class)
            ->addTag('twig.loader')
            ->addMethodCall('addPath', [$storiesPath, 'Stories']);

        $container->getDefinition('storybook.init_command')
            ->setArgument(1, $config['runtime_dir'])
            ->setArgument(2, $config['preview_template'])
        ;
    }

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('storybook');
        $treeBuilder->getRootNode()
            ->children()
                ->scalarNode('server')
                    ->info('The URL of the Storybook server. Pass null to disable the CORS headers.')
                    ->defaultValue('http://localhost:6006')
                ->end()
                ->scalarNode('runtime_dir')
                    ->info('Location of storybook runtime files')
                    ->cannotBeEmpty()
                    ->defaultValue('%kernel.project_dir%/var/storybook')
                ->end()
                ->scalarNode('preview_template')
                    ->info('Path to the preview template')
                    ->defaultValue('@Storybook/preview.html.twig')
                ->end()
            ->end();
        return $treeBuilder;
    }
}
