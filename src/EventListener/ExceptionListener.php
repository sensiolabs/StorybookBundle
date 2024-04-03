<?php

namespace Storybook\EventListener;

use Storybook\Exception\UnauthorizedStoryException;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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

        if ($th instanceof UnauthorizedStoryException) {
            $event->setThrowable(new BadRequestHttpException($event->getThrowable()->getMessage(), $event->getThrowable()));
        }
    }
}
