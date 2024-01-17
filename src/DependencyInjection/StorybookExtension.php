<?php

namespace Storybook\DependencyInjection;

use Storybook\Attributes\AsStorybookLoader;
use Storybook\Command\GeneratePreviewCommand;
use Storybook\Controller\StorybookController;
use Storybook\EventListener\CorsListener;
use Storybook\EventListener\ExceptionListener;
use Storybook\Loader\StorybookLoader;
use Storybook\Twig\StoryTemplateLoader;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class StorybookExtension extends Extension implements ConfigurationInterface
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $container->registerAttributeForAutoconfiguration(
            AsStorybookLoader::class,
            static function (ChildDefinition $definition, AsStorybookLoader $attributeInstance, \Reflector $ref) {
                $definition->addTag('storybook.loader', ['name' => $attributeInstance->getName()]);
            }
        );

        $config = (new Processor())->processConfiguration($this, $configs);

        if (isset($config['server'])) {
            $container->register('storybook.listener.cors', CorsListener::class)
                ->setArgument(0, $config['server'])
                ->addTag('kernel.event_listener')
            ;
        }

        $container->register('storybook.listener.exception', ExceptionListener::class)
            ->addTag('kernel.event_listener');

        $container->register('storybook.controller.render_story', StorybookController::class)
            ->setArgument(0, new Reference('twig'))
            ->setArgument(1, new Reference('storybook.loader'))
            ->addTag('controller.service_arguments')
        ;

        $container->register('storybook.loader', StorybookLoader::class);
        $container->register('storybook.twig.loader', StoryTemplateLoader::class)
            ->setArgument(0, $config['runtime_dir'])
            ->addTag('twig.loader');

        $container->register('storybook.generate_preview_command', GeneratePreviewCommand::class)
            ->setArgument(0, new Reference('twig'))
            ->setArgument(1, $config['preview'])
            ->addTag('console.command', ['name' => 'storybook:generate-preview'])
        ;
    }

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('storybook');
        $rootNode = $treeBuilder->getRootNode();
        \assert($rootNode instanceof ArrayNodeDefinition);

        $rootNode
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
                ->scalarNode('preview')
                    ->info('Preview template')
                    ->cannotBeEmpty()
                    ->defaultValue('@Storybook/preview.html.twig')
                ->end()
            ->end();

        return $treeBuilder;
    }
}
