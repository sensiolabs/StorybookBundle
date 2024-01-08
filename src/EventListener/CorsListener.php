<?php

namespace Storybook\EventListener;

use Symfony\Component\HttpKernel\Event\ResponseEvent;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class CorsListener
{
    public function __construct(private readonly ?string $host)
    {
    }

    public function __invoke(ResponseEvent $event): void
    {
        if (!$event->isMainRequest() || null === $this->host) {
            return;
        }

        $route = $event->getRequest()->attributes->get('_route');

        if ('storybook_render' !== $route) {
            return;
        }

        $event->getResponse()->headers->set('Access-Control-Allow-Origin', $this->host);
    }
}
