<?php

namespace Storybook\EventListener;

use Storybook\Util\RequestAttributesHelper;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class CorsListener
{
    public function __construct(private readonly ?string $host)
    {
    }

    public function __invoke(ResponseEvent $event): void
    {
        if (!$event->isMainRequest() || null === $this->host) {
            return;
        }

        if (!RequestAttributesHelper::isStorybookRequest($event->getRequest())) {
            return;
        }

        $event->getResponse()->headers->set('Access-Control-Allow-Origin', $this->host);
    }
}
