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
use Storybook\EventListener\ProxyRequestListener;
use Storybook\Exception\UnauthorizedStoryException;
use Storybook\Maker\MakeStory;
use Storybook\Mock\ComponentProxyFactory;
use Storybook\StoryRenderer;
use Storybook\Twig\StorybookEnvironmentConfigurator;
use Storybook\Twig\TwigComponentSubscriber;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\DependencyInjection\Argument\AbstractArgument;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Reference;
use Twig\Sandbox\SecurityPolicy;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class StorybookExtension extends Extension implements ConfigurationInterface, PrependExtensionInterface
{
    public function prepend(ContainerBuilder $container): void
    {
        $container->prependExtensionConfig('framework', [
            'exceptions' => [
                UnauthorizedStoryException::class => [
                    'status_code' => 400,
                ],
            ],
        ]);
    }

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

        // Proxy listener
        $container->register('storybook.listener.proxy_request', ProxyRequestListener::class)
            ->addTag('kernel.event_subscriber');

        // Main controller
        $container->register('storybook.controller.render_story', StorybookController::class)
            ->setArgument(0, new Reference('storybook.story_renderer'))
            ->setArgument(1, new Reference('storybook.args_processor'))
            ->addTag('controller.service_arguments')
        ;

        // Story renderer
        $defaultSandboxConfig = [
            'allowedTags' => ['component'],
            'allowedFunctions' => ['component'],
            'allowedFilters' => ['escape'],
            'allowedMethods' => [],
            'allowedProperties' => [],
        ];

        $sandboxConfig = array_merge_recursive($defaultSandboxConfig, $config['sandbox']);

        $container->register('storybook.twig.security_policy', SecurityPolicy::class)
            ->setArgument(0, $sandboxConfig['allowedTags'])
            ->setArgument(1, $sandboxConfig['allowedFilters'])
            ->setArgument(2, $sandboxConfig['allowedMethods'])
            ->setArgument(3, $sandboxConfig['allowedProperties'])
            ->setArgument(4, $sandboxConfig['allowedFunctions'])
        ;

        $container->register('storybook.twig.environment_configurator', StorybookEnvironmentConfigurator::class)
            ->setArgument(0, new Reference('twig.configurator.environment'))
            ->setArgument(1, new Reference('storybook.twig.security_policy'))
            ->setArgument(2, $config['cache'] ?? false)
        ;

        $container->setDefinition('storybook.twig', new ChildDefinition('twig'))
            ->setConfigurator([new Reference('storybook.twig.environment_configurator'), 'configure'])
        ;

        $container->register('storybook.story_renderer', StoryRenderer::class)
            ->setArgument(0, new Reference('storybook.twig'))
        ;

        // Args processors
        $container->register('storybook.args_processor', StorybookArgsProcessor::class);

        // Proxy factory
        $container->register('storybook.component_proxy_factory', ComponentProxyFactory::class)
            ->setArgument(0, new AbstractArgument(sprintf('Provided in "%s".', ComponentMockPass::class)));

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

        // Maker
        $container->register('storybook.maker.story_renderer', \Storybook\Maker\StoryRenderer::class)
            ->setArgument(0, new Reference('maker.generator'))
            ->setArgument(1, new Reference('ux.twig_component.component_factory'))
            ->setArgument(2, '%kernel.project_dir%/stories');

        $container->register('storybook.maker.story_maker', MakeStory::class)
            ->setArgument(0, new Reference('storybook.maker.story_renderer'))
            ->addTag('maker.command')
        ;
    }

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('storybook');
        $rootNode = $treeBuilder->getRootNode();
        \assert($rootNode instanceof ArrayNodeDefinition);

        $rootNode
            ->children()
                ->scalarNode('cache')
                    ->defaultValue('%kernel.cache_dir%/storybook/twig')
                ->end()
                ->arrayNode('sandbox')
                    ->info('Configure the sandbox for Twig rendering.')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->arrayNode('allowedFunctions')
                            ->info('Functions that are allowed in stories.')
                            ->scalarPrototype()->end()
                        ->end()
                        ->arrayNode('allowedTags')
                            ->info('Tags that are allowed in stories.')
                            ->scalarPrototype()->end()
                        ->end()
                        ->arrayNode('allowedFilters')
                            ->info('Filters that are allowed in stories.')
                            ->scalarPrototype()->end()
                        ->end()
                        ->arrayNode('allowedProperties')
                            ->info('Properties that are allowed in stories.')
                            ->arrayPrototype()
                                ->info('Map class FQCN to properties.')
                                ->useAttributeAsKey('class')
                                ->scalarPrototype()->end()
                            ->end()
                        ->end()
                        ->arrayNode('allowedMethods')
                            ->info('Methods that are allowed in stories.')
                            ->arrayPrototype()
                                ->info('Map class FQCN to methods.')
                                ->useAttributeAsKey('class')
                                ->scalarPrototype()->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
