<?php

namespace Storybook\Tests\Fixtures\SandboxTest;

class UnauthorizedVariable
{
    public string $foo = '';

    private string $bar = '';

    public function getBar(): string
    {
        return $this->bar;
    }
}
