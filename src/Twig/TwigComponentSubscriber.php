<?php

namespace Storybook\Twig;

use Psr\EventDispatcher\EventDispatcherInterface;
use Storybook\Event\ComponentRenderEvent;
use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\UX\TwigComponent\Event\PreRenderEvent;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class TwigComponentSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            PreRenderEvent::class => 'onPreRender',
        ];
    }

    public function onPreRender(PreRenderEvent $event): void
    {
        $request = $this->requestStack->getMainRequest();

        if (null === $request || !RequestAttributesHelper::isStorybookRequest($request)) {
            return;
        }

        $storybookAttributes = RequestAttributesHelper::getStorybookAttributes($request);

        $componentClass = $event->getMetadata()->get('class');

        $renderEvent = new ComponentRenderEvent($storybookAttributes->story, $componentClass, $event->getVariables());
        $this->eventDispatcher->dispatch($renderEvent);

        $event->setVariables($renderEvent->getVariables());
    }
}
