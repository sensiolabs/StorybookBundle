<?php

namespace Storybook\Mock;

/**
 * Context passed to mock methods when they are called, providing
 * a reference to the component and the original arguments.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
final class MockInvocationContext
{
    public function __construct(
        public readonly object $component,
        public readonly array $originalArgs,
    ) {
    }
}
