<?php

namespace Storybook\Controller;

use Storybook\Event\GeneratePreviewEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;

final class StorybookPreviewController
{
    public function __construct(
        private readonly Environment $twig,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {
    }

    public function __invoke(): Response
    {
        $this->eventDispatcher->dispatch(new GeneratePreviewEvent());

        $content = $this->twig->render('@Storybook/preview.html.twig');

        return new Response($content);
    }
}
