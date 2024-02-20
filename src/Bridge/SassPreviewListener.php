<?php

namespace Storybook\Bridge;

use Symfonycasts\SassBundle\SassBuilder;

class SassPreviewListener
{
    public function __construct(private readonly SassBuilder $builder)
    {
    }

    public function __invoke(): void
    {
        $process = $this->builder->runBuild(false);
        $process->wait();
        if (!$process->isSuccessful()) {
            throw new \RuntimeException(sprintf('SASS build failed: %s', $process->getErrorOutput()));
        }
    }
}
