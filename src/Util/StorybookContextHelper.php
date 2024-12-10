<?php

namespace Storybook\Util;

/**
 * Static helper to manage StorybookContext.
 *
 * @static
 *
 * @internal
 */
final class StorybookContextHelper
{
    public const CONTEXT_KEY = '__storybook';

    public static function addStorybookContext(array &$variables, StorybookContext $context): void
    {
        if (true === self::hasStorybookContext($variables)) {
            throw new \InvalidArgumentException('Storybook context already exists.');
        }

        $variables[self::CONTEXT_KEY] = $context;
    }

    public static function hasStorybookContext(array $variables): bool
    {
        return true === \array_key_exists(self::CONTEXT_KEY, $variables);
    }

    public static function getStorybookContext(array $variables): StorybookContext
    {
        if (false === self::hasStorybookContext($variables)) {
            throw new \InvalidArgumentException('Storybook context does not exist.');
        }

        return $variables[self::CONTEXT_KEY];
    }
}
