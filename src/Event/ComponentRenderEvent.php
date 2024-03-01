<?php

namespace Storybook\Event;

final class ComponentRenderEvent
{
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

    public function getVariables(): array
    {
        return $this->variables;
    }

    public function setVariables(array $variables): void
    {
        $this->variables = $variables;
    }
}
