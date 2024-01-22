<?php

namespace Storybook\Tests\Unit\Mock;

use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;
use Storybook\Mock\ComponentProxyFactory;
use Storybook\Mock\MockedPropertiesProxy;

class ComponentProxyFactoryTest extends TestCase
{
    public function testCreateProxyFactory()
    {
        $locator = $this->createMock(ContainerInterface::class);
        $proxyFactory = new ComponentProxyFactory($locator);
        $proxyFactory->addMockConfiguration('Component', 'service', []);

        $locator->expects($this->once())->method('get')->with('service')->willReturn(new \stdClass());
        $proxy = $proxyFactory->createProxyForStory('Component', new \stdClass(), 'story');
        $this->assertInstanceOf(MockedPropertiesProxy::class, $proxy);
    }

    /**
     * @dataProvider getConfigurations
     */
    public function testComponentHasMock(array $configurations, string $componentClass, bool $expected)
    {
        $proxyFactory = new ComponentProxyFactory($this->createMock(ContainerInterface::class));

        foreach ($configurations as $configuration) {
            $proxyFactory->addMockConfiguration($configuration['componentClass'], $configuration['service'], $configuration['config']);
        }

        $this->assertEquals($expected, $proxyFactory->componentHasMock($componentClass));
    }

    public static function getConfigurations(): iterable
    {
        yield 'No configuration' => [
            [],
            'Component',
            false,
        ];

        yield 'Component class matches configured mocks' => [
            [
                [
                    'componentClass' => 'Component',
                    'service' => 'foo',
                    'config' => [],
                ],
            ],
            'Component',
            true,
        ];

        yield 'Component class does not match configured mocks' => [
            [
                [
                    'componentClass' => 'Component',
                    'service' => 'foo',
                    'config' => [],
                ],
            ],
            'OtherComponent',
            false,
        ];
    }

    public function testMockingTheSameComponentMultipleTimesThrowsException()
    {
        $proxyFactory = new ComponentProxyFactory($this->createMock(ContainerInterface::class));
        $proxyFactory->addMockConfiguration('Component', 'service', []);

        $this->expectException(\LogicException::class);
        $proxyFactory->addMockConfiguration('Component', 'service', []);
    }

    public function testMissingMockProviderThrowsLogicException()
    {
        $locator = $this->createMock(ContainerInterface::class);
        $proxyFactory = new ComponentProxyFactory($locator);
        $proxyFactory->addMockConfiguration('Component', 'service', []);

        $locator->expects($this->once())->method('get')->with('service')->willThrowException($this->createMock(NotFoundExceptionInterface::class));
        $this->expectException(\LogicException::class);
        $proxyFactory->createProxyForStory('Component', new \stdClass(), 'story');
    }
}
