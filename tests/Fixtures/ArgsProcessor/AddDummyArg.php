<?php

namespace Storybook\Tests\Fixtures\ArgsProcessor;

use Storybook\Attributes\AsArgsProcessor;

#[AsArgsProcessor('args-processor')]
class AddDummyArg
{
    public function __invoke(array &$args): void
    {
        $args += ['dummy' => 'foo'];
    }
}
