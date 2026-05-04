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
        /** @var array<string, string> */
        public readonly array $globalMocks,
        /** @var array<string, array<string, string>> */
        public readonly array $storiesMocks,
    ) {
    }
}
