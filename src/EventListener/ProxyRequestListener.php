<?php

namespace Storybook\EventListener;

use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpKernel\Event\RequestEvent;

/**
 * Catch requests proxified from Storybook to apply Storybook attributes.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class ProxyRequestListener implements EventSubscriberInterface
{
    public function __construct()
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            RequestEvent::class => 'onKernelRequest',
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (!RequestAttributesHelper::isProxyRequest($request) || !$request->headers->has('referer')) {
            return;
        }

        $components = parse_url($request->headers->get('referer'));

        if (!isset($components['query'])) {
            return;
        }

        $query = HeaderUtils::parseQuery($components['query']);

        if (!isset($query['viewMode'], $query['id']) || 'story' !== $query['viewMode']) {
            return;
        }

        RequestAttributesHelper::withStorybookAttributes($request, ['story' => $query['id']]);
    }
}
