<?php

namespace Storybook\DependencyInjection;

use Storybook\ArgsProcessor\StorybookArgsProcessor;
use Storybook\Attributes\AsArgsProcessor;
use Storybook\Attributes\AsComponentMock;
use Storybook\Command\GeneratePreviewCommand;
use Storybook\Command\StorybookInitCommand;
use Storybook\Controller\StorybookController;
use Storybook\DependencyInjection\Compiler\ComponentMockPass;
use Storybook\EventListener\ComponentMockSubscriber;
use Storybook\EventListener\ExceptionListener;
use Storybook\EventListener\ProxyRequestListener;
use Storybook\Mock\ComponentProxyFactory;
use Storybook\Twig\StoryTemplateLoader;
use Storybook\Twig\TwigComponentSubscriber;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\DependencyInjection\Argument\AbstractArgument;
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
            AsArgsProcessor::class,
            static function (ChildDefinition $definition, AsArgsProcessor $attributeInstance) {
                $definition->addTag('storybook.args_processor', [
                    'story' => $attributeInstance->story,
                    'priority' => $attributeInstance->priority,
                ]);
            }
        );

        $container->registerAttributeForAutoconfiguration(
            AsComponentMock::class,
            static function (ChildDefinition $definition, AsComponentMock $attributeInstance, \ReflectionClass $refl) {
                $definition->addTag('storybook.component_mock', [
                    'component' => $attributeInstance->component,
                ]);
            }
        );

        $config = (new Processor())->processConfiguration($this, $configs);

        // Exception listener
        $container->register('storybook.listener.exception', ExceptionListener::class)
            ->addTag('kernel.event_listener');

        // Proxy listener
        $container->register('storybook.listener.proxy_request', ProxyRequestListener::class)
            ->addTag('kernel.event_subscriber');

        // Main controller
        $container->register('storybook.controller.render_story', StorybookController::class)
            ->setArgument(0, new Reference('twig'))
            ->setArgument(1, new Reference('storybook.args_processor'))
            ->addTag('controller.service_arguments')
        ;

        // Args processors
        $container->register('storybook.args_processor', StorybookArgsProcessor::class);

        // Proxy factory
        $container->register('storybook.component_proxy_factory', ComponentProxyFactory::class)
            ->setArgument(0, new AbstractArgument(sprintf('Provided in "%s".', ComponentMockPass::class)));

        // Twig template loader
        $container->register('storybook.twig.loader', StoryTemplateLoader::class)
            ->setArgument(0, $config['runtime_dir'])
            ->addTag('twig.loader');

        // Internal commands
        $container->register('storybook.generate_preview_command', GeneratePreviewCommand::class)
            ->setArgument(0, new Reference('twig'))
            ->setArgument(1, new Reference('event_dispatcher'))
            ->addTag('console.command', ['name' => 'storybook:generate-preview'])
        ;

        // Init command
        $container->register('storybook.init_command', StorybookInitCommand::class)
            ->setArgument(0, $container->getParameter('kernel.project_dir'))
            ->addTag('console.command', ['name' => 'storybook:init']);

        // Component subscriber
        $container->register('storybook.twig.on_pre_render_listener', TwigComponentSubscriber::class)
            ->setArgument(0, new Reference('request_stack'))
            ->setArgument(1, new Reference('event_dispatcher'))
            ->addTag('kernel.event_subscriber');

        $container->register('storybook.component_mock_subscriber', ComponentMockSubscriber::class)
            ->setArgument(0, new Reference('storybook.component_proxy_factory'))
            ->addTag('kernel.event_subscriber');
    }

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('storybook');
        $rootNode = $treeBuilder->getRootNode();
        \assert($rootNode instanceof ArrayNodeDefinition);

        $rootNode
            ->children()
                ->scalarNode('runtime_dir')
                    ->info('Location of storybook runtime files')
                    ->cannotBeEmpty()
                    ->defaultValue('%kernel.project_dir%/var/storybook')
                ->end()
            ->end();

        return $treeBuilder;
    }
}
