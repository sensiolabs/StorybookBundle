<?php

namespace Storybook\DependencyInjection\Compiler;

use Storybook\Bridge\SassPreviewListener;
use Storybook\Bridge\TailwindPreviewListener;
use Storybook\Event\GeneratePreviewEvent;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

final class OptionalPreviewListenersPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if ($container->has('sass.builder')) {
            $container->register('storybook.sass.preview_listener', SassPreviewListener::class)
                ->setArgument(0, new Reference('sass.builder'))
                ->addTag('kernel.event_listener', ['event' => GeneratePreviewEvent::class, 'priority' => 256]);
        }

        if ($container->has('tailwind.builder')) {
            $container->register('storybook.tailwind.preview_listener', TailwindPreviewListener::class)
                ->setArgument(0, new Reference('tailwind.builder'))
                ->addTag('kernel.event_listener', ['event' => GeneratePreviewEvent::class, 'priority' => 128]);
        }
    }
}
