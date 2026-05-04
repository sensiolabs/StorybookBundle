<?php

namespace Storybook\Event;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class ComponentRenderEvent
{
    /**
     * @param array<string, mixed> $variables
     */
    public function __construct(
        private readonly string $story,
        private readonly ?string $componentClass,
        private array $variables,
    ) {
    }

    public function getStory(): string
    {
        return $this->story;
    }

    public function getComponentClass(): ?string
    {
        return $this->componentClass;
    }

    /**
     * @return array<string, mixed>
     */
    public function getVariables(): array
    {
        return $this->variables;
    }

    /**
     * @param array<string, mixed> $variables
     */
    public function setVariables(array $variables): void
    {
        $this->variables = $variables;
    }
}
