<?php

namespace Storybook\ArgsProcessor;

use Storybook\Args;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 */
interface ArgsProcessorInterface
{
    public function __invoke(Args $args): void;
}
