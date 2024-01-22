<?php

namespace Storybook\Util;

final class StorybookAttributes
{
    public function __construct(
        public readonly string $story,
    ) {
    }

    /**
     * @throws \InvalidArgumentException if $attributes miss required keys
     */
    public static function from(array $attributes): self
    {
        if (!isset($attributes['story'])) {
            throw new \InvalidArgumentException('Missing key "story" in attributes.');
        }

        return new self(story: $attributes['story']);
    }
}
