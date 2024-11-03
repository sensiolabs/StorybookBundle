<?php

namespace Storybook\Twig;

use Psr\EventDispatcher\EventDispatcherInterface;
use Storybook\Event\ComponentRenderEvent;
use Storybook\Util\RequestAttributesHelper;
use Storybook\Util\StorybookContext;
use Storybook\Util\StorybookContextHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\UX\TwigComponent\Event\PreRenderEvent;
use Symfony\UX\TwigComponent\MountedComponent;

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
            PreRenderEvent::class => [
                ['inlineRootLiveComponent', 1],
                ['onPreRender', 0],
            ],
        ];
    }

    public function inlineRootLiveComponent(PreRenderEvent $event): void
    {
        $request = $this->requestStack->getMainRequest();

        if (null === $request || !RequestAttributesHelper::isStorybookRequest($request)) {
            return;
        }

        if (!$event->getMetadata()->get('live', false)) {
            // not a live component, skip
            return;
        }

        $storybookAttributes = RequestAttributesHelper::getStorybookAttributes($request);

        $mounted = $event->getMountedComponent();

        if ($mounted->hasExtraMetadata('hostTemplate') && $mounted->getExtraMetadata('hostTemplate') === $storybookAttributes->template) {
            // Dirty hack here: we are rendering a Live Component in the main story template with the embedded strategy.
            // The host template actually doesn't exist, which will cause errors because Live Component will try to use
            // it when re-rendering itself. As this is only useful for blocks resolution, we can safely remove this.
            // Using reflection because no extension point is available here.
            $refl = new \ReflectionProperty(MountedComponent::class, 'extraMetadata');
            $extraMetadata = $refl->getValue($mounted);
            unset($extraMetadata['hostTemplate'], $extraMetadata['embeddedTemplateIndex']);
            $refl->setValue($mounted, $extraMetadata);
        }
    }

    public function onPreRender(PreRenderEvent $event): void
    {
        $request = $this->requestStack->getMainRequest();

        if (null === $request || !RequestAttributesHelper::isStorybookRequest($request)) {
            return;
        }

        $storybookAttributes = RequestAttributesHelper::getStorybookAttributes($request);

        $componentClass = $event->getMetadata()->get('class');

        $variables = $event->getVariables();

        StorybookContextHelper::addStorybookContext($variables, new StorybookContext($componentClass, $storybookAttributes->story));

        $event->setVariables($variables);

        $renderEvent = new ComponentRenderEvent($storybookAttributes->story, $componentClass, $event->getVariables());
        $this->eventDispatcher->dispatch($renderEvent);

        $event->setVariables($renderEvent->getVariables());
    }
}
