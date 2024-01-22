<?php

namespace Storybook\Mock;

use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;

/**
 * Creates proxified components that uses registered providers to mock data.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class ComponentProxyFactory
{
    /**
     * @var array<string,ComponentMockMetadata>
     */
    private array $config = [];

    public function __construct(private readonly ContainerInterface $mockProviderLocator)
    {
    }

    public function addMockConfiguration(string $componentClass, string $service, array $config): void
    {
        if (isset($this->config[$componentClass])) {
            throw new \LogicException(sprintf('A mock configuration already exists for component "%s".', $componentClass));
        }

        $this->config[$componentClass] = new ComponentMockMetadata($service, $config['globalMocks'] ?? [], $config['storiesMocks'] ?? []);
    }

    public function componentHasMock(string $componentClass): bool
    {
        return \array_key_exists($componentClass, $this->config);
    }

    /**
     * @throws ContainerExceptionInterface if the mock provider service could not be retrieved
     */
    public function createProxyForStory(string $componentClass, object $component, string $story): MockedPropertiesProxy
    {
        $mockMetadata = $this->config[$componentClass];

        try {
            $provider = $this->mockProviderLocator->get($mockMetadata->service);
        } catch (NotFoundExceptionInterface $e) {
            throw new \LogicException(sprintf('No mock provider is registered for component class "%s". Did you forget to use the #[AsComponentMock] attribute?', $componentClass), previous: $e);
        }

        // Get mocks definitions for this story and append global mocks
        $methods = ($mockMetadata->storiesMocks[$story] ?? []) + $mockMetadata->globalMocks;

        return new MockedPropertiesProxy($component, $provider, $methods);
    }
}
