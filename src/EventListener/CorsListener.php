<?php

namespace Storybook\EventListener;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class CorsListener
{
    public function __construct(private readonly RequestStack $requestStack, private readonly ?string $host)
    {
    }

    public function __invoke(ResponseEvent $event): void
    {
        if (null === $this->host) {
            return;
        }

        $route = $this->requestStack->getMainRequest()->attributes->get('_route');

        if ('storybook_render' !== $route) {
            return;
        }

        $event->getResponse()->headers->set('Access-Control-Allow-Origin', $this->host);
    }
}