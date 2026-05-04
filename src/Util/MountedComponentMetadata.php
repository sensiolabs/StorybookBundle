<?php

namespace Storybook\Util;

use Symfony\UX\TwigComponent\MountedComponent;

/**
 * @internal
 */
final class MountedComponentMetadata
{
    public static function remove(MountedComponent $mounted, string ...$keys): void
    {
        // UX exposes no public mutation API for this metadata yet.
        $refl = new \ReflectionProperty(MountedComponent::class, 'extraMetadata');
        $extraMetadata = $refl->getValue($mounted);

        foreach ($keys as $key) {
            unset($extraMetadata[$key]);
        }

        $refl->setValue($mounted, $extraMetadata);
    }
}
