<?php

namespace Storybook\DependencyInjection\Compiler;

use Storybook\Bridge\Tailwind\GeneratePreviewListener;
use Storybook\Event\GeneratePreviewEvent;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

final class TailwindPreviewListenerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if ($container->has('tailwind.builder')) {
            $container->register('storybook.tailwind.generate_preview_listener', GeneratePreviewListener::class)
                ->setArgument(0, new Reference('tailwind.builder'))
                ->addTag('kernel.event_listener', ['event' => GeneratePreviewEvent::class]);
        }
    }
}
