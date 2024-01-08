<?php

namespace Storybook\EventListener;

use Storybook\Exception\TemplateNotFoundException;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
class ExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $th = $event->getThrowable();

        match (true) {
            $th instanceof TemplateNotFoundException => $this->onTemplateNotFound($event),
            default => null,
        };
    }

    private function onTemplateNotFound(ExceptionEvent $event): void
    {
        $event->setThrowable(new NotFoundHttpException($event->getThrowable()->getMessage(), $event->getThrowable()));
    }
}
