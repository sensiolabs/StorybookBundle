<?php

namespace Storybook\Tests\Fixtures\SandboxTest;

class DummyVariable
{
    public string $authorizedProperty = '';

    public string $unauthorizedProperty = '';

    private string $authorizedPrivateProperty = '';

    private string $unauthorizedPrivateProperty = '';

    public function getAuthorizedPrivateProperty(): string
    {
        return $this->authorizedPrivateProperty;
    }

    public function getUnauthorizedPrivateProperty(): string
    {
        return $this->unauthorizedPrivateProperty;
    }

    public function authorizedMethod(): void
    {
    }

    public function unauthorizedMethod(): void
    {
    }
}
