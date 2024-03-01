<?php

namespace Storybook\DependencyInjection\Compiler;

use Storybook\Attributes\PropertyMock;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Compiler\ServiceLocatorTagPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

final class ComponentMockPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        $providers = $container->findTaggedServiceIds('storybook.component_mock');

        $proxyFactoryDefinition = $container->getDefinition('storybook.component_proxy_factory');

        $providerMap = [];
        foreach ($providers as $id => $tags) {
            $providerDefinition = $container->getDefinition($id);

            foreach ($tags as $attributes) {
                $componentClass = $attributes['component'];
                $componentDefinition = $container->getDefinition($componentClass);

                if (!$componentDefinition->hasTag('twig.component')) {
                    throw new \LogicException(sprintf('The given class "%s" does not seem to be a Twig Component. Did you forget to use the #AsTwigComponent attribute?', $componentClass));
                }

                if (isset($providerMap[$componentClass])) {
                    throw new \LogicException(sprintf('Component "%s" is already mocked by "%s" (trying to configure "%s").', $componentClass, $providerMap[$componentClass], $id));
                }

                $providerMap[$id] = new Reference($id);

                $mocks = $this->extractMethodMocks($providerDefinition->getClass(), $componentClass);

                $proxyFactoryDefinition->addMethodCall('addMockConfiguration', [$componentClass, $id, $mocks]);
            }
        }

        $proxyFactoryDefinition->setArgument(0, ServiceLocatorTagPass::register($container, $providerMap));
    }

    private function extractMethodMocks(string $loaderClass, string $componentClass): array
    {
        $globalMocks = [];
        $storiesMocks = [];

        $refl = new \ReflectionClass($loaderClass);

        foreach ($refl->getMethods() as $reflMethod) {
            foreach ($reflMethod->getAttributes(PropertyMock::class) as $attr) {
                /** @var PropertyMock $attrInstance */
                $attrInstance = $attr->newInstance();

                $originalMethod = $attrInstance->property ?? $reflMethod->getName();
                $targetMethod = $reflMethod->getName();

                if (null === $attrInstance->stories) {
                    if (isset($globalMocks[$originalMethod])) {
                        throw new \LogicException(sprintf('Cannot mock property "%s::%s" more than once in global scope (previously mocked by "%s::%s").', $componentClass, $originalMethod, $loaderClass, $globalMocks[$originalMethod]));
                    }
                    $globalMocks[$originalMethod] = $targetMethod;
                } else {
                    $stories = \is_array($attrInstance->stories) ? $attrInstance->stories : [$attrInstance->stories];
                    foreach ($stories as $story) {
                        $storiesMocks[$story] ??= [];
                        if (isset($storiesMocks[$story][$originalMethod])) {
                            throw new \LogicException(sprintf('Cannot mock property "%s::%s" more than once for story "%s". (previously mocked by "%s::%s").', $componentClass, $originalMethod, $story, $loaderClass, $storiesMocks[$story][$originalMethod]));
                        }
                        $storiesMocks[$story][$originalMethod] = $targetMethod;
                    }
                }
            }
        }

        return [
            'globalMocks' => $globalMocks,
            'storiesMocks' => $storiesMocks,
        ];
    }
}
