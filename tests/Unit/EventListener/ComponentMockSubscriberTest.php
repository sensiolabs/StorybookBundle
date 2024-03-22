<?php

namespace Storybook\Tests\Unit\EventListener;

use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;
use Storybook\Event\ComponentRenderEvent;
use Storybook\EventListener\ComponentMockSubscriber;
use Storybook\Mock\ComponentProxyFactory;
use Storybook\Mock\MockedPropertiesProxy;

class ComponentMockSubscriberTest extends TestCase
{
    public function testThisAndComputedAreProxified()
    {
        $locator = $this->createMock(ContainerInterface::class);
        $locator->method('get')->willReturn(new \stdClass());
        $proxyFactory = new ComponentProxyFactory($locator);
        $proxyFactory->addMockConfiguration('Component', 'service', [
            'storiesMocks' => [
                'story' => [
                    'foo' => 'bar',
                ],
            ],
            'globalMocks' => [
            ],
        ]);
        $subscriber = new ComponentMockSubscriber($proxyFactory);

        $variables = [
            'this' => new \stdClass(),
            'computed' => new \stdClass(),
        ];

        $event = new ComponentRenderEvent('story', 'Component', $variables);
        $subscriber->onComponentRender($event);

        $this->assertInstanceOf(MockedPropertiesProxy::class, $event->getVariables()['this']);
        $this->assertInstanceOf(MockedPropertiesProxy::class, $event->getVariables()['computed']);
    }

    public function testComponentIsNotProxifiedIfNotConfigured()
    {
        $proxyFactory = new ComponentProxyFactory($this->createMock(ContainerInterface::class));
        $subscriber = new ComponentMockSubscriber($proxyFactory);

        $variables = [
            'this' => $component = new \stdClass(),
            'computed' => $computed = new \stdClass(),
        ];

        $event = new ComponentRenderEvent('story', 'Component', $variables);
        $subscriber->onComponentRender($event);

        $this->assertSame($component, $event->getVariables()['this']);
        $this->assertSame($computed, $event->getVariables()['computed']);
    }

    public function testAnonymousComponentIsIgnored()
    {
        $proxyFactory = new ComponentProxyFactory($this->createMock(ContainerInterface::class));
        $subscriber = new ComponentMockSubscriber($proxyFactory);

        $variables = [
            'this' => $component = new \stdClass(),
            'computed' => $computed = new \stdClass(),
        ];

        $event = new ComponentRenderEvent('story', null, $variables);
        $subscriber->onComponentRender($event);

        $this->assertSame($component, $event->getVariables()['this']);
        $this->assertSame($computed, $event->getVariables()['computed']);
    }
}
