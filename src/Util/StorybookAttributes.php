<?php

namespace Storybook\Util;

final class StorybookAttributes
{
    private const REQUIRED_ATTRIBUTES = [
        'story',
    ];

    public function __construct(
        public readonly string $story,
        public readonly ?string $template = null,
    ) {
    }

    /**
     * @throws \InvalidArgumentException if $attributes miss required keys
     */
    public static function from(array $attributes): self
    {
        foreach (self::REQUIRED_ATTRIBUTES as $attribute) {
            if (!isset($attributes[$attribute])) {
                throw new \InvalidArgumentException(\sprintf('Missing key "%s" in attributes.', $attribute));
            }
        }

        return new self(
            story: $attributes['story'],
            template: $attributes['template'] ?? null,
        );
    }
}
