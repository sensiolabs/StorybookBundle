<?php

namespace Storybook\Bridge;

use Symfonycasts\TailwindBundle\TailwindBuilder;

/**
 * Triggers Tailwind build when preview is generated.
 *
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @internal
 */
class TailwindPreviewListener
{
    public function __construct(private readonly TailwindBuilder $builder)
    {
    }

    public function __invoke(): void
    {
        $process = $this->builder->runBuild(false, false);
        $process->wait();
        if (!$process->isSuccessful()) {
            throw new \RuntimeException(sprintf('Tailwind build failed: %s', $process->getErrorOutput()));
        }
    }
}
