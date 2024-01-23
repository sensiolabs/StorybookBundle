<?php

namespace Storybook\EventListener;

use Psr\Container\ContainerExceptionInterface;
use Storybook\Event\ComponentRenderEvent;
use Storybook\Mock\ComponentProxyFactory;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Creates mock component proxy on component render.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class ComponentMockSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ComponentProxyFactory $componentProxyFactory,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [ComponentRenderEvent::class => ['onComponentRender', -256]];
    }

    /**
     * @throws ContainerExceptionInterface
     */
    public function onComponentRender(ComponentRenderEvent $event): void
    {
        if (!($componentClass = $event->getComponentClass())) {
            // Anonymous components cannot be mocked
            return;
        }
        if ($this->componentProxyFactory->componentHasMock($componentClass)) {
            $variables = $event->getVariables();
            $variables['this'] = $this->componentProxyFactory->createProxyForStory($componentClass, $variables['this'], $event->getStory());
            $variables['computed'] = $this->componentProxyFactory->createProxyForStory($componentClass, $variables['computed'], $event->getStory());
            $event->setVariables($variables);
        }
    }
}
