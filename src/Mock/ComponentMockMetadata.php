<?php

namespace Storybook\Mock;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
final class ComponentMockMetadata
{
    public function __construct(
        public readonly string $service,
        public readonly array $globalMocks,
        public readonly array $storiesMocks,
    ) {
    }
}
