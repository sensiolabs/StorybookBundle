<?php

namespace Storybook\Tests\Fixtures\ArgsProcessor;

use Storybook\Args;
use Storybook\ArgsProcessor\ArgsProcessorInterface;
use Storybook\Attributes\AsArgsProcessor;

#[AsArgsProcessor('args-processor')]
class AddDummyArg implements ArgsProcessorInterface
{
    public function __invoke(Args $args): void
    {
        $args['dummy'] = 'foo';
    }
}
