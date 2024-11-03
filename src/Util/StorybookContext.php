<?php

namespace Storybook\Util;

/**
 * Special context used in Twig context to provide information about the current story.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class StorybookContext
{
    public function __construct(
        public readonly ?string $componentClass,
        public readonly string $story,
    ) {
    }
}
