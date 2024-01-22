<?php

namespace Storybook\EventListener;

use Storybook\Exception\TemplateNotFoundException;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class ExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $th = $event->getThrowable();

        if ($th instanceof TemplateNotFoundException) {
            $event->setThrowable(new NotFoundHttpException($event->getThrowable()->getMessage(), $event->getThrowable()));
        }
    }
}
